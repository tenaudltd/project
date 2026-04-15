export type Role = "admin" | "staff" | "learner";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  totalMarks: number;
  questions: Question[];
  createdAt: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  dateTaken: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  postedBy: string;
  datePosted: string;
}

export interface Feedback {
  id: string;
  userId: string;
  message: string;
  dateSubmitted: string;
}

export interface ModuleProgress {
  moduleId: string;
  completedLessonIds: string[];
  updatedAt: string;
}
