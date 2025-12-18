import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Quiz, getQuizzes } from '../services/quizService';
import { QuizCard, PageHeader } from '../components/common';

export default function QuizzesPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate quizzes into active/upcoming and completed
  const activeQuizzes = quizzes.filter(q => q.status === 'active' || q.status === 'scheduled');
  const completedQuizzes = quizzes.filter(q => q.status === 'ended' || q.submission?.status === 'passed');

  // Sort active: active first, then scheduled
  const sortedActiveQuizzes = [...activeQuizzes].sort((a, b) => {
    const order = { active: 0, scheduled: 1, ended: 2 };
    return (order[a.status] || 3) - (order[b.status] || 3);
  });

  // Sort completed by end time (most recent first)
  const sortedCompletedQuizzes = [...completedQuizzes].sort((a, b) => {
    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
  });

  return (
    <div className={`min-h-screen relative ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'}`}>
      {/* Subtle Background */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        </div>
      )}
      
      <PageHeader
        title="Quizzes"
        icon={<Clock className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/25"
        subtitle={`${quizzes.filter(q => q.status === 'active').length} active quizzes`}
        theme={theme}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No quizzes available</h3>
            <p className="text-gray-500">Check back later for upcoming quizzes</p>
          </div>
        ) : (
          <>
            {/* Active & Upcoming Quizzes */}
            {sortedActiveQuizzes.length > 0 && (
              <div>
                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Play className="w-5 h-5 text-green-500" />
                  Active & Upcoming Quizzes
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortedActiveQuizzes.map(quiz => (
                    <QuizCard
                      key={quiz._id}
                      quiz={quiz}
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                      theme={theme}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Quizzes */}
            {sortedCompletedQuizzes.length > 0 && (
              <div>
                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <CheckCircle2 className="w-5 h-5 text-gray-500" />
                  Completed Quizzes
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sortedCompletedQuizzes.map(quiz => (
                    <QuizCard
                      key={quiz._id}
                      quiz={quiz}
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                      theme={theme}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state if no quizzes in either section */}
            {sortedActiveQuizzes.length === 0 && sortedCompletedQuizzes.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-medium mb-2">No quizzes available</h3>
                <p className="text-gray-500">Check back later for upcoming quizzes</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
