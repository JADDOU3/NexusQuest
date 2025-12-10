import { Server, Socket } from 'socket.io';
import { CollaborationSession } from '../models/CollaborationSession.js';
import { CollaborationMessage } from '../models/CollaborationMessage.js';
import { v4 as uuidv4 } from 'uuid';

// User colors for cursor tracking
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  '#FF8FA3', '#6C5CE7', '#00B894', '#FDCB6E', '#E17055'
];

let colorIndex = 0;

interface CollaborationChange {
  sessionId: string;
  userId: string;
  username: string;
  changes: {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
    text: string[];
    removed?: string[];
  };
  timestamp: number;
}

interface CursorPosition {
  sessionId: string;
  userId: string;
  username: string;
  cursor: {
    line: number;
    column: number;
  };
  color: string;
}

export function setupCollaboration(io: Server) {
  const collaborationNamespace = io.of('/collaboration');

  collaborationNamespace.on('connection', (socket: Socket) => {
    console.log('User connected to collaboration:', socket.id);

    // Join a collaboration session
    socket.on('join-session', async (data: {
      sessionId: string;
      userId: string;
      username: string;
    }) => {
      try {
        const session = await CollaborationSession.findOne({
          sessionId: data.sessionId,
          isActive: true,
        });

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Check if session is full
        const activeParticipants = session.participants.filter(p => p.isActive);
        if (activeParticipants.length >= session.maxParticipants) {
          socket.emit('error', { message: 'Session is full' });
          return;
        }

        // Check if user is already in session
        const existingParticipant = session.participants.find(
          p => p.userId.toString() === data.userId
        );

        const userColor = existingParticipant?.color || USER_COLORS[colorIndex++ % USER_COLORS.length];

        if (existingParticipant) {
          existingParticipant.isActive = true;
          existingParticipant.joinedAt = new Date();
        } else {
          session.participants.push({
            userId: data.userId as any,
            username: data.username,
            role: session.owner.toString() === data.userId ? 'owner' : 'editor',
            joinedAt: new Date(),
            isActive: true,
            color: userColor,
          } as any);
        }

        await session.save();

        // Join socket room
        socket.join(data.sessionId);

        // Store session info in socket
        (socket as any).sessionId = data.sessionId;
        (socket as any).userId = data.userId;
        (socket as any).username = data.username;

        // Send current session state to the user
        socket.emit('session-joined', {
          session: {
            sessionId: session.sessionId,
            name: session.name,
            code: session.code,
            language: session.language,
            participants: session.participants.filter(p => p.isActive),
            settings: session.settings,
          },
          userColor,
        });

        // Notify others
        socket.to(data.sessionId).emit('user-joined', {
          userId: data.userId,
          username: data.username,
          color: userColor,
        });

        // Send system message
        const systemMessage = await CollaborationMessage.create({
          sessionId: data.sessionId,
          userId: data.userId,
          username: 'System',
          message: `${data.username} joined the session`,
          type: 'system',
        });

        collaborationNamespace.to(data.sessionId).emit('chat-message', systemMessage);

      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle code changes
    socket.on('code-change', async (data: CollaborationChange) => {
      try {
        const session = await CollaborationSession.findOne({
          sessionId: data.sessionId,
          isActive: true,
        });

        if (!session) return;

        // Check if user has edit permission
        const participant = session.participants.find(
          p => p.userId.toString() === data.userId && p.isActive
        );

        if (!participant || (participant.role === 'viewer' && !session.settings.allowEdit)) {
          socket.emit('error', { message: 'No edit permission' });
          return;
        }

        // Broadcast change to others (not to sender)
        socket.to(data.sessionId).emit('code-change', data);

        // Update session code (debounced in real implementation)
        session.code = data.changes.text.join('\n');
        session.lastActivity = new Date();
        await session.save();

      } catch (error) {
        console.error('Error handling code change:', error);
      }
    });

    // Handle cursor movement
    socket.on('cursor-move', async (data: CursorPosition) => {
      try {
        const session = await CollaborationSession.findOne({
          sessionId: data.sessionId,
          isActive: true,
        });

        if (!session) return;

        // Update cursor position in database
        const participant = session.participants.find(
          p => p.userId.toString() === data.userId
        );

        if (participant) {
          participant.cursor = data.cursor;
          await session.save();
        }

        // Broadcast cursor position to others
        socket.to(data.sessionId).emit('cursor-move', data);

      } catch (error) {
        console.error('Error handling cursor move:', error);
      }
    });

    // Handle chat messages
    socket.on('chat-message', async (data: {
      sessionId: string;
      userId: string;
      username: string;
      message: string;
      type?: 'text' | 'code';
      metadata?: any;
    }) => {
      try {
        const message = await CollaborationMessage.create({
          sessionId: data.sessionId,
          userId: data.userId,
          username: data.username,
          message: data.message,
          type: data.type || 'text',
          metadata: data.metadata,
        });

        // Broadcast to all in session
        collaborationNamespace.to(data.sessionId).emit('chat-message', message);

      } catch (error) {
        console.error('Error sending chat message:', error);
      }
    });

    // Handle code execution request
    socket.on('execute-code', async (data: {
      sessionId: string;
      userId: string;
      code: string;
      language: string;
    }) => {
      // Broadcast execution request to all participants
      collaborationNamespace.to(data.sessionId).emit('code-executing', {
        userId: data.userId,
        language: data.language,
      });
    });

    // Handle execution results
    socket.on('execution-result', async (data: {
      sessionId: string;
      userId: string;
      result: any;
    }) => {
      // Broadcast results to all participants
      collaborationNamespace.to(data.sessionId).emit('execution-result', data);
    });

    // Handle user leaving
    socket.on('leave-session', async () => {
      await handleUserLeave(socket, collaborationNamespace);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      await handleUserLeave(socket, collaborationNamespace);
    });
  });
}

async function handleUserLeave(socket: Socket, namespace: any) {
  const sessionId = (socket as any).sessionId;
  const userId = (socket as any).userId;
  const username = (socket as any).username;

  if (!sessionId || !userId) return;

  try {
    const session = await CollaborationSession.findOne({
      sessionId,
      isActive: true,
    });

    if (session) {
      const participant = session.participants.find(
        p => p.userId.toString() === userId
      );

      if (participant) {
        participant.isActive = false;
      }

      await session.save();

      // Notify others
      socket.to(sessionId).emit('user-left', {
        userId,
        username,
      });

      // Send system message
      const systemMessage = await CollaborationMessage.create({
        sessionId,
        userId,
        username: 'System',
        message: `${username} left the session`,
        type: 'system',
      });

      namespace.to(sessionId).emit('chat-message', systemMessage);
    }

    socket.leave(sessionId);

  } catch (error) {
    console.error('Error handling user leave:', error);
  }
}

// Helper function to generate session ID
export function generateSessionId(): string {
  return uuidv4().slice(0, 8);
}
