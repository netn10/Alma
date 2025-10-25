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
      
      // For quiet mode, first determine if we should respond
      if (mode === 'quiet') {
        const shouldRespond = await this.shouldRespondInQuietMode(messages, language);
        if (!shouldRespond.shouldRespond) {
          return {
            content: '',
            mode,
            memoryUpdated: false,
            suggestions: [],
            silentMode: true,
            reasoning: shouldRespond.reasoning
          };
        }
      }

      const systemMessage = this.buildSystemMessage(mode, language);
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

      // For quiet mode, generate reasoning but don't prepend it to the response
      // The reasoning will be handled separately in the frontend
      let quietModeReasoning = null;
      if (mode === 'quiet' && fullResponse.trim()) {
        quietModeReasoning = await this.generateQuietModeReasoning(messages, fullResponse, language);
      }

      // Generate AI-powered suggestions based on the conversation
      const suggestions = await this.generateSuggestions(messages, fullResponse, mode, language);

      return {
        content: fullResponse,
        mode,
        memoryUpdated: true,
        suggestions,
        silentMode: mode === 'quiet',
        reasoning: quietModeReasoning
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from Alma');
    }
  }

  private buildSystemMessage(mode: string, language?: string): string {
    const basePrompt = this.config.systemPrompt;
    const modeInstructions = this.getModeInstructions(mode);
    const languageInstruction = language === 'he' ? '\n\nIMPORTANT: When responding in Hebrew, write in Hebrew script (עברית) and ensure text direction is right-to-left.' : '';
    return `${basePrompt}\n\nCurrent mode: ${mode.toUpperCase()}\n${modeInstructions}${languageInstruction}`;
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

  private async shouldRespondInQuietMode(messages: AlmaMessage[], language: string): Promise<{ shouldRespond: boolean; reasoning: string }> {
    try {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        return { shouldRespond: false, reasoning: 'No user message to respond to' };
      }

      const languageInstruction = language === 'he' ? '\n\nIMPORTANT: Respond in Hebrew (עברית).' : '';
      const decisionPrompt = `You are in SILENT MODE. Analyze the user's message and determine if you should respond.

CRITERIA FOR RESPONDING:
- Direct question or request for help
- Clear distress, confusion, or need for guidance
- Explicit request for your input
- Safety concern or urgent matter
- User is stuck and needs direction

CRITERIA FOR STAYING SILENT:
- User is just thinking out loud
- User is processing or reflecting
- User is making statements without asking for input
- User is working through something independently
- User is expressing thoughts without seeking response

User's message: "${lastMessage.content}"

IMPORTANT: You must respond with ONLY a valid JSON object. No explanations, no additional text, no markdown formatting.

Required format:
{"shouldRespond": true, "reasoning": "Your explanation here"}

or

{"shouldRespond": false, "reasoning": "Your explanation here"}${languageInstruction}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: decisionPrompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content || '{}';
      console.log('Raw LLM response for silent mode decision:', content);
      
      try {
        // Try to extract JSON from the response (in case there's extra text)
        let jsonContent = content.trim();
        
        // Look for JSON object in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        const decision = JSON.parse(jsonContent);
        console.log('Parsed decision:', decision);
        
        return {
          shouldRespond: decision.shouldRespond === true || decision.shouldRespond === 'true',
          reasoning: decision.reasoning || 'Unable to determine'
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Failed to parse content:', content);
        
        // Try to extract decision from text if JSON parsing fails
        const shouldRespondMatch = content.match(/shouldRespond["\s]*:[\s]*true/i);
        const reasoningMatch = content.match(/reasoning["\s]*:[\s]*"([^"]+)"/i);
        
        if (shouldRespondMatch || reasoningMatch) {
          return {
            shouldRespond: !!shouldRespondMatch,
            reasoning: reasoningMatch ? reasoningMatch[1] : 'Parsed from text'
          };
        }
        
        // Final fallback: err on the side of staying silent
        return {
          shouldRespond: false,
          reasoning: 'Unable to parse decision, staying silent'
        };
      }
    } catch (error) {
      console.error('Error in shouldRespondInQuietMode:', error);
      return {
        shouldRespond: false,
        reasoning: 'Error occurred, staying silent'
      };
    }
  }

  private async generateQuietModeReasoning(messages: AlmaMessage[], response: string, language: string): Promise<string> {
    try {
      const lastMessage = messages[messages.length - 1];
      const languageInstruction = language === 'he' ? '\n\nIMPORTANT: Respond in Hebrew (עברית).' : '';
      const reasoningPrompt = `You chose to respond in SILENT MODE. Explain briefly why you decided to break your silence.

User's message: "${lastMessage.content}"
Your response: "${response}"

Provide a brief explanation (1-2 sentences) of why this message required your response. Be specific about what triggered your decision to respond.${languageInstruction}`;

      const reasoningResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: reasoningPrompt }],
        temperature: 0.5,
        max_tokens: 100
      });

      return reasoningResponse.choices[0]?.message?.content || 'I chose to respond because this seemed important.';
    } catch (error) {
      console.error('Error generating quiet mode reasoning:', error);
      return 'I chose to respond because this seemed important.';
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
      const suggestionPrompt = `Based on this conversation, generate 3 natural follow-up prompts the user might want to say or ask next.

Current mode: ${mode.toUpperCase()}
${modeContext}

Conversation context:
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Your last response: ${lastResponse}

Generate 3 brief prompts (each under 10 words) that the USER might naturally say next. These should be:
- Written as if the user is speaking/typing them (first-person, conversational)
- Natural extensions or follow-up questions from the user's perspective
- Directly related to the conversation topic
- Things the user would actually say, like "Tell me more about that" or "How do I get started?"
${languageInstruction}

IMPORTANT: You MUST respond with ONLY a valid JSON array, nothing else. No explanations, no apologies, no extra text. Do not wrap it in any object.
Format: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: suggestionPrompt }],
        temperature: 0.8,
        max_tokens: 150
      });

      const content = response.choices[0]?.message?.content || '[]';

      // Try to parse as JSON array first
      let suggestions;
      try {
        const parsed = JSON.parse(content);
        // If it's wrapped in an object with suggestions key
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          suggestions = parsed.suggestions || Object.values(parsed)[0] || [];
        } else {
          suggestions = parsed;
        }
      } catch {
        // If parsing fails, try to extract JSON array from the content
        const arrayMatch = content.match(/\[([^\]]*)\]/);
        if (arrayMatch) {
          try {
            suggestions = JSON.parse(arrayMatch[0]);
          } catch {
            suggestions = [];
          }
        } else {
          suggestions = [];
        }
      }

      console.log('Generated suggestions:', suggestions);

      return Array.isArray(suggestions) ? suggestions.slice(0, 3).filter(Boolean) : [];
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      // Fallback to empty array if generation fails
      return [];
    }
  }
}
