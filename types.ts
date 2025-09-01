export interface Question {
  QuestionNo: number;
  Question: string;
  Option1: string;
  Option2: string;
  Option3: string;
  Option4: string;
  CorrectOption: number;
}

export interface ExamResult {
  id: number;
  date: string;
  total: number;
  score: number;
  percentage: number;
}

export enum View {
  Home = 'home',
  Loading = 'loading',
  Exam = 'exam',
  Results = 'results',
  History = 'history',
  AdminLogin = 'admin_login',
  AdminDashboard = 'admin_dashboard',
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}
