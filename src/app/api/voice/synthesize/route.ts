import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Select appropriate voice based on language
    let voice = 'nova'; // Default to Nova for English
    if (language === 'he') {
      // For Hebrew, we'll use Nova as it supports multiple languages
      // OpenAI TTS doesn't have Hebrew-specific voices, but Nova can handle Hebrew text
      voice = 'nova';
    }

    // Generate speech using OpenAI TTS with language-appropriate voice
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd', // Higher quality model for more natural speech
      voice: voice,
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
