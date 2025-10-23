import { NextRequest, NextResponse } from 'next/server';
import { AlmaOpenAIClient } from '@/lib/openai-client';
import { SessionManager } from '@/lib/session-manager';
import { ALMA_SYSTEM_PROMPT, TONE_RULES, DEFAULT_BEHAVIOR_SETTINGS } from '@/lib/alma-config';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

const sessionManager = new SessionManager();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate a concise, 3-5 word title for a conversation that starts with the following message. Return only the title, nothing else.'
        },
        {
          role: 'user',
          content: firstMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 20
    });

    return completion.choices[0].message.content?.trim() || 'New Conversation';
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Conversation';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId, mode = 'ask' } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Get or create session
    let session = sessionId ? await sessionManager.getSession(sessionId) : null;
    const isNewSession = !session;

    if (!session) {
      session = await sessionManager.createSession(userId);
    }

    // Create user message
    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
      mode
    };

    // Add user message to session
    await sessionManager.addMessage(session.id, userMessage);

    // Update session mode if changed
    if (mode !== session.mode) {
      await sessionManager.updateMode(session.id, mode);
    }

    // Initialize OpenAI client
    const almaClient = new AlmaOpenAIClient({
      systemPrompt: ALMA_SYSTEM_PROMPT,
      toneRules: TONE_RULES,
      behaviorSettings: DEFAULT_BEHAVIOR_SETTINGS
    });

    // Generate response
    const response = await almaClient.generateResponse(session.messages, mode);

    // Create assistant message
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant' as const,
      content: response.content,
      timestamp: new Date(),
      mode
    };

    // Add assistant message to session
    await sessionManager.addMessage(session.id, assistantMessage);

    // Generate title for new sessions after first exchange
    if (isNewSession) {
      const title = await generateConversationTitle(message);
      await sessionManager.updateTitle(session.id, title);
    }

    return NextResponse.json({
      message: assistantMessage,
      sessionId: session.id,
      mode: response.mode,
      suggestions: response.suggestions,
      memoryStatus: await sessionManager.getMemoryStatus(session.id)
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong, want to try again?' },
      { status: 500 }
    );
  }
}
