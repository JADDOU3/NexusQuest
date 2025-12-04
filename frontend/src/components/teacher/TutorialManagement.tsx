import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../context/ThemeContext';
import {
  getTeacherTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  Tutorial,
  TutorialInput,
} from '../../services/tutorialService';

export default function TutorialManagement() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [formData, setFormData] = useState<TutorialInput>({
    title: '',
    description: '',
    language: 'javascript',
    content: '',
    difficulty: 'beginner',
    order: 0,
    isPublished: false,
  });

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      setLoading(true);
      const data = await getTeacherTutorials();
      setTutorials(data);
    } catch (error) {
      console.error('Error loading tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTutorial) {
        await updateTutorial(editingTutorial._id, formData);
      } else {
        await createTutorial(formData);
      }
      await loadTutorials();
      resetForm();
    } catch (error) {
      console.error('Error saving tutorial:', error);
      alert('Failed to save tutorial');
    }
  };

  const handleEdit = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title,
      description: tutorial.description,
      language: tutorial.language,
      content: tutorial.content,
      difficulty: tutorial.difficulty,
      order: tutorial.order,
      isPublished: tutorial.isPublished,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tutorial?')) return;
    try {
      await deleteTutorial(id);
      await loadTutorials();
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      alert('Failed to delete tutorial');
    }
  };

  const handleTogglePublish = async (tutorial: Tutorial) => {
    try {
      await updateTutorial(tutorial._id, { isPublished: !tutorial.isPublished });
      await loadTutorials();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      language: 'javascript',
      content: '',
      difficulty: 'beginner',
      order: 0,
      isPublished: false,
    });
    setEditingTutorial(null);
    setShowForm(false);
  };

  const groupedTutorials = tutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.language]) {
      acc[tutorial.language] = [];
    }
    acc[tutorial.language].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Tutorial Management</h2>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Create Tutorial
        </Button>
      </div>

      {/* Tutorial Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            <div className={`sticky top-0 border-b p-6 ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingTutorial ? 'Edit Tutorial' : 'Create New Tutorial'}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                      })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content (Markdown supported)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className={`w-full px-4 py-2 rounded-lg border font-mono text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                  placeholder="Write your tutorial content here using Markdown..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingTutorial ? 'Update' : 'Create'} Tutorial
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tutorials List */}
      {tutorials.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">No tutorials created yet</p>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Create Your First Tutorial
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTutorials).map(([language, langTutorials]) => (
            <div key={language}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-500">{language}</span>
                <span className="text-sm text-gray-400">({langTutorials.length})</span>
              </h3>

              <div className="space-y-3">
                {langTutorials
                  .sort((a, b) => a.order - b.order)
                  .map((tutorial) => (
                    <div
                      key={tutorial._id}
                      className={`p-4 rounded-xl border ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-800'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{tutorial.title}</h4>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                tutorial.isPublished
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {tutorial.isPublished ? 'Published' : 'Draft'}
                            </span>
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
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{tutorial.description}</p>
                          <div className="text-xs text-gray-500">
                            Order: {tutorial.order} • Created{' '}
                            {new Date(tutorial.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(tutorial)}
                            title={tutorial.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {tutorial.isPublished ? (
                              <EyeOff className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(tutorial)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tutorial._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
