import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9876';

export interface Tutorial {
  _id: string;
  title: string;
  description: string;
  language: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  createdBy: string;
  isPublished: boolean;
  creator?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TutorialInput {
  title: string;
  description: string;
  language: string;
  content: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  order?: number;
  isPublished?: boolean;
}

// Get all tutorials (students)
export const getTutorials = async (language?: string, difficulty?: string): Promise<Tutorial[]> => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  if (language) params.append('language', language);
  if (difficulty) params.append('difficulty', difficulty);

  const response = await axios.get(`${API_URL}/api/tutorials?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Get tutorials by language
export const getTutorialsByLanguage = async (language: string): Promise<Tutorial[]> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(`${API_URL}/api/tutorials/language/${language}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Get single tutorial
export const getTutorial = async (id: string): Promise<Tutorial> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(`${API_URL}/api/tutorials/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Get all tutorials for teacher
export const getTeacherTutorials = async (): Promise<Tutorial[]> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(`${API_URL}/api/tutorials/teacher/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Create tutorial (teacher)
export const createTutorial = async (tutorial: TutorialInput): Promise<Tutorial> => {
  const token = localStorage.getItem('token');

  const response = await axios.post(`${API_URL}/api/tutorials`, tutorial, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Update tutorial (teacher)
export const updateTutorial = async (id: string, tutorial: Partial<TutorialInput>): Promise<Tutorial> => {
  const token = localStorage.getItem('token');

  const response = await axios.put(`${API_URL}/api/tutorials/${id}`, tutorial, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Delete tutorial (teacher)
export const deleteTutorial = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');

  await axios.delete(`${API_URL}/api/tutorials/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get available languages
export const getAvailableLanguages = async (): Promise<string[]> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(`${API_URL}/api/tutorials/meta/languages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
