import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Create a temporary file-like object for OpenAI
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    const audioFileForOpenAI = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });

    // Transcribe using OpenAI Whisper with configurable language
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: 'whisper-1',
      language: language, // Now configurable (en, he, etc.)
      response_format: 'text',
    });

    return NextResponse.json({
      transcription: transcription,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
