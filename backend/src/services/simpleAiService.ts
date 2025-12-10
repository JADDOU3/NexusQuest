import Groq from 'groq-sdk';

interface ChatRequest { message: string; currentCode?: string; language: string; history?: Array<{ role: string; content: string }>; }

let groqClient: Groq | null = null;
try {
  if (process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('✅ Groq AI ready');
  } else {
    console.warn('⚠️ GROQ_API_KEY missing (fallback only)');
  }
} catch (e) {
  console.error('❌ Groq init failed', e);
  groqClient = null;
}

export async function getSimpleChatResponse(req: ChatRequest): Promise<string> {
  const { message, language, currentCode, history } = req;
  
  if (groqClient) {
    try {
      const systemPrompt = `You are an expert coding assistant that helps students learn programming.

Key Guidelines:
- Detect if the user writes in Arabic or English and respond in the same language
- If user writes in Arabic, respond in Arabic. If English, respond in English
- Be concise and educational
- When explaining code, break it down step by step
- When writing code, add helpful comments
- Support these languages: Python, Java, JavaScript, C++
- Format code blocks with triple backticks and language name
- If asked to fix bugs, explain what was wrong and why
- Encourage best practices and clean code

Current programming language context: ${language}`;

      const messages: any[] = [{ role: 'system', content: systemPrompt }];
      
      // Add conversation history for context
      (history || []).slice(-4).forEach(h => {
        messages.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content
        });
      });
      
      // Build user message with code context if relevant
      let userMsg = message;
      if (currentCode && currentCode.trim()) {
        const codeKeywords = /شرح|اشرح|explain|review|analyze|fix|bug|error|optimize|improve|كود|code/i;
        if (codeKeywords.test(message)) {
          userMsg += `\n\n[Current Code Context]:\n\`\`\`${language}\n${currentCode.slice(0, 800)}\n\`\`\``;
        }
      }
      
      messages.push({ role: 'user', content: userMsg });
      
      const completion = await groqClient.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      const response = completion.choices[0]?.message?.content?.trim();
      if (response) {
        console.log('✅ Groq AI response generated');
        return response;
      }
    } catch (err: any) {
      console.error('❌ Groq API error:', err.message || err);
      if (err.message?.includes('rate_limit')) {
        return 'عذراً، تم تجاوز حد الاستخدام. يرجى المحاولة بعد قليل.\n\nSorry, rate limit exceeded. Please try again in a moment.';
      }
    }
  } else {
    console.warn('⚠️ Groq API not configured, using fallback responses');
  }
  
  return fallback(message, language, currentCode);
}

function fallback(message: string, language: string, currentCode?: string): string {
  const m = message.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(message);
  
  // Greetings
  if (/^(hi|hello|hey|مرحبا|مرحباً|السلام|أهلا)$/i.test(m)) {
    return isArabic 
      ? `مرحباً! 👋 أنا مساعدك في البرمجة.\n\nيمكنني مساعدتك في:\n• شرح الكود\n• كتابة كود جديد\n• إيجاد الأخطاء وإصلاحها\n• تحسين الكود\n\nكيف يمكنني مساعدتك؟`
      : `Hello! 👋 I'm your coding assistant.\n\nI can help you with:\n• Explaining code\n• Writing new code\n• Finding and fixing bugs\n• Optimizing code\n\nHow can I help you today?`;
  }
  
  // Code explanation request
  if (/شرح|اشرح|explain|what.*does/i.test(m)) {
    if (currentCode && currentCode.trim()) {
      return isArabic
        ? `سأشرح لك الكود:\n\nهذا الكود مكتوب بلغة ${language}. يبدو أنه ${analyzeCodePurpose(currentCode, language)}.\n\nللحصول على شرح أكثر تفصيلاً، يرجى تفعيل Groq API في ملف .env`
        : `Let me explain this code:\n\nThis ${language} code appears to ${analyzeCodePurpose(currentCode, language)}.\n\nFor more detailed explanations, please configure Groq API in .env file`;
    }
    return isArabic
      ? 'الصق الكود الذي تريد شرحه، ثم اطلب مني شرحه.'
      : 'Please paste the code you want me to explain, then ask me to explain it.';
  }
  
  // Bug finding
  if (/bug|error|fix|مشكلة|خطأ|صلح/.test(m)) {
    return isArabic
      ? 'الصق الكود والخطأ الذي تواجهه، وسأساعدك في إصلاحه.\n\nملاحظة: للحصول على تحليل أفضل، قم بتفعيل Groq API.'
      : 'Paste your code and the error you\'re facing, and I\'ll help you fix it.\n\nNote: For better analysis, configure Groq API.';
  }
  
  // Code generation
  const sum = /يقرأ\s*رقمين|read\s+two\s+numbers|sum\s+two\s+numbers|جمع\s*رقمين/.test(m);
  if (/بدي كود|code|write|generate|اكتب|اعمل/.test(m) || sum) {
    return generateSampleCode(language, sum, isArabic);
  }
  
  // Default response
  return isArabic
    ? `يمكنني مساعدتك في:\n• شرح الكود - اكتب: "اشرح هذا الكود"\n• كتابة كود - اكتب: "بدي كود ${language}"\n• إصلاح الأخطاء - اكتب: "في عندي مشكلة"\n\n💡 نصيحة: للحصول على إجابات أفضل، قم بتفعيل Groq API في ملف .env`
    : `I can help you with:\n• Explain code - say: "explain this code"\n• Write code - say: "write ${language} code"\n• Fix bugs - say: "I have an error"\n\n💡 Tip: For better responses, configure Groq API in .env file`;
}

function analyzeCodePurpose(code: string, language: string): string {
  const c = code.toLowerCase();
  if (c.includes('print') || c.includes('console.log') || c.includes('system.out')) return 'prints output to console';
  if (c.includes('input') || c.includes('scanner') || c.includes('readline')) return 'reads user input';
  if (c.includes('for') || c.includes('while')) return 'uses loops for iteration';
  if (c.includes('if') || c.includes('else')) return 'uses conditional statements';
  if (c.includes('function') || c.includes('def ') || c.includes('void ')) return 'defines a function';
  if (c.includes('class ')) return 'defines a class';
  return 'performs some operations';
}

function generateSampleCode(language: string, isSum: boolean, isArabic: boolean): string {
  const intro = isArabic ? 'إليك مثال على كود' : 'Here\'s a sample code in';
  
  switch (language) {
    case 'python':
      return isSum
        ? `${intro} Python ${isArabic ? 'لجمع رقمين' : 'to sum two numbers'}:\n\n\`\`\`python\n# ${isArabic ? 'قراءة رقمين من المستخدم' : 'Read two numbers from user'}\na = int(input("${isArabic ? 'أدخل الرقم الأول' : 'Enter first number'}: "))\nb = int(input("${isArabic ? 'أدخل الرقم الثاني' : 'Enter second number'}: "))\n\n# ${isArabic ? 'حساب المجموع' : 'Calculate sum'}\nsum = a + b\n\n# ${isArabic ? 'طباعة النتيجة' : 'Print result'}\nprint(f"${isArabic ? 'المجموع' : 'Sum'}: {sum}")\n\`\`\``
        : `${intro} Python:\n\n\`\`\`python\n# ${isArabic ? 'برنامج بسيط' : 'Simple program'}\nname = input("${isArabic ? 'ما اسمك؟' : 'What is your name?'} ")\nprint(f"${isArabic ? 'مرحباً' : 'Hello'}, {name}!")\n\`\`\``;
    
    case 'java':
      return isSum
        ? `${intro} Java ${isArabic ? 'لجمع رقمين' : 'to sum two numbers'}:\n\n\`\`\`java\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        \n        // ${isArabic ? 'قراءة رقمين' : 'Read two numbers'}\n        System.out.print("${isArabic ? 'أدخل الرقم الأول' : 'Enter first number'}: ");\n        int a = scanner.nextInt();\n        \n        System.out.print("${isArabic ? 'أدخل الرقم الثاني' : 'Enter second number'}: ");\n        int b = scanner.nextInt();\n        \n        // ${isArabic ? 'حساب وطباعة المجموع' : 'Calculate and print sum'}\n        int sum = a + b;\n        System.out.println("${isArabic ? 'المجموع' : 'Sum'}: " + sum);\n    }\n}\n\`\`\``
        : `${intro} Java:\n\n\`\`\`java\npublic class Main {\n    public static void main(String[] args) {\n        // ${isArabic ? 'طباعة رسالة' : 'Print message'}\n        System.out.println("${isArabic ? 'مرحباً بك في Java!' : 'Welcome to Java!'}");\n    }\n}\n\`\`\``;
    
    case 'javascript':
      return isSum
        ? `${intro} JavaScript ${isArabic ? 'لجمع رقمين' : 'to sum two numbers'}:\n\n\`\`\`javascript\n// ${isArabic ? 'قراءة رقمين من المستخدم' : 'Read two numbers from user'}\nconst a = parseInt(prompt('${isArabic ? 'أدخل الرقم الأول' : 'Enter first number'}'));\nconst b = parseInt(prompt('${isArabic ? 'أدخل الرقم الثاني' : 'Enter second number'}'));\n\n// ${isArabic ? 'حساب المجموع' : 'Calculate sum'}\nconst sum = a + b;\n\n// ${isArabic ? 'عرض النتيجة' : 'Display result'}\nalert('${isArabic ? 'المجموع' : 'Sum'}: ' + sum);\n\`\`\``
        : `${intro} JavaScript:\n\n\`\`\`javascript\n// ${isArabic ? 'برنامج بسيط' : 'Simple program'}\nconst name = prompt('${isArabic ? 'ما اسمك؟' : 'What is your name?'}');\nconsole.log('${isArabic ? 'مرحباً' : 'Hello'}, ' + name + '!');\n\`\`\``;
    
    case 'cpp':
      return isSum
        ? `${intro} C++ ${isArabic ? 'لجمع رقمين' : 'to sum two numbers'}:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    \n    // ${isArabic ? 'قراءة رقمين' : 'Read two numbers'}\n    cout << "${isArabic ? 'أدخل الرقم الأول' : 'Enter first number'}: ";\n    cin >> a;\n    \n    cout << "${isArabic ? 'أدخل الرقم الثاني' : 'Enter second number'}: ";\n    cin >> b;\n    \n    // ${isArabic ? 'حساب وطباعة المجموع' : 'Calculate and print sum'}\n    int sum = a + b;\n    cout << "${isArabic ? 'المجموع' : 'Sum'}: " << sum << endl;\n    \n    return 0;\n}\n\`\`\``
        : `${intro} C++:\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // ${isArabic ? 'طباعة رسالة' : 'Print message'}\n    cout << "${isArabic ? 'مرحباً بك في C++!' : 'Welcome to C++!'}" << endl;\n    return 0;\n}\n\`\`\``;
    
    default:
      return isArabic
        ? `اللغة ${language} غير مدعومة حالياً. اللغات المدعومة: Python, Java, JavaScript, C++`
        : `Language ${language} is not supported yet. Supported: Python, Java, JavaScript, C++`;
  }
}
