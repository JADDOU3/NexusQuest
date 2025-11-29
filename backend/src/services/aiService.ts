import OpenAI from 'openai';
import Groq from 'groq-sdk';
import axios from 'axios';

// Initialize AI clients
let openai: OpenAI | null = null;
let groq: Groq | null = null;

// Try Groq first (FREE, FAST, NO LIMITS!) 🚀
try {
  // Using a free API key - no signup needed!
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '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'
  });
  console.log('✅ Groq AI configured (Free & Fast!)');
} catch (error) {
  console.warn('⚠️ Groq AI failed to initialize');
}

// Try OpenAI as backup
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI API configured');
  }
} catch (error) {
  console.warn('⚠️ OpenAI API not configured');
}

if (!groq && !openai) {
  console.warn('⚠️ No AI API configured. Using fallback suggestions.');
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

  // Try Groq first - SUPER FAST & FREE! 🚀
  if (groq) {
    try {
      const systemPrompt = `You are an expert ${language} coding assistant. Help developers understand, debug, and improve code. Be concise, friendly, and practical. When showing code, use markdown code blocks.`;

      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history
      if (history && history.length > 0) {
        history.slice(-4).forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      // Add current message with code context
      let userMessage = message;
      if (currentCode && (
        message.toLowerCase().includes('code') ||
        message.toLowerCase().includes('this') ||
        message.toLowerCase().includes('explain') ||
        message.toLowerCase().includes('bug') ||
        message.toLowerCase().includes('error') ||
        message.toLowerCase().includes('fix') ||
        message.toLowerCase().includes('optimize') ||
        message.toLowerCase().includes('print') ||
        message.toLowerCase().includes('write') ||
        message.toLowerCase().includes('create') ||
        message.toLowerCase().includes('بدي') ||
        message.toLowerCase().includes('كود')
      )) {
        userMessage = `${message}\n\nCurrent code:\n\`\`\`${language}\n${currentCode}\n\`\`\``;
      }

      messages.push({ role: 'user', content: userMessage });

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Fast & smart model
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const text = response.choices[0]?.message?.content;
      if (text) {
        console.log('✅ Groq AI responded successfully!');
        return text;
      }
    } catch (error: any) {
      console.error('❌ Groq AI failed:', error.message);
    }
  }

  // Try HuggingFace as backup
  if (false) {
    try {
      // Build prompt with context
      let prompt = `You are an expert ${language} coding assistant. Help developers with their code.\n\n`;
      
      // Add history
      if (history && history.length > 0) {
        history.slice(-2).forEach(msg => {
          prompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
        });
      }
      
      // Add current message
      let userMessage = message;
      if (currentCode && currentCode.trim() && (
        message.toLowerCase().includes('code') ||
        message.toLowerCase().includes('this') ||
        message.toLowerCase().includes('explain') ||
        message.toLowerCase().includes('bug') ||
        message.toLowerCase().includes('error') ||
        message.toLowerCase().includes('fix') ||
        message.toLowerCase().includes('optimize') ||
        message.toLowerCase().includes('print') ||
        message.toLowerCase().includes('write') ||
        message.toLowerCase().includes('create')
      )) {
        userMessage = `${message}\n\nCode:\n${currentCode}`;
      }
      
      prompt += `Human: ${userMessage}\nAssistant:`;
      
      // Use HuggingFace Inference API with a free model
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            top_p: 0.9
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      const text = response.data[0]?.generated_text || response.data.generated_text;
      if (text) {
        return text.trim();
      }
    } catch (error: any) {
      console.error('HuggingFace AI failed:', error.message);
      // Continue to other methods
    }
  }

  // Try Gemini using REST API directly (v1, not v1beta)
  if (process.env.GEMINI_API_KEY) {
    try {
      const systemContext = `You are an expert ${language} coding assistant. Help developers understand, debug, and improve code. Be concise and practical.`;
      
      // Build conversation context
      let prompt = systemContext + '\n\n';
      
      // Add history
      if (history && history.length > 0) {
        history.slice(-4).forEach(msg => {
          prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
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
        message.toLowerCase().includes('optimize') ||
        message.toLowerCase().includes('print') ||
        message.toLowerCase().includes('write') ||
        message.toLowerCase().includes('create')
      )) {
        userMessage = `${message}\n\nCurrent code context:\n\`\`\`${language}\n${currentCode}\n\`\`\``;
      }
      
      prompt += `User: ${userMessage}\n\nAssistant:`;
      
      // Use REST API directly with v1 endpoint
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (error: any) {
      console.error('Gemini AI failed:', error.response?.data || error.message);
    }
  }

  if (openai) {
    try {
      const systemPrompt = `You are an expert coding assistant for ${language}. You help developers understand, debug, and improve their code.
Be concise, friendly, and practical. When showing code examples, use markdown code blocks with the language specified.`;

      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history
      if (history && history.length > 0) {
        history.slice(-4).forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      // Add current message with code context
      let userMessage = message;
      if (currentCode && (
        message.toLowerCase().includes('code') ||
        message.toLowerCase().includes('this') ||
        message.toLowerCase().includes('explain') ||
        message.toLowerCase().includes('bug') ||
        message.toLowerCase().includes('error') ||
        message.toLowerCase().includes('fix') ||
        message.toLowerCase().includes('optimize') ||
        message.toLowerCase().includes('print') ||
        message.toLowerCase().includes('write')
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
      console.error('OpenAI chat failed:', error);
    }
  }

  return getFallbackChatResponse(message, currentCode, language);
}

function getFallbackChatResponse(message: string, currentCode: string, language: string): string {
  const lowerMessage = message.toLowerCase();

  // Generate code requests
  if (lowerMessage.includes('print') || lowerMessage.includes('output') || lowerMessage.includes('display')) {
    const match = message.match(/print\s+["']?(\w+)["']?/i) || message.match(/output\s+["']?(\w+)["']?/i);
    const textToPrint = match ? match[1] : 'Hello World';
    
    if (language === 'java') {
      return `Here's the Java code to print "${textToPrint}":\n\n\`\`\`java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("${textToPrint}");\n    }\n}\n\`\`\``;
    } else if (language === 'python') {
      return `Here's the Python code to print "${textToPrint}":\n\n\`\`\`python\nprint("${textToPrint}")\n\`\`\``;
    } else if (language === 'javascript') {
      return `Here's the JavaScript code to print "${textToPrint}":\n\n\`\`\`javascript\nconsole.log("${textToPrint}");\n\`\`\``;
    } else if (language === 'cpp') {
      return `Here's the C++ code to print "${textToPrint}":\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "${textToPrint}" << endl;\n    return 0;\n}\n\`\`\``;
    }
  }

  // Loop/iteration requests
  if (lowerMessage.includes('loop') || lowerMessage.includes('for') || lowerMessage.includes('iterate')) {
    if (language === 'java') {
      return `Here's a Java loop example:\n\n\`\`\`java\nfor (int i = 0; i < 10; i++) {\n    System.out.println("Number: " + i);\n}\n\`\`\``;
    } else if (language === 'python') {
      return `Here's a Python loop example:\n\n\`\`\`python\nfor i in range(10):\n    print(f"Number: {i}")\n\`\`\``;
    }
  }

  // Input requests
  if (lowerMessage.includes('input') || lowerMessage.includes('read') || lowerMessage.includes('scan')) {
    if (language === 'java') {
      return `Here's how to get user input in Java:\n\n\`\`\`java\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}\n\`\`\``;
    } else if (language === 'python') {
      return `Here's how to get user input in Python:\n\n\`\`\`python\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")\n\`\`\``;
    }
  }

  // Array/list requests
  if (lowerMessage.includes('array') || lowerMessage.includes('list')) {
    if (language === 'java') {
      return `Here's how to work with arrays in Java:\n\n\`\`\`java\nint[] numbers = {1, 2, 3, 4, 5};\n\nfor (int num : numbers) {\n    System.out.println(num);\n}\n\`\`\``;
    } else if (language === 'python') {
      return `Here's how to work with lists in Python:\n\n\`\`\`python\nnumbers = [1, 2, 3, 4, 5]\n\nfor num in numbers:\n    print(num)\n\`\`\``;
    }
  }

  // Function/method requests
  if (lowerMessage.includes('function') || lowerMessage.includes('method')) {
    if (language === 'java') {
      return `Here's how to create a method in Java:\n\n\`\`\`java\npublic static int add(int a, int b) {\n    return a + b;\n}\n\n// Usage:\nint result = add(5, 3);\nSystem.out.println(result); // Output: 8\n\`\`\``;
    } else if (language === 'python') {
      return `Here's how to create a function in Python:\n\n\`\`\`python\ndef add(a, b):\n    return a + b\n\n# Usage:\nresult = add(5, 3)\nprint(result)  # Output: 8\n\`\`\``;
    }
  }

  if (lowerMessage.includes('explain')) {
    if (currentCode.trim()) {
      return `This ${language} code appears to perform operations. Let me break it down:\n\n• It uses ${language} syntax\n• Contains ${currentCode.split('\\n').length} lines\n\n💡 For detailed AI-powered explanations with Gemini (FREE), get your key at: https://makersuite.google.com/app/apikey`;
    }
    return `I'd be happy to explain code! Please write some code first, then ask me to explain it.\n\n💡 For AI-powered explanations, get a free Gemini API key at: https://makersuite.google.com/app/apikey`;
  }

  if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
    return `Common ${language} issues:\n\n• Syntax errors (brackets, semicolons, colons)\n• Variable not defined\n• Type mismatches\n• Logic errors\n\n💡 For AI-powered debugging with Gemini (FREE): https://makersuite.google.com/app/apikey`;
  }

  if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
    return `${language} optimization tips:\n\n• Use efficient algorithms\n• Avoid nested loops\n• Cache calculations\n• Use built-in methods\n\n💡 Get free AI-powered suggestions with Gemini: https://makersuite.google.com/app/apikey`;
  }

  // Greeting responses
  if (lowerMessage.match(/^(hi|hello|hey|hie)$/)) {
    return `Hello! 👋 I'm your ${language} coding assistant.\n\nI can help you:\n• Write code (try: "give me code to print Hello")\n• Explain code\n• Fix bugs\n• Create loops, functions, arrays\n• Handle user input\n\nWhat would you like to create?`;
  }

  return `I'm ready to help with ${language} coding! Try asking:\n\n• "give me code to print [text]"\n• "how to create a loop"\n• "show me how to get user input"\n• "create a function to add numbers"\n\n💡 For advanced AI features with Gemini (FREE): https://makersuite.google.com/app/apikey`;
}

