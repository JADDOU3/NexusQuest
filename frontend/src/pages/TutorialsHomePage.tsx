import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getTutorials, Tutorial } from '../services/tutorialService';
import { getStoredUser } from '../services/authService';

interface LanguageFolder {
  language: string;
  tutorials: Tutorial[];
  totalTutorials: number;
  completedTutorials: number;
  progress: number;
}

export default function TutorialsHomePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [folders, setFolders] = useState<LanguageFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const allTutorials = await getTutorials();
      
      // Group by language
      const languageMap = allTutorials.reduce((acc, tutorial) => {
        if (!acc[tutorial.language]) {
          acc[tutorial.language] = [];
        }
        acc[tutorial.language].push(tutorial);
        return acc;
      }, {} as Record<string, Tutorial[]>);

      // Create folders with progress
      const languageFolders: LanguageFolder[] = Object.entries(languageMap).map(([language, tutorials]) => {
        const sortedTutorials = tutorials.sort((a, b) => a.order - b.order);
        const completed = sortedTutorials.filter(t => isCompleted(t.id)).length;
        
        return {
          language,
          tutorials: sortedTutorials,
          totalTutorials: sortedTutorials.length,
          completedTutorials: completed,
          progress: (completed / sortedTutorials.length) * 100
        };
      });

      setFolders(languageFolders.sort((a, b) => a.language.localeCompare(b.language)));
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTutorialProgressKey = (tutorialId: string): string => {
    const user = getStoredUser();
    return user ? `tutorial-progress-${user.id}-${tutorialId}` : `tutorial-progress-${tutorialId}`;
  };

  const isCompleted = (tutorialId: string): boolean => {
    const progress = localStorage.getItem(getTutorialProgressKey(tutorialId));
    if (!progress) return false;
    
    const data = JSON.parse(progress);
    return data.completed === true;
  };

  const handleFolderClick = (language: string) => {
    if (selectedLanguage === language) {
      setSelectedLanguage(null);
    } else {
      setSelectedLanguage(language);
    }
  };

  const handleTutorialClick = (tutorial: Tutorial) => {
    navigate(`/tutorials/${tutorial.id}`);
  };

  const getLanguageIcon = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'text-yellow-400',
      python: 'text-blue-400',
      java: 'text-red-400',
      'c++': 'text-purple-400',
      go: 'text-cyan-400'
    };
    return colors[language.toLowerCase()] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Learning Paths</h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose a language to start your learning journey
          </p>
        </div>

        <div className="space-y-4">
          {folders.map((folder) => (
            <div
              key={folder.language}
              className={`rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Folder Header */}
              <button
                onClick={() => handleFolderClick(folder.language)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FolderOpen className={`w-8 h-8 ${getLanguageIcon(folder.language)}`} />
                  <div className="text-left">
                    <h2 className="text-2xl font-bold capitalize">{folder.language}</h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {folder.completedTutorials} / {folder.totalTutorials} completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress Bar */}
                  <div className="w-48 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${folder.progress}%` }}
                    />
                  </div>
                  
                  <ChevronRight
                    className={`w-6 h-6 transition-transform ${
                      selectedLanguage === folder.language ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Tutorials List */}
              {selectedLanguage === folder.language && (
                <div className="px-6 pb-6 space-y-2">
                  {folder.tutorials.map((tutorial, index) => {
                    const completed = isCompleted(tutorial.id);
                    const previousCompleted = index === 0 || isCompleted(folder.tutorials[index - 1].id);
                    const isLocked = !previousCompleted;

                    return (
                      <button
                        key={tutorial.id}
                        onClick={() => !isLocked && handleTutorialClick(tutorial)}
                        disabled={isLocked}
                        className={`w-full p-4 rounded-lg border flex items-center justify-between transition-all ${
                          isLocked
                            ? 'opacity-50 cursor-not-allowed'
                            : theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                            : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                        } ${completed ? 'border-green-500' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500" />
                          )}
                          
                          <div className="text-left">
                            <h3 className="font-semibold">{tutorial.title}</h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {tutorial.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              tutorial.difficulty === 'beginner'
                                ? 'bg-green-500/20 text-green-400'
                                : tutorial.difficulty === 'intermediate'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {tutorial.difficulty}
                          </span>
                          
                          {!isLocked && <ChevronRight className="w-5 h-5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
