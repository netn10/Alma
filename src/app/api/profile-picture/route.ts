import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user uses Google OAuth (shouldn't upload if they do)
    const userAccounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: 'google'
      }
    });

    if (userAccounts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot upload profile picture for Google users' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${session.user.id}-${timestamp}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user's image URL in database
    const imageUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    });

    return NextResponse.json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user uses Google OAuth (shouldn't delete if they do)
    const userAccounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: 'google'
      }
    });

    if (userAccounts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete profile picture for Google users' },
        { status: 403 }
      );
    }

    // Remove image URL from database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
}
