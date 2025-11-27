import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2, Play, Terminal, Zap, Shield, Globe } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">NexusQuest IDE</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Code Anywhere, <span className="text-blue-500">Run Instantly</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          A powerful online IDE supporting Python, C++, Java, and JavaScript. 
          Write, execute, and debug your code with real-time interactive terminal.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/signup')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6"
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6"
          >
            Try Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why Choose NexusQuest?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Multi-Language Support
            </h3>
            <p className="text-gray-400">
              Write code in Python, C++, Java, and JavaScript with syntax highlighting and IntelliSense.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Interactive Terminal
            </h3>
            <p className="text-gray-400">
              Real-time input/output with streaming execution. Type commands and see results instantly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Instant Execution
            </h3>
            <p className="text-gray-400">
              Run your code in secure Docker containers with zero setup required.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Secure & Isolated
            </h3>
            <p className="text-gray-400">
              Each execution runs in an isolated environment for maximum security.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="bg-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Cloud-Based
            </h3>
            <p className="text-gray-400">
              Access your projects from anywhere. No installation needed.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="bg-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-400">
              Optimized for speed with real-time collaboration features.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Coding?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Join thousands of developers using NexusQuest IDE
          </p>
          <Button
            onClick={() => navigate('/signup')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>© 2025 NexusQuest IDE. Built with ❤️ for developers.</p>
        </div>
      </footer>
    </div>
  );
}
