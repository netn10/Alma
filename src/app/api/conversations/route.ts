import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

const sessionManager = new SessionManager();

// GET /api/conversations?userId=xxx - Get all conversations for a user
// GET /api/conversations?sessionId=xxx - Get a specific conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific conversation
      const session = await sessionManager.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ conversation: session });
    }

    if (userId) {
      // Get all conversations for user
      const sessions = await sessionManager.getUserSessions(userId);
      return NextResponse.json({ conversations: sessions });
    }

    return NextResponse.json(
      { error: 'userId or sessionId is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations - Update conversation title
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, title } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    if (title === undefined) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    await sessionManager.updateTitle(sessionId, title);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Conversation title update error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations - Delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const deleted = await sessionManager.deleteSession(sessionId);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Conversation deletion error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
