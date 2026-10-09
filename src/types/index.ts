export type SubjectType = 'General' | 'Python' | 'ML' | 'DSA' | 'DBMS';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  chat_id: string;
  role: Role;
  content: string;
  created_at: string;
  isBookmarked?: boolean;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  subject: SubjectType;
  created_at: string;
  updated_at?: string;
  messages?: Message[];
}

export interface Bookmark {
  id: string;
  user_id: string;
  message_id: string;
  created_at: string;
  message?: Message;
  chat?: {
    id: string;
    title: string;
    subject: SubjectType;
  };
}

export interface DashboardStats {
  subjectCounts: Record<SubjectType, number>;
  totalChats: number;
  totalQuestions: number;
  totalBookmarks: number;
  recentChats: Chat[];
  bookmarkedAnswers: Array<{
    id: string;
    message_id: string;
    chat_id: string;
    chat_title: string;
    subject: SubjectType;
    content: string;
    created_at: string;
  }>;
}

export interface SubjectConfig {
  id: SubjectType;
  name: string;
  description: string;
  badgeColor: string;
  borderColor: string;
  icon: string;
  samplePrompts: string[];
}
