import OpenAI from 'openai';
import { AlmaMessage, AlmaConfig, AlmaResponse } from '@/types/alma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AlmaOpenAIClient {
  private config: AlmaConfig;

  constructor(config: AlmaConfig) {
    this.config = config;
  }

  async generateResponse(
    messages: AlmaMessage[],
    mode: 'ask' | 'reflect' | 'quiet' = 'ask',
    language: string = 'en'
  ): Promise<AlmaResponse> {
    try {
      // Log messages being sent to OpenAI for debugging
      console.log('Generating response with messages:', messages.map(m => ({ role: m.role, content: m.content.substring(0, 50) })));
      
      const systemMessage = this.buildSystemMessage(mode);
      const openaiMessages = [
        { role: 'system', content: systemMessage },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: openaiMessages as any,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
      }

      // Generate AI-powered suggestions based on the conversation
      const suggestions = await this.generateSuggestions(messages, fullResponse, mode, language);

      return {
        content: fullResponse,
        mode,
        memoryUpdated: true,
        suggestions
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from Alma');
    }
  }

  private buildSystemMessage(mode: string): string {
    const basePrompt = this.config.systemPrompt;
    const modeInstructions = this.getModeInstructions(mode);
    return `${basePrompt}\n\nCurrent mode: ${mode.toUpperCase()}\n${modeInstructions}`;
  }

  private getModeInstructions(mode: string): string {
    switch (mode) {
      case 'ask':
        return 'ASK MODE: The user needs an answer. Get to the point quickly. If you need more context, ask a direct question. Give them your best specific advice, not vague options.';
      case 'reflect':
        return 'REFLECT MODE: The user is processing something. Help them see what matters, but be specific. Name what you notice, ask targeted questions, and point toward clarity. Don\'t just validate - help them move forward.';
      case 'quiet':
        return 'QUIET MODE: The user is thinking. Stay silent unless they ask you directly. If they do ask, answer briefly and get out of the way.';
      default:
        return 'Be direct and specific based on what the user needs.';
    }
  }

  private getSuggestionContext(mode: string): string {
    switch (mode) {
      case 'ask':
        return 'Focus on actionable next steps and decision-making support.';
      case 'reflect':
        return 'Focus on emotional processing and self-reflection prompts.';
      case 'quiet':
        return 'Keep suggestions minimal and only if explicitly requested.';
      default:
        return '';
    }
  }

  private async generateSuggestions(
    conversationHistory: AlmaMessage[],
    lastResponse: string,
    mode: string,
    language: string = 'en'
  ): Promise<string[]> {
    try {
      const modeContext = this.getSuggestionContext(mode);
      const languageInstruction = language === 'he' ? '\n\nIMPORTANT: Generate the suggestions in Hebrew (עברית).' : '';
      const suggestionPrompt = `Based on this conversation, generate 3 smart, actionable suggestions that help the user move forward with their specific situation.

Current mode: ${mode.toUpperCase()}
${modeContext}

Conversation context:
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Your last response: ${lastResponse}

Generate 3 brief, goal-oriented suggestions (each under 10 words) written from the USER's perspective. These should:
- Be directly relevant to the user's specific situation and needs
- Point toward concrete next actions or decisions
- Be specific to the conversation context, not generic
- Guide the user toward clarity, resolution, or forward movement
${languageInstruction}

IMPORTANT: You MUST respond with ONLY a JSON array, nothing else. No explanations, no apologies, no extra text.
Format: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: suggestionPrompt }],
        temperature: 0.8,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{"suggestions":[]}';

      // Try to parse as JSON object first (in case it wraps in an object)
      let suggestions;
      try {
        const parsed = JSON.parse(content);
        suggestions = parsed.suggestions || parsed;
      } catch {
        // If that fails, try to extract JSON array from the content
        const match = content.match(/\[(.*?)\]/s);
        if (match) {
          suggestions = JSON.parse(`[${match[1]}]`);
        } else {
          suggestions = [];
        }
      }

      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      // Fallback to empty array if generation fails
      return [];
    }
  }
}
