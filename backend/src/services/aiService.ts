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
    
    // Create language-specific prompt
    const languageName = language === 'java' ? 'Java' : 'Python';
    const prompt = `You are an AI code completion assistant. Given the ${languageName} code context, suggest the next line(s) of code.
Only return the code suggestion, no explanations.

Context:
${beforeCursor}

Suggest the next line of code that would logically follow. Keep it concise (1-3 lines max).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are a helpful ${languageName} code completion assistant. Only respond with code, no explanations.` },
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
 * Java-specific fallback completions
 */
function getJavaFallbackCompletions(code: string, currentLine: string): CompletionResponse {
  const suggestions: string[] = [];

  // After main method declaration
  if (currentLine.includes('public static void main')) {
    suggestions.push(
      '        System.out.println("Hello, World!");',
      '        // Your code here',
      '        Scanner scanner = new Scanner(System.in);'
    );
  }
  
  // After class declaration
  else if (currentLine.includes('class ') && currentLine.endsWith('{')) {
    suggestions.push(
      '    public static void main(String[] args) {\n        \n    }',
      '    private int value;\n    \n    public void setValue(int value) {\n        this.value = value;\n    }',
      '    // Add your methods here'
    );
  }
  
  // After for loop
  else if (currentLine.includes('for ') && currentLine.endsWith('{')) {
    suggestions.push(
      '            System.out.println(i);',
      '            // Process item',
      '            result.add(i);'
    );
  }
  
  // After if statement
  else if (currentLine.includes('if ') && currentLine.endsWith('{')) {
    suggestions.push(
      '            return true;',
      '            System.out.println("Condition met");',
      '            // Handle condition'
    );
  }
  
  // Method declaration
  else if (currentLine.includes('public ') && currentLine.endsWith('{')) {
    suggestions.push(
      '        // TODO: Implement method',
      '        return null;',
      '        throw new UnsupportedOperationException("Not implemented");'
    );
  }
  
  // Try-catch
  else if (currentLine.trim() === 'try {') {
    suggestions.push(
      '            // Your code here\n        } catch (Exception e) {\n            e.printStackTrace();\n        }',
      '            // Code that might throw exception\n        } catch (IOException e) {\n            System.err.println("IO Error: " + e.getMessage());\n        }'
    );
  }
  
  // System.out
  else if (currentLine.includes('System.out.println')) {
    suggestions.push(
      'System.out.println("Value: " + value);',
      'System.out.println("Hello, World!");',
      'System.out.println(result);'
    );
  }
  
  // Default suggestions
  else {
    if (!code.includes('System.out.println')) {
      suggestions.push('System.out.println("Hello, World!");');
    }
    if (!code.includes('Scanner')) {
      suggestions.push('Scanner scanner = new Scanner(System.in);');
    }
    if (!code.includes('ArrayList')) {
      suggestions.push('ArrayList<String> list = new ArrayList<>();');
    }
  }

  return {
    suggestions: suggestions.slice(0, 3),
    isAiGenerated: false,
  };
}

/**
 * Fallback completions when AI is not available
 * Smart pattern-based suggestions
 */
function getFallbackCompletions(request: CompletionRequest): CompletionResponse {
  const { code, cursorPosition, language } = request;
  const lines = code.split('\n');
  const currentLine = (lines[cursorPosition.line] || '').trim();
  const suggestions: string[] = [];

  // Java-specific patterns
  if (language === 'java') {
    return getJavaFallbackCompletions(code, currentLine);
  }

  // Python pattern-based intelligent suggestions
  
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
export async function getInlineSuggestion(code: string, cursorLine: number, language: string = 'python'): Promise<string> {
  const completions = await getAiCompletions({
    code,
    cursorPosition: { line: cursorLine, column: 0 },
    language: language,
  });

  return completions.suggestions[0] || '';
}

/**
 * Analyze error and provide AI-powered fix suggestions
 */
export async function getErrorSuggestions(error: string, code: string, language: string): Promise<{ suggestions: string[]; explanation: string }> {
  if (!openai) {
    return getFallbackErrorSuggestions(error, language);
  }

  try {
    const languageName = language === 'java' ? 'Java' : 'Python';
    const prompt = `You are a ${languageName} debugging assistant. Analyze this error and provide:
1. A brief explanation of what caused the error
2. 2-3 specific suggestions to fix it

Error:
${error}

Code:
${code}

Format your response as:
EXPLANATION: [brief explanation]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || '';
    const explanationMatch = content.match(/EXPLANATION:\s*(.+?)(?=SUGGESTIONS:|$)/s);
    const suggestionsMatch = content.match(/SUGGESTIONS:\s*(.+)/s);

    const explanation = explanationMatch ? explanationMatch[1].trim() : 'Error analysis not available';
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1]
          .split('\n')
          .filter(s => s.trim().startsWith('-'))
          .map(s => s.replace(/^-\s*/, '').trim())
      : [];

    return { explanation, suggestions };
  } catch (err) {
    console.error('AI error analysis failed:', err);
    return getFallbackErrorSuggestions(error, language);
  }
}



// Fallback error suggestions
function getFallbackErrorSuggestions(error: string, language: string): { suggestions: string[]; explanation: string } {
  const suggestions: string[] = [];
  let explanation = '';

  if (language === 'python') {
    if (error.includes('SyntaxError')) {
      explanation = 'Syntax error detected - check for missing colons, parentheses, or indentation issues';
      suggestions.push(
        'Check for missing colons after if/for/def statements',
        'Verify proper indentation (use 4 spaces)',
        'Ensure all parentheses and brackets are closed'
      );
    } else if (error.includes('NameError')) {
      explanation = 'Variable or function not found - it may not be defined yet';
      suggestions.push(
        'Define the variable before using it',
        'Check for typos in variable names',
        'Make sure imports are at the top of the file'
      );
    } else if (error.includes('TypeError')) {
      explanation = 'Operation attempted on incompatible types';
      suggestions.push(
        'Convert types using int(), str(), or float()',
        'Check function argument types',
        'Verify the data type before operations'
      );
    } else {
      explanation = 'An error occurred during execution';
      suggestions.push(
        'Read the error message carefully',
        'Check the line number mentioned in the error',
        'Try adding print statements to debug'
      );
    }
  } else if (language === 'java') {
    if (error.includes('NoSuchElementException')) {
      explanation = 'Scanner tried to read input but none was available';
      suggestions.push(
        'Provide input values before running',
        'Check if you have enough inputs for all Scanner calls',
        'Verify input format matches what Scanner expects'
      );
    } else if (error.includes('NullPointerException')) {
      explanation = 'Trying to use an object that is null';
      suggestions.push(
        'Initialize the object before using it',
        'Check if the object is null before calling methods',
        'Use Optional or defensive null checks'
      );
    } else if (error.includes('ArrayIndexOutOfBoundsException')) {
      explanation = 'Array index is outside valid range';
      suggestions.push(
        'Check array length before accessing',
        'Use array.length - 1 for last element',
        'Verify loop conditions'
      );
    } else {
      explanation = 'A runtime error occurred';
      suggestions.push(
        'Review the stack trace for the error location',
        'Add try-catch blocks for error handling',
        'Check input validation'
      );
    }
  }

  return { explanation, suggestions: suggestions.slice(0, 3) };
}

/**
 * AI Chat Assistant
 */
interface ChatRequest {
  message: string;
  currentCode: string;
  language: string;
  history: Array<{ role: string; content: string }>;
}

export async function getChatResponse(request: ChatRequest): Promise<string> {
  const { message, currentCode, language, history } = request;

  if (!openai) {
    return getFallbackChatResponse(message, currentCode, language);
  }

  try {
    const systemPrompt = `You are an expert coding assistant for ${language}. You help developers understand, debug, and improve their code.
Be concise, friendly, and practical. When showing code examples, use markdown code blocks with the language specified.
Current context: The developer is working on ${language} code.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 4 messages)
    if (history && history.length > 0) {
      history.slice(-4).forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message with code context if relevant
    let userMessage = message;
    if (currentCode && (
      message.toLowerCase().includes('code') ||
      message.toLowerCase().includes('this') ||
      message.toLowerCase().includes('explain') ||
      message.toLowerCase().includes('bug') ||
      message.toLowerCase().includes('error') ||
      message.toLowerCase().includes('fix') ||
      message.toLowerCase().includes('optimize')
    )) {
      userMessage = `${message}\n\nCurrent code:\n\`\`\`${language}\n${currentCode}\n\`\`\``;
    }

    messages.push({ role: 'user', content: userMessage });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('AI chat failed:', error);
    return getFallbackChatResponse(message, currentCode, language);
  }
}

function getFallbackChatResponse(message: string, currentCode: string, language: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('explain')) {
    return `I'd be happy to explain the code! This ${language} code performs operations based on its structure. For detailed AI-powered explanations, please configure an OpenAI API key.`;
  }

  if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
    return `Common issues to check in ${language}:\n\n• Syntax errors (missing colons, brackets, semicolons)\n• Variable scope issues\n• Type mismatches\n• Logic errors in conditions\n\nFor AI-powered debugging, please configure an OpenAI API key.`;
  }

  if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
    return `To optimize ${language} code:\n\n• Use efficient data structures\n• Avoid nested loops when possible\n• Cache repeated calculations\n• Use built-in functions\n\nFor AI-powered optimization suggestions, please configure an OpenAI API key.`;
  }

  if (lowerMessage.includes('comment')) {
    return `Good code comments should:\n\n• Explain WHY, not what\n• Describe complex logic\n• Document function parameters and return values\n• Note important assumptions\n\nFor AI-powered comment generation, please configure an OpenAI API key.`;
  }

  return `I'm here to help with your ${language} coding! I can assist with:\n\n• Explaining code\n• Finding and fixing bugs\n• Optimizing performance\n• Writing new code\n• Adding documentation\n\nNote: For AI-powered responses, please configure an OpenAI API key in your environment.`;
}

