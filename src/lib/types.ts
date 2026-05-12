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
  lessonCount?: number;
  quizId?: string;
  hasQuiz?: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaPath?: string;
  mediaBucket?: string;
  mediaName?: string;
  mediaType?: "video" | "audio" | "file";
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
  minimumPassCount?: number;
  questions: Question[];
  createdAt: string;
  isPaused?: boolean;
  pausedAt?: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  moduleId?: string;
  score: number;
  correctAnswers?: number;
  minimumPassCount?: number;
  passed?: boolean;
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
  userName?: string;
  userEmail?: string;
  message: string;
  status?: "open" | "responded";
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  responderName?: string;
  dateSubmitted: string;
}

export interface SiteContent {
  homeEyebrow: string;
  homeTitle: string;
  homeDescription: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutFocusTitle: string;
  aboutFocusBody: string;
  aboutOutcome: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ModuleProgress {
  moduleId: string;
  completedLessonIds: string[];
  updatedAt: string;
}
