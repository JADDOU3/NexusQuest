import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code2, Trophy, Target, BookOpen, Play, CheckCircle2, Clock, Star, TrendingUp, Award, FolderOpen, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserSidebar } from '../components/UserSidebar';

interface DashboardProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const { theme } = useTheme();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Mock data - replace with real API calls
  const stats = {
    completedChallenges: 12,
    totalChallenges: 50,
    points: 450,
    rank: 156,
    streak: 5
  };

  const recentTasks = [
    { id: 1, title: 'Two Sum Problem', difficulty: 'Easy', points: 10, completed: true },
    { id: 2, title: 'Binary Search', difficulty: 'Medium', points: 25, completed: true },
    { id: 3, title: 'Merge Sort Implementation', difficulty: 'Medium', points: 30, completed: false },
    { id: 4, title: 'Dynamic Programming - Fibonacci', difficulty: 'Hard', points: 50, completed: false }
  ];

  const myProjects = [
    { id: 1, name: 'Todo App', language: 'JavaScript', lastModified: '2 hours ago' },
    { id: 2, name: 'Calculator', language: 'Python', lastModified: '1 day ago' },
    { id: 3, name: 'Sorting Algorithms', language: 'C++', lastModified: '3 days ago' }
  ];

  const learningPaths = [
    { id: 1, title: 'Python Basics', progress: 75, total: 20 },
    { id: 2, title: 'Data Structures', progress: 40, total: 30 },
    { id: 3, title: 'Algorithms', progress: 20, total: 25 }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 ${
        theme === 'dark' 
          ? 'border-gray-800 bg-gray-950/80' 
          : 'border-gray-200 bg-white/80'
      } backdrop-blur-md`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              NexusQuest
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowSidePanel(true)}
              variant="outline"
              className={`${
                theme === 'dark'
                  ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              {user?.name}
            </Button>
          </div>
        </div>
      </header>

      {/* Side Panel */}
      {showSidePanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowSidePanel(false)}
          />
          <div className={`fixed top-0 right-0 h-full w-80 shadow-2xl z-50 transform transition-transform duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-900 border-l border-gray-800' 
              : 'bg-white border-l border-gray-200'
          }`}>
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className={`p-6 border-b ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Profile</h2>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{user?.name}</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{user?.email}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowSidePanel(false);
                      navigate('/dashboard');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-800 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSidePanel(false);
                      navigate('/projects');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-800 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <FolderOpen className="w-5 h-5" />
                    <span>My Projects</span>
                  </button>

                  <div className={`pt-4 border-t mt-4 ${
                    theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                  }`}>
                    <div className={`px-4 py-2 text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Settings</div>
                    
                    <button
                      onClick={toggleTheme}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-800 text-white'
                          : 'hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>

                    <button
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-800 text-white'
                          : 'hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Account Settings</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className={`p-4 border-t ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    setShowSidePanel(false);
                    handleLogout();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-red-500/10 text-red-400'
                      : 'hover:bg-red-50 text-red-600'
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Here's what's happening with your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-900/50 border-blue-500/20'
              : 'bg-white border-blue-200'
          }`}>
            <Trophy className="w-8 h-8 text-blue-400 mb-2" />
            <div className={`text-3xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{stats.points}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Points</div>
          </div>

          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-900/50 border-purple-500/20'
              : 'bg-white border-purple-200'
          }`}>
            <Target className="w-8 h-8 text-purple-400 mb-2" />
            <div className={`text-3xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{stats.completedChallenges}/{stats.totalChallenges}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Challenges</div>
          </div>

          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-900/50 border-yellow-500/20'
              : 'bg-white border-yellow-200'
          }`}>
            <Star className="w-8 h-8 text-yellow-400 mb-2" />
            <div className={`text-3xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>#{stats.rank}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Global Rank</div>
          </div>

          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-900/50 border-orange-500/20'
              : 'bg-white border-orange-200'
          }`}>
            <TrendingUp className="w-8 h-8 text-orange-400 mb-2" />
            <div className={`text-3xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{stats.streak} days</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Streak 🔥</div>
          </div>

          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-900/50 border-green-500/20'
              : 'bg-white border-green-200'
          }`}>
            <Award className="w-8 h-8 text-green-400 mb-2" />
            <div className={`text-3xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>8</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Badges Earned</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl p-6 mb-6 border ${
              theme === 'dark'
                ? 'bg-gray-900/50 border-gray-800'
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Target className="w-6 h-6 text-blue-400" />
                  Your Tasks
                </h2>
                <Button
                  onClick={() => navigate('/challenges')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse All
                </Button>
              </div>

              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-lg p-4 transition-all cursor-pointer border ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500/30'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Clock className={`w-5 h-5 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        )}
                        <div>
                          <h3 className={`font-semibold ${
                            task.completed 
                              ? theme === 'dark' ? 'text-gray-400 line-through' : 'text-gray-500 line-through'
                              : theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              task.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                              task.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {task.difficulty}
                            </span>
                            <span className={`text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>{task.points} points</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className={task.completed 
                          ? theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }
                        disabled={task.completed}
                      >
                        {task.completed ? 'Completed' : 'Start'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Paths */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-purple-400" />
                Learning Paths
              </h2>

              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div key={path.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{path.title}</h3>
                      <span className="text-sm text-gray-400">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(path.total * path.progress / 100)} of {path.total} lessons</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Projects Sidebar */}
          <div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                  My Projects
                </h2>
                <Button
                  onClick={() => navigate('/projects')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {myProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/30 transition-all cursor-pointer"
                  >
                    <h3 className="font-semibold text-white mb-1">{project.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        project.language === 'Python' ? 'bg-blue-500/20 text-blue-400' :
                        project.language === 'JavaScript' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {project.language}
                      </span>
                      <span className="text-xs text-gray-400">{project.lastModified}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/projects')}
                className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">🎯 Daily Challenge</h3>
              <p className="text-blue-50 text-sm mb-4">
                Complete today's challenge and earn bonus points!
              </p>
              <Button
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                Start Challenge
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
