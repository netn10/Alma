import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Generate speech using OpenAI TTS with natural female voice
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd', // Higher quality model for more natural speech
      voice: 'nova', // Nova is OpenAI's natural-sounding female voice (not robotic)
      input: text,
      response_format: 'mp3',
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return the audio as a response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
