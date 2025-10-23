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
    mode: 'ask' | 'reflect' | 'quiet' = 'ask'
  ): Promise<AlmaResponse> {
    try {
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
      const suggestions = await this.generateSuggestions(messages, fullResponse, mode);

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
        return 'The user is bringing a question or dilemma. Help them think through their situation using your three-move structure: seeing clearly → naming what matters → suggesting next steps. Be direct and solution-focused.';
      case 'reflect':
        return 'The user wants to explore their feelings or context. Be gentle and supportive. Help them process emotions and gain self-awareness. Focus on understanding rather than solving.';
      case 'quiet':
        return 'The user is in quiet mode for reading or thinking. Only respond if they explicitly ask you something. Keep responses brief and minimal.';
      default:
        return 'Engage naturally based on the user\'s needs.';
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
    mode: string
  ): Promise<string[]> {
    try {
      const modeContext = this.getSuggestionContext(mode);
      const suggestionPrompt = `You are assisting an HR professional. Based on this conversation, generate 3 smart, actionable suggestions that move the user toward their work goals and next steps.

Current mode: ${mode.toUpperCase()}
${modeContext}

Conversation context:
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Your last response: ${lastResponse}

Generate 3 brief, goal-oriented suggestions (each under 10 words) written from the USER's perspective. These should:
- Help the user make progress on their HR tasks
- Point toward concrete next actions or decisions
- Be specific to the conversation context, not generic
- Guide the user toward clarity, resolution, or forward movement

Examples of good suggestions:
- "Draft the performance review template now"
- "Schedule the team feedback session this week"
- "Prioritize the urgent hiring decisions first"

Format your response as a JSON array of 3 strings, nothing else. Example: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: suggestionPrompt }],
        temperature: 0.8,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content || '[]';
      const suggestions = JSON.parse(content);

      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      // Fallback to empty array if generation fails
      return [];
    }
  }
}
