# Voice Chat Features

This document describes the voice chat capabilities added to the Alma application.

## Features Added

### 1. Voice Input (Speech-to-Text)
- **VoiceRecorder Component**: Records user voice input using the browser's MediaRecorder API
- **Real-time Transcription**: Uses OpenAI Whisper API for accurate speech-to-text conversion
- **Audio Playback**: Users can play back their recorded audio before sending
- **Error Handling**: Graceful fallback when microphone permissions are denied

### 2. Voice Output (Text-to-Speech)
- **VoicePlayer Component**: Converts AI responses to speech using OpenAI TTS API
- **Browser Fallback**: Falls back to browser's built-in speech synthesis if TTS API fails
- **Playback Controls**: Play, pause, stop, and mute controls for AI voice responses
- **Auto-play Option**: Can automatically play AI responses when received

### 3. Voice Mode Toggle
- **Toggle Button**: Easy switch between text and voice input modes
- **Visual Indicators**: Clear UI feedback for current mode
- **Seamless Integration**: Voice mode works alongside existing text chat

### 4. API Endpoints
- **`/api/voice/transcribe`**: Converts audio files to text using OpenAI Whisper
- **`/api/voice/synthesize`**: Converts text to speech using OpenAI TTS

## How to Use

### Voice Input
1. Click the microphone button to enable voice mode
2. Click the red record button to start recording
3. Click the square stop button to stop recording
4. Use the play button to review your recording
5. Click "Transcribe" to convert speech to text
6. The transcribed text will appear in the input field
7. Send the message as usual

### Voice Output
1. AI responses automatically include a voice player
2. Click the play button to hear the AI response
3. Use pause/stop controls as needed
4. Mute/unmute for volume control

## Technical Implementation

### Browser Compatibility
- **Voice Recording**: Requires HTTPS and microphone permissions
- **Voice Playback**: Uses Web Audio API and Speech Synthesis API
- **Fallback Support**: Graceful degradation for unsupported browsers

### API Integration
- **OpenAI Whisper**: For high-quality speech-to-text transcription
- **OpenAI TTS**: For natural-sounding text-to-speech synthesis
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Security
- **Audio Processing**: Audio files are processed server-side
- **No Storage**: Audio files are not permanently stored
- **Privacy**: Voice data is only used for the current conversation

## Configuration

### Environment Variables
Make sure your `.env.local` file includes:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Browser Permissions
Users will need to grant microphone permissions for voice recording to work.

## Troubleshooting

### Common Issues
1. **Microphone Permission Denied**: Check browser permissions and ensure HTTPS
2. **No Audio Playback**: Check browser audio settings and volume
3. **Transcription Errors**: Ensure clear speech and minimal background noise
4. **API Errors**: Verify OpenAI API key is correctly configured

### Browser Support
- **Chrome/Edge**: Full support for all features
- **Firefox**: Full support for all features
- **Safari**: Limited support (may need fallback to browser TTS)
- **Mobile**: Full support on modern mobile browsers

## Future Enhancements

Potential improvements for future versions:
- Voice activity detection for automatic recording
- Multiple language support
- Voice command shortcuts
- Custom voice selection
- Audio quality settings
- Conversation history with voice playback
