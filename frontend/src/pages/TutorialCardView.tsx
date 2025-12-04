import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Code, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../context/ThemeContext';
import { getTutorial, Tutorial, TutorialSection } from '../services/tutorialService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function TutorialCardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadTutorial();
  }, [id]);

  const loadTutorial = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getTutorial(id);
      setTutorial(data);
      
      // Load completed sections from localStorage
      const saved = localStorage.getItem(`tutorial-progress-${id}`);
      if (saved) {
        setCompletedSections(new Set(JSON.parse(saved)));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tutorial');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (tutorial && currentSection < tutorial.sections.length - 1) {
      // Mark current section as completed
      const newCompleted = new Set(completedSections);
      newCompleted.add(currentSection);
      setCompletedSections(newCompleted);
      
      // Save progress
      localStorage.setItem(
        `tutorial-progress-${id}`,
        JSON.stringify(Array.from(newCompleted))
      );
      
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSectionClick = (index: number) => {
    setCurrentSection(index);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">{error || 'Tutorial not found'}</p>
          <Button onClick={() => navigate('/tutorials')}>Back to Tutorials</Button>
        </div>
      </div>
    );
  }

  const currentSectionData = tutorial.sections[currentSection];
  const progress = ((currentSection + 1) / tutorial.sections.length) * 100;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 ${theme === 'dark' ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/tutorials')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tutorials
            </Button>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                {tutorial.difficulty}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                {tutorial.language}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">
                Section {currentSection + 1} of {tutorial.sections.length}
              </span>
              <span className="text-gray-400">{Math.round(progress)}% Complete</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Section Navigation */}
          <div className={`lg:col-span-1 rounded-xl p-4 h-fit sticky top-24 ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Sections
            </h3>
            <div className="space-y-2">
              {tutorial.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center gap-2 ${
                    currentSection === index
                      ? theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                        : 'bg-blue-100 text-blue-700 border border-blue-500'
                      : completedSections.has(index)
                      ? theme === 'dark'
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                      : theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {completedSections.has(index) && (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="flex-1">{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Card */}
          <div className="lg:col-span-3">
            <div className={`rounded-xl p-8 min-h-[600px] ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
              {/* Section Title */}
              <h1 className="text-3xl font-bold mb-2">{tutorial.title}</h1>
              <h2 className="text-2xl font-semibold text-blue-500 mb-6">{currentSectionData.title}</h2>

              {/* Section Content */}
              <div className="mb-8">
                <div className="prose prose-lg max-w-none">
                  {currentSectionData.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className={`mb-4 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Code Example */}
              {currentSectionData.codeExample && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Code Example</h3>
                  </div>
                  <SyntaxHighlighter
                    language={currentSectionData.language || tutorial.language}
                    style={vscDarkPlus as any}
                    customStyle={{
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      fontSize: '0.95rem'
                    }}
                  >
                    {currentSectionData.codeExample}
                  </SyntaxHighlighter>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentSection === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="text-sm text-gray-400">
                  {currentSection + 1} / {tutorial.sections.length}
                </div>

                {currentSection === tutorial.sections.length - 1 ? (
                  <Button
                    onClick={() => {
                      const newCompleted = new Set(completedSections);
                      newCompleted.add(currentSection);
                      setCompletedSections(newCompleted);
                      localStorage.setItem(
                        `tutorial-progress-${id}`,
                        JSON.stringify(Array.from(newCompleted))
                      );
                      navigate('/tutorials');
                    }}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Tutorial
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
