import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        preferences: true, // We'll add this field to the schema
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse preferences JSON or return defaults
    const preferences = user.preferences ? JSON.parse(user.preferences as string) : {};

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
      preferences
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { section, settings } = body;

    if (!section || !settings) {
      return NextResponse.json({ error: 'Missing section or settings' }, { status: 400 });
    }

    // Get current user preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true }
    });

    const currentPreferences = user?.preferences ? JSON.parse(user.preferences as string) : {};
    
    // Update preferences based on section
    const updatedPreferences = {
      ...currentPreferences,
      [section]: settings,
      lastUpdated: new Date().toISOString()
    };

    // Prepare update data
    const updateData: any = {
      preferences: JSON.stringify(updatedPreferences),
      updatedAt: new Date()
    };

    // If updating user section, also update the user's name if it changed
    if (section === 'user' && settings.name) {
      updateData.name = settings.name;
    }

    // Save to database
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
