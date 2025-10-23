// Configuration file for easy customization of Alma's behavior

export const CONFIG = {
  // API Configuration
  OPENAI_MODEL: 'gpt-4o',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  
  // Memory Configuration
  MAX_CONTEXT_LENGTH: 10, // Number of messages to keep in context
  MEMORY_RETENTION: 'session' as const, // 'session' | 'temporary' | 'persistent'
  
  // UI Configuration
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_INDICATOR_DELAY: 1000, // ms
  
  // Response Configuration
  ENABLE_SUGGESTIONS: true,
  MAX_SUGGESTIONS: 3,
  
  // Development
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: 'info' as const,
};

export const FEATURE_FLAGS = {
  ENABLE_MEMORY_CONTROLS: true,
  ENABLE_MODE_SELECTION: true,
  ENABLE_SUGGESTIONS: true,
  ENABLE_PRIVATE_MODE: true,
  ENABLE_STREAMING: true,
};
