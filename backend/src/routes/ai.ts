import { Router, Request, Response } from 'express';
import { getAiCompletions, getInlineSuggestion } from '../services/aiService.js';

const router = Router();

/**
 * POST /api/ai/completions
 * Get AI-powered code completions
 */
router.post('/completions', async (req: Request, res: Response) => {
  try {
    const { code, cursorPosition, language } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    if (!cursorPosition || typeof cursorPosition.line !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Cursor position is required',
      });
    }

    const result = await getAiCompletions({
      code,
      cursorPosition,
      language: language || 'python',
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('AI completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI completions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/ai/inline
 * Get single inline AI suggestion
 */
router.post('/inline', async (req: Request, res: Response) => {
  try {
    const { code, cursorLine } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    const suggestion = await getInlineSuggestion(code, cursorLine || 0);

    res.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    console.error('Inline suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inline suggestion',
    });
  }
});

export default router;
