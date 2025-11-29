import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CodeEditor } from '../components/CodeEditor';
import { PlaygroundTerminal } from '../components/PlaygroundTerminal';
import { Button } from '../components/ui/button';
import { ArrowLeft, Play, Code2, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getStoredUser } from '../services/authService';
import { UserSidebar } from '../components/UserSidebar';

const DEFAULT_CODE: Record<string, string> = {
  python: `# Python Playground - Write and run code instantly!
print("Hello from Python!")

# Try it out:
name = input("Enter your name: ")
print(f"Welcome, {name}!")
`,
  javascript: `// JavaScript Playground - Write and run code instantly!
console.log("Hello from JavaScript!");

// Try it out:
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
`,
  java: `// Java Playground - Write and run code instantly!
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        
        // Try it out:
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Welcome, " + name + "!");
        scanner.close();
    }
}
`,
  cpp: `// C++ Playground - Write and run code instantly!
#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    
    // Try it out:
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Welcome, " << name << "!" << endl;
    
    return 0;
}
`,
};

export function Playground() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const { theme, setTheme } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [executeFlag, setExecuteFlag] = useState(0);

  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        const token = localStorage.getItem('nexusquest-token');
        const response = await fetch('http://localhost:9876/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.user) {
          setAvatarImage(data.user.avatarImage || null);
        }
      } catch (error) {
        console.error('Failed to load user avatar:', error);
      }
    };
    loadUserAvatar();
  }, []);

  const handleLanguageChange = (newLanguage: 'python' | 'javascript' | 'java' | 'cpp') => {
    setLanguage(newLanguage);
    setCode(DEFAULT_CODE[newLanguage]);
  };

  const handleRunCode = () => {
    setExecuteFlag(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexusquest-token');
    localStorage.removeItem('nexusquest-user');
    navigate('/');
  };

  const languageOptions = [
    { value: 'python', label: 'Python', color: 'text-blue-400' },
    { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
    { value: 'java', label: 'Java', color: 'text-red-400' },
    { value: 'cpp', label: 'C++', color: 'text-purple-400' }
  ];

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`border-b ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm z-40`}>
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold">Quick Playground</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-800/50">
              {languageOptions.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value as any)}
                  className={`px-3 py-1.5 rounded transition-all ${
                    language === lang.value
                      ? 'bg-blue-600 text-white'
                      : `${lang.color} hover:bg-gray-700`
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Run Button */}
            <Button
              onClick={handleRunCode}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* User Menu */}
            <Button
              variant="ghost"
              onClick={() => setShowSidebar(true)}
              className="flex items-center gap-2"
            >
              {avatarImage ? (
                <img src={avatarImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="hidden md:inline">{user?.name}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Editor and Terminal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeEditor
            value={code}
            language={language}
            onChange={(value) => setCode(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            height="100%"
          />
        </div>

        {/* Terminal */}
        <div className="w-1/2 border-l border-gray-800 flex flex-col overflow-hidden">
          <PlaygroundTerminal
            language={language}
            code={code}
            executeFlag={executeFlag}
            theme={theme}
          />
        </div>
      </div>

      {/* User Sidebar */}
      <UserSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}
