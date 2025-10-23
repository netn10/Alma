# Alma 1.0 - AI Mentor for HR Professionals

Alma is an emotionally intelligent AI mentor designed to help HR professionals and People Partners think, decide, and communicate better through structured reflection and guidance.

## Features

- **Multi-turn Conversations**: Context-aware conversations with emotional intelligence
- **Three Conversation Modes**: Ask, Reflect, and Quiet modes for different interaction styles
- **Session Memory**: Visible and controllable memory system with privacy options
- **Streaming Responses**: Real-time AI responses using OpenAI GPT-4o
- **Tone-Governed**: Responses filtered through emotional intelligence principles
- **Authentication**: Google OAuth, email/password, and magic link authentication
- **User Management**: Secure user sessions and profile management
- **Modular Architecture**: Built for future toolkit integration

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   DATABASE_URL=file:./dev.db
   ```

3. **Set up Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start Development Server**
```bash
npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:3000`
   - You'll be redirected to the sign-in page
   - Create an account or sign in with Google

## Architecture

### Core Components

- **ChatInterface**: Main conversation UI with mode selection and memory controls
- **SessionManager**: Handles conversation sessions and memory management
- **AlmaOpenAIClient**: OpenAI integration with Alma's system prompt and tone framework
- **API Routes**: RESTful endpoints for chat, session, and memory management

### Conversation Modes

- **Ask**: For questions and dilemmas - structured problem-solving
- **Reflect**: For exploring feelings and context - emotional processing
- **Quiet**: For reading/thinking - minimal interaction unless prompted

### Memory System

- **Active/Inactive**: Toggle memory on/off
- **Private Mode**: No information saved when enabled
- **Memory Clearing**: Manual memory reset with user control
- **Context Visibility**: Users can see memory status and item count

## Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4o with streaming responses
- **State Management**: React hooks with session-based storage
- **UI Components**: Custom components with Radix UI primitives
- **Deployment**: Vercel-ready

## Future Roadmap

- **Authentication**: Google OAuth and email authentication
- **Toolkit Integration**: Recruitment, Onboarding, Performance, Exit guides
- **Database**: Persistent session storage
- **Admin Panel**: Configuration management for prompts and tone rules

## Development Notes

- Built with modularity in mind for easy toolkit integration
- Session memory is currently in-memory (suitable for MVP)
- All AI responses are filtered through Alma's tone framework
- Designed for emotional intelligence and human-centered interaction

## Getting Help

For questions about Alma's behavior or technical implementation, refer to the developer orientation materials or reach out to the development team.