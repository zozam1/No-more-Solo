export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'hell';
export type Scenario = 'blind_date' | 'club' | 'work' | 'random' | 'conflict';
export type Gender = 'male' | 'female';

export interface UserProfile {
  nickname: string;
  gender: Gender;
}

export type Language = 'ko' | 'en';
export type AppState = 'profile' | 'setup' | 'matching' | 'chat' | 'evaluating' | 'result';

export interface Persona {
  id: string;
  name: Record<Language, string>;
  gender: Gender;
  description: Record<Language, string>;
  avatar: string;
  initialMessages: Record<Scenario, Record<Language, string>>;
  systemPrompt: Record<Language, string>;
}
