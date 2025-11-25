import OpenAI from 'openai';

// Initialize OpenAI client (will use API key from environment variable)
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('⚠️ OpenAI API not configured. AI completions will use fallback suggestions.');
}

interface CompletionRequest {
  code: string;
  cursorPosition: { line: number; column: number };
  language: string;
}

interface CompletionResponse {
  suggestions: string[];
  isAiGenerated: boolean;
}

/**
 * Get AI-powered code completions
 */
export async function getAiCompletions(request: CompletionRequest): Promise<CompletionResponse> {
  // If OpenAI is not configured, return smart fallback suggestions
  if (!openai) {
    return getFallbackCompletions(request);
  }

  try {
    const { code, cursorPosition, language } = request;
    
    // Extract context around cursor
    const lines = code.split('\n');
    const currentLine = lines[cursorPosition.line] || '';
    const beforeCursor = lines.slice(Math.max(0, cursorPosition.line - 5), cursorPosition.line + 1).join('\n');
    
    // Create prompt for AI
    const prompt = `You are an AI code completion assistant. Given the Python code context, suggest the next line(s) of code.
Only return the code suggestion, no explanations.

Context:
${beforeCursor}

Suggest the next line of code that would logically follow. Keep it concise (1-3 lines max).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful Python code completion assistant. Only respond with code, no explanations.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.3,
      n: 3, // Get 3 suggestions
    });

    const suggestions = completion.choices
      .map(choice => choice.message.content?.trim() || '')
      .filter(s => s.length > 0);

    return {
      suggestions,
      isAiGenerated: true,
    };
  } catch (error) {
    console.error('AI completion error:', error);
    return getFallbackCompletions(request);
  }
}

/**
 * Fallback completions when AI is not available
 * Smart pattern-based suggestions
 */
function getFallbackCompletions(request: CompletionRequest): CompletionResponse {
  const { code, cursorPosition } = request;
  const lines = code.split('\n');
  const currentLine = (lines[cursorPosition.line] || '').trim();
  const suggestions: string[] = [];

  // Pattern-based intelligent suggestions
  
  // After for loop, suggest body
  if (currentLine.startsWith('for ') && currentLine.endsWith(':')) {
    suggestions.push('    print(item)', '    result.append(item)', '    process(item)');
  }
  
  // After function definition, suggest docstring and body
  else if (currentLine.startsWith('def ') && currentLine.endsWith(':')) {
    const funcName = currentLine.match(/def\s+(\w+)/)?.[1] || 'function';
    suggestions.push(
      `    """${funcName} description"""\n    pass`,
      `    """TODO: Implement ${funcName}"""\n    return None`,
      '    pass'
    );
  }
  
  // After if statement, suggest common patterns
  else if (currentLine.startsWith('if ') && currentLine.endsWith(':')) {
    suggestions.push('    return True', '    pass', '    result = True');
  }
  
  // After class definition, suggest __init__
  else if (currentLine.startsWith('class ') && currentLine.endsWith(':')) {
    suggestions.push(
      '    def __init__(self):\n        pass',
      '    def __init__(self, name):\n        self.name = name',
      '    pass'
    );
  }
  
  // After try, suggest except
  else if (currentLine === 'try:') {
    suggestions.push('    # Your code here\n    pass\nexcept Exception as e:\n    print(f"Error: {e}")');
  }
  
  // List/dict operations
  else if (currentLine.includes('[') && !currentLine.includes(']')) {
    suggestions.push('1, 2, 3, 4, 5]', '"item1", "item2", "item3"]', ']');
  }
  
  // Print statements
  else if (currentLine.startsWith('print(')) {
    suggestions.push('f"Value: {value}")', '"Hello, World!")', 'result)');
  }
  
  // Variable assignments - suggest common next steps
  else if (currentLine.includes('=') && !currentLine.includes('==')) {
    const varName = currentLine.split('=')[0].trim();
    suggestions.push(
      `print(${varName})`,
      `if ${varName}:`,
      `return ${varName}`
    );
  }
  
  // Default suggestions based on common patterns
  else {
    // Analyze what's in the code to make smart suggestions
    if (!code.includes('print(')) {
      suggestions.push('print("Hello, World!")');
    }
    if (!code.includes('def ') && code.split('\n').length > 5) {
      suggestions.push('def main():\n    pass');
    }
    if (!code.includes('if __name__')) {
      suggestions.push('if __name__ == "__main__":\n    main()');
    }
  }

  return {
    suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
    isAiGenerated: false,
  };
}

/**
 * Get inline AI suggestion for the current context
 * This provides a single, most likely completion
 */
export async function getInlineSuggestion(code: string, cursorLine: number): Promise<string> {
  const completions = await getAiCompletions({
    code,
    cursorPosition: { line: cursorLine, column: 0 },
    language: 'python',
  });

  return completions.suggestions[0] || '';
}
