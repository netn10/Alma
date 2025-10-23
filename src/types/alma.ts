// Core types for Alma's conversation system

export interface AlmaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: ConversationMode;
}

export type ConversationMode = 'ask' | 'reflect' | 'quiet';

export interface AlmaSession {
  id: string;
  userId: string;
  title?: string | null;
  messages: AlmaMessage[];
  mode: ConversationMode;
  memory: SessionMemory;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionMemory {
  isActive: boolean;
  isPrivate: boolean;
  context: string[];
  lastCleared: Date | null;
}

export interface AlmaConfig {
  systemPrompt: string;
  toneRules: ToneRule[];
  behaviorSettings: BehaviorSettings;
}

export interface ToneRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface BehaviorSettings {
  maxContextLength: number;
  responseStyle: 'calm' | 'direct' | 'gentle';
  memoryRetention: 'session' | 'temporary' | 'persistent';
}

export interface AlmaResponse {
  content: string;
  mode: ConversationMode;
  memoryUpdated: boolean;
  suggestions?: string[];
}
