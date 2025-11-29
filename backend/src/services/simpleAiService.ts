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
      const messages: any[] = [ { role: 'system', content: `You are a bilingual (${language}) coding assistant. Use Arabic if user writes Arabic.` } ];
      (history || []).slice(-3).forEach(h => messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content }));
      let userMsg = message;
      if (currentCode && currentCode.trim() && /شرح|اشرح|explain|code|كود/i.test(message)) {
        userMsg += `\n\nCode context (truncated):\n\"\"\"${language}\n${currentCode.slice(0, 600)}\n\"\"\"`;
      }
      messages.push({ role: 'user', content: userMsg });
      const completion = await groqClient.chat.completions.create({ model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant', messages, max_tokens: 700 });
      const out = completion.choices[0]?.message?.content?.trim();
      if (out) return out;
    } catch (err: any) {
      console.error('Groq error:', err.message || err);
    }
  }
  return fallback(message, language);
}

function fallback(message: string, language: string): string {
  const m = message.toLowerCase();
  if (/^(hi|hello|hey|مرحبا|مرحباً|السلام)$/i.test(m)) return `مرحبا! اطلب: بدي كود ${language} أو اشرح.`;
  if (/شرح|اشرح|explain/.test(m)) return 'الصق الكود ثم اطلب: اشرح الكود.';
  const sum = /يقرأ\s*رقمين|read\s+two\s+numbers|sum\s+two\s+numbers/.test(m);
  if (/بدي كود|code|write|generate|اكتب/.test(m) || sum) {
    switch (language) {
      case 'python': return sum ? `Python:\n\"\"\"python\na=int(input());b=int(input());print(a+b)\n\"\"\"` : `Python:\n\"\"\"python\nprint('مرحبا')\n\"\"\"`;
      case 'java': return sum ? `Java:\n\"\"\"java\nimport java.util.*;class Main{public static void main(String[]a){Scanner s=new Scanner(System.in);int x=s.nextInt(),y=s.nextInt();System.out.println(x+y);}}\n\"\"\"` : `Java:\n\"\"\"java\npublic class Main{public static void main(String[]a){System.out.println("مرحبا");}}\n\"\"\"`;
      case 'javascript': return sum ? `JS:\n\"\"\"javascript\nconst a=+prompt('رقم1');const b=+prompt('رقم2');alert(a+b);\n\"\"\"` : `JS:\n\"\"\"javascript\nconsole.log('مرحبا');\n\"\"\"`;
      case 'cpp': return sum ? `C++:\n\"\"\"cpp\n#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b;}\n\"\"\"` : `C++:\n\"\"\"cpp\n#include <iostream>\nint main(){std::cout<<"مرحبا";}\n\"\"\"`;
      default: return `اكتب اللغة في طلبك (مثال: بدي كود python).`;
    }
  }
  return `اسألني عن كود أو قل: بدي كود ${language}.`;
}
