import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../context/ThemeContext';
import { getTasks, Task, TaskDifficulty, TaskLanguage, getMyProgress, TaskProgress } from '../services/taskService';
import { getStoredUser } from '../services/authService';
import { UserSidePanel } from '../components/UserSidePanel';
import { usePageTitle } from '../hooks/usePageTitle';
import { TaskCard, SearchAndFilter, PageHeader } from '../components/common';

interface TasksPageProps {
  user: { name: string; email: string } | null;
}

export default function TasksPage(_props: TasksPageProps) {
  usePageTitle('Tasks');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const storedUser = getStoredUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<TaskDifficulty | ''>('');
  const [languageFilter, setLanguageFilter] = useState<TaskLanguage | ''>('');
  const [myProgress, setMyProgress] = useState<Map<string, TaskProgress>>(new Map());
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    loadTasks();
    loadMyProgress();
  }, [difficultyFilter, languageFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filters: { difficulty?: TaskDifficulty; language?: TaskLanguage } = {};
      if (difficultyFilter) filters.difficulty = difficultyFilter;
      if (languageFilter) filters.language = languageFilter;
      const data = await getTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyProgress = async () => {
    try {
      const progress = await getMyProgress();
      const progressMap = new Map<string, TaskProgress>();
      progress.forEach(p => {
        if (typeof p.taskId === 'object' && p.taskId._id) {
          progressMap.set(p.taskId._id, p);
        }
      });
      setMyProgress(progressMap);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isCompleted = myProgress.get(task._id)?.status === 'completed';
    if (hideCompleted && isCompleted) return false;
    return matchesSearch;
  });

  const getTaskStatus = (taskId: string) => {
    const progress = myProgress.get(taskId);
    if (!progress) return null;
    return progress.status as 'completed' | 'in_progress';
  };

  return (
    <div className={`min-h-screen relative ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'}`}>
      {/* Subtle Background */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      )}
      <PageHeader
        title="Browse Tasks"
        icon={<BookOpen className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
        subtitle={`${filteredTasks.length} tasks available`}
        theme={theme}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{storedUser?.name}</span>
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={(value) => setDifficultyFilter(value as TaskDifficulty | '')}
          languageFilter={languageFilter}
          onLanguageChange={(value) => setLanguageFilter(value as TaskLanguage | '')}
          hideCompleted={hideCompleted}
          onHideCompletedChange={setHideCompleted}
          theme={theme}
        />

        {/* Task Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                status={getTaskStatus(task._id)}
                onClick={() => navigate(`/task/${task._id}`)}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Sidebar */}
      <UserSidePanel
        user={storedUser}
        onLogout={() => {
          localStorage.removeItem('nexusquest-token');
          localStorage.removeItem('nexusquest-user');
          navigate('/login');
        }}
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
      />
    </div>
  );
}

