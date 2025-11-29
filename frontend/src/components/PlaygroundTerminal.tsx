import { useState, useEffect, useRef } from 'react';

interface PlaygroundTerminalProps {
  language: 'python' | 'java' | 'javascript' | 'cpp';
  code: string;
  executeFlag: number;
  theme?: 'dark' | 'light';
}

interface TerminalLine {
  type: 'output' | 'error';
  content: string;
}

export function PlaygroundTerminal({ language, code, executeFlag, theme = 'dark' }: PlaygroundTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (executeFlag > 0 && code) {
      executeCode();
    }
  }, [executeFlag]);

  const executeCode = async () => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const newSessionId = `${Date.now()}`;
    setSessionId(newSessionId);
    setIsRunning(true);
    setLines([{ type: 'output', content: `▶️ Running ${language} code...\n` }]);

    try {
      const response = await fetch('http://localhost:9876/api/playground/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          sessionId: newSessionId
        })
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.type === 'output') {
                setLines(prev => [...prev, { type: 'output', content: data.content }]);
              } else if (data.type === 'error') {
                setLines(prev => [...prev, { type: 'error', content: data.content }]);
              } else if (data.type === 'end') {
                setLines(prev => [...prev, { type: 'output', content: '\n✓ Program finished\n' }]);
                setIsRunning(false);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error: any) {
      setLines(prev => [...prev, { type: 'error', content: `Error: ${error.message}\n` }]);
      setIsRunning(false);
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    // Display input in terminal
    setLines(prev => [...prev, { type: 'output', content: input + '\n' }]);

    try {
      await fetch('http://localhost:9876/api/playground/input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          input: input
        })
      });
      setInput('');
    } catch (error: any) {
      setLines(prev => [...prev, { type: 'error', content: `Failed to send input: ${error.message}\n` }]);
    }
  };

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Terminal</h3>
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-500">Running...</span>
            </div>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {lines.map((line, index) => (
          <div
            key={index}
            className={line.type === 'error' ? 'text-red-400' : 'whitespace-pre-wrap'}
          >
            {line.content}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input */}
      {isRunning && (
        <form onSubmit={handleInputSubmit} className={`border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-2`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input..."
              className={`flex-1 px-3 py-2 rounded font-mono text-sm ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
                  : 'bg-white text-gray-900 placeholder-gray-400 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
