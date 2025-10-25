import { v4 as uuidv4 } from 'uuid';
import { AlmaSession, AlmaMessage, SessionMemory, ConversationMode } from '@/types/alma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SessionManager {
  async createSession(userId: string, title?: string): Promise<AlmaSession> {
    const sessionId = uuidv4();
    const memory: SessionMemory = {
      isActive: true,
      isPrivate: false,
      context: [],
      lastCleared: null
    };

    const dbSession = await prisma.almaSession.create({
      data: {
        id: sessionId,
        userId,
        title: title || null,
        messages: [],
        mode: 'speak',
        memory: memory as any,
      }
    });

    return this.dbSessionToAlmaSession(dbSession);
  }

  async getSession(sessionId: string): Promise<AlmaSession | null> {
    const dbSession = await prisma.almaSession.findUnique({
      where: { id: sessionId }
    });

    if (!dbSession) return null;
    return this.dbSessionToAlmaSession(dbSession);
  }

  async addMessage(sessionId: string, message: AlmaMessage): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.messages.push(message);

    // Update memory context if active
    if (session.memory.isActive && !session.memory.isPrivate) {
      session.memory.context.push(message.content);

      // Keep only last 10 messages in context to manage memory
      if (session.memory.context.length > 10) {
        session.memory.context = session.memory.context.slice(-10);
      }
    }

    await prisma.almaSession.update({
      where: { id: sessionId },
      data: {
        messages: session.messages as any,
        memory: session.memory as any,
        updatedAt: new Date()
      }
    });
  }

  async updateMode(sessionId: string, mode: ConversationMode): Promise<void> {
    await prisma.almaSession.update({
      where: { id: sessionId },
      data: {
        mode,
        updatedAt: new Date()
      }
    });
  }

  async updateTitle(sessionId: string, title: string): Promise<void> {
    await prisma.almaSession.update({
      where: { id: sessionId },
      data: {
        title,
        updatedAt: new Date()
      }
    });
  }

  async toggleMemory(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.memory.isActive = !session.memory.isActive;

    await prisma.almaSession.update({
      where: { id: sessionId },
      data: {
        memory: session.memory as any,
        updatedAt: new Date()
      }
    });
  }

  async togglePrivateMode(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.memory.isPrivate = !session.memory.isPrivate;
    if (session.memory.isPrivate) {
      session.memory.context = [];
    }

    await prisma.almaSession.update({
      where: { id: sessionId },
      data: {
        memory: session.memory as any,
        updatedAt: new Date()
      }
    });
  }

  async clearMemory(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.memory.context = [];
    session.memory.lastCleared = new Date();

    await prisma.almaSession.update({
      where: { id: sessionId },
      data: {
        memory: session.memory as any,
        updatedAt: new Date()
      }
    });
  }

  async getMemoryStatus(sessionId: string): Promise<SessionMemory | null> {
    const session = await this.getSession(sessionId);
    return session?.memory || null;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await prisma.almaSession.delete({
        where: { id: sessionId }
      });
      return true;
    } catch {
      return false;
    }
  }

  async getUserSessions(userId: string): Promise<AlmaSession[]> {
    const dbSessions = await prisma.almaSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    return dbSessions.map(dbSession => this.dbSessionToAlmaSession(dbSession));
  }

  // Helper to convert Prisma DB session to AlmaSession type
  private dbSessionToAlmaSession(dbSession: any): AlmaSession {
    // Helper to convert message timestamps
    const convertMessage = (msg: any): any => {
      if (msg && typeof msg === 'object') {
        return {
          ...msg,
          timestamp: msg.timestamp instanceof Date 
            ? msg.timestamp 
            : typeof msg.timestamp === 'string' 
              ? new Date(msg.timestamp)
              : new Date()
        };
      }
      return msg;
    };

    return {
      id: dbSession.id,
      userId: dbSession.userId,
      title: dbSession.title,
      messages: Array.isArray(dbSession.messages) 
        ? dbSession.messages.map(convertMessage)
        : [],
      mode: dbSession.mode as ConversationMode,
      memory: dbSession.memory as SessionMemory,
      createdAt: dbSession.createdAt,
      updatedAt: dbSession.updatedAt
    };
  }
}
