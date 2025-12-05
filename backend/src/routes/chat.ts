import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { Message } from '../models/Message.js';

const router = Router();

router.get('/:userId/messages', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.userId;

        if (!currentUserId) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
            });
            return;
        }

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId },
            ],
        })
            .sort({ createdAt: 1 })
            .lean();

        res.json({
            success: true,
            messages,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to load messages',
        });
    }
});

export default router;

