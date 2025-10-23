# Alma 1.0 Demo Guide

## Getting Started

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Open Browser**
   Navigate to `http://localhost:3000`

## Demo Scenarios

### Scenario 1: Ask Mode - HR Dilemma
**Goal**: Show Alma's problem-solving approach

**Steps**:
1. Select "Ask" mode
2. Type: "I have an employee who's consistently late but their work quality is excellent. How should I handle this?"
3. Observe Alma's three-move structure:
   - Seeing clearly: Understanding the situation
   - Naming what matters: Identifying core issues
   - Suggesting next steps: Actionable guidance

### Scenario 2: Reflect Mode - Emotional Processing
**Goal**: Show Alma's emotional intelligence

**Steps**:
1. Select "Reflect" mode
2. Type: "I'm feeling overwhelmed by all the performance reviews I need to do"
3. Observe Alma's gentle, supportive approach to emotional processing

### Scenario 3: Memory Controls
**Goal**: Show user control over memory

**Steps**:
1. Have a conversation with Alma
2. Click the memory toggle to turn off memory
3. Continue conversation - notice how context is lost
4. Toggle memory back on
5. Try private mode - no information is saved

### Scenario 4: Mode Switching
**Goal**: Show different conversation styles

**Steps**:
1. Start in "Ask" mode with a question
2. Switch to "Reflect" mode mid-conversation
3. Notice how Alma adapts her response style
4. Switch to "Quiet" mode - Alma becomes minimal

## Key Features to Highlight

### 1. Emotional Intelligence
- Responses are warm, human, and emotionally aware
- No generic chatbot language
- Assumes good intent and avoids judgment

### 2. Structured Guidance
- Three-move conversation structure
- Clear progression from understanding to action
- Avoids circular loops

### 3. User Control
- Memory visibility and control
- Private mode for sensitive conversations
- Mode selection for different needs

### 4. Context Awareness
- Remembers conversation within session
- Adapts responses based on context
- Suggests relevant follow-up questions

## Technical Notes

- **Streaming Responses**: Real-time AI responses
- **Session Management**: In-memory session storage
- **Modular Architecture**: Ready for toolkit integration
- **Tone Framework**: All responses filtered through emotional intelligence principles

## Troubleshooting

### Common Issues

1. **"Something went wrong" message**
   - Check if OPENAI_API_KEY is set in .env.local
   - Verify API key is valid and has credits

2. **Memory not working**
   - Check browser console for errors
   - Ensure session is properly initialized

3. **Slow responses**
   - Check OpenAI API status
   - Verify network connection

### Development Tips

- Use browser dev tools to inspect API calls
- Check console for debug information
- Memory status is visible in the UI
- All API endpoints are RESTful and documented
