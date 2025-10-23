import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

const sessionManager = new SessionManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (sessionId) {
      const session = await sessionManager.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    if (userId) {
      const sessions = await sessionManager.getUserSessions(userId);
      return NextResponse.json({ sessions });
    }

    return NextResponse.json(
      { error: 'sessionId or userId is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

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
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
