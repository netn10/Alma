import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

const sessionManager = new SessionManager();

export async function POST(request: NextRequest) {
  try {
    const { sessionId, action } = await request.json();

    if (!sessionId || !action) {
      return NextResponse.json(
        { error: 'sessionId and action are required' },
        { status: 400 }
      );
    }

    const session = await sessionManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'toggle':
        await sessionManager.toggleMemory(sessionId);
        break;
      case 'togglePrivate':
        await sessionManager.togglePrivateMode(sessionId);
        break;
      case 'clear':
        await sessionManager.clearMemory(sessionId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const memoryStatus = await sessionManager.getMemoryStatus(sessionId);
    return NextResponse.json({ memoryStatus });

  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const memoryStatus = await sessionManager.getMemoryStatus(sessionId);
    if (!memoryStatus) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ memoryStatus });

  } catch (error) {
    console.error('Memory status error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
