export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizLanguage = 'python' | 'javascript' | 'java' | 'cpp';
export type QuizStatus = 'scheduled' | 'active' | 'ended';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  points: number;
  difficulty: QuizDifficulty;
  language: QuizLanguage;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  starterCode?: string;
  testCases: TestCase[];
  startTime: string;
  endTime: string;
  duration: number;
  assignedTo: string[];
  createdAt: string;
  updatedAt: string;
  status?: QuizStatus;
}

export interface QuizSubmission {
  _id: string;
  quizId: string;
  userId: string;
  code: string;
  status: 'started' | 'submitted' | 'passed';
  score: number;
  totalTests: number;
  pointsAwarded: number;
  startedAt: string;
  submittedAt?: string;
  teacherGrade?: number;
  teacherFeedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}
