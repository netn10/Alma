# Authentication Setup Guide

## Overview

Alma now includes comprehensive authentication with Google OAuth, email/password, and magic link authentication. This guide will help you set up the authentication system.

## Features Implemented

### 🔐 Authentication Methods
- **Google OAuth**: Sign in with Google account
- **Email/Password**: Traditional registration and login
- **Magic Link**: Passwordless email authentication
- **Session Management**: Secure JWT-based sessions

### 🛡️ Security Features
- Password hashing with bcrypt
- JWT token management
- Session persistence
- User profile management
- Protected routes with AuthGuard

## Setup Instructions

### 1. Environment Variables

Update your `.env.local` file with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Database
DATABASE_URL=file:./dev.db

# Email Configuration (for magic links)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=noreply@alma-hr.com
```

### 2. Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. **Copy Client ID and Secret** to your `.env.local` file

### 3. Email Setup (Optional)

For magic link authentication, set up email sending:

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate an "App Password"
   - Use the app password in `EMAIL_SERVER_PASSWORD`

2. **Alternative Email Providers**:
   - Update `EMAIL_SERVER_HOST` and `EMAIL_SERVER_PORT`
   - Use your provider's SMTP settings

### 4. Database Setup

The database is already configured with SQLite for development:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (already done)
npx prisma migrate dev --name init
```

## Authentication Flow

### 1. User Registration
- Users can register with email/password
- Google OAuth registration
- Magic link registration (email only)

### 2. User Login
- Email/password authentication
- Google OAuth login
- Magic link login

### 3. Session Management
- JWT-based sessions
- Automatic session persistence
- Secure logout

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/signup` - Sign up page
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Protected Routes
- All chat functionality requires authentication
- Automatic redirect to sign-in if not authenticated

## Components

### AuthGuard
Protects routes and redirects unauthenticated users to sign-in.

### UserMenu
Displays user information and provides logout functionality.

### SessionProvider
Wraps the app with NextAuth session management.

## Database Schema

### Users Table
- `id`: Unique user identifier
- `name`: User's full name
- `email`: User's email address
- `password`: Hashed password (for email/password auth)
- `image`: Profile picture URL
- `emailVerified`: Email verification timestamp

### Sessions Table
- `id`: Session identifier
- `sessionToken`: Unique session token
- `userId`: Reference to user
- `expires`: Session expiration

### Accounts Table
- OAuth provider accounts
- Links users to external providers

## Testing Authentication

### 1. Start the Application
```bash
npm run dev
```

### 2. Test Registration
1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/auth/signin`
3. Click "Sign up" to create an account
4. Fill in the registration form
5. You'll be automatically signed in

### 3. Test Google OAuth
1. Click "Google" button on sign-in page
2. Complete Google OAuth flow
3. You'll be redirected back to Alma

### 4. Test Magic Link
1. Enter your email on sign-in page
2. Click "Email Link"
3. Check your email for the magic link
4. Click the link to sign in

## Security Considerations

### Password Security
- Passwords are hashed with bcrypt (12 rounds)
- No plain text password storage
- Secure password requirements

### Session Security
- JWT tokens with expiration
- Secure session storage
- Automatic session cleanup

### OAuth Security
- Secure redirect URIs
- State parameter validation
- Token exchange security

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**:
   - Check if user exists in database
   - Verify password hashing
   - Check database connection

2. **Google OAuth not working**:
   - Verify Google Cloud Console setup
   - Check redirect URI configuration
   - Ensure API is enabled

3. **Email not sending**:
   - Check SMTP configuration
   - Verify email credentials
   - Check spam folder

4. **Database connection errors**:
   - Ensure DATABASE_URL is set
   - Run `npx prisma generate`
   - Check database file permissions

### Debug Mode

Enable debug logging by setting:
```env
NEXTAUTH_DEBUG=true
```

## Production Deployment

### Environment Variables
- Use secure, randomly generated `NEXTAUTH_SECRET`
- Set production `NEXTAUTH_URL`
- Use production database URL
- Configure production email settings

### Database
- Switch from SQLite to PostgreSQL/MySQL for production
- Update `DATABASE_URL` in production environment
- Run migrations on production database

### Security
- Enable HTTPS in production
- Use secure session cookies
- Implement rate limiting
- Add CSRF protection

## Next Steps

The authentication system is now fully integrated with Alma's chat functionality. Users must be authenticated to access the chat interface, and their sessions are properly managed throughout their interaction with Alma.

The system is ready for production deployment with proper environment configuration and security measures.
