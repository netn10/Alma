# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Alma HR application.

## Error: "Missing required parameter: client_id"

This error occurs when the `GOOGLE_CLIENT_ID` environment variable is not set in your `.env` file.

## Quick Setup Steps

### 1. Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it (e.g., "Alma HR App")

### 2. Configure OAuth Consent Screen

1. Navigate to: **APIs & Services** → **OAuth consent screen**
2. Select **External** (for testing with any Google account)
3. Fill in the required information:
   - **App name:** Alma HR Mentor
   - **User support email:** Your email address
   - **Developer contact:** Your email address
4. Click "Save and Continue" through all steps
5. Add test users (your Gmail address) if using External mode

### 3. Create OAuth 2.0 Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name:** Alma Web Client
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/api/auth/callback/google
     ```
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 4. Update Environment Variables

Add your credentials to the `.env` file:

```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret-here"
```

### 5. Restart Your Development Server

```bash
npm run dev
```

### 6. Test Google Login

1. Navigate to http://localhost:3000/auth/signin
2. Click the "Google" button
3. Sign in with your Google account
4. You should be redirected to the home page

## Production Setup

When deploying to production, add your production URL:

### In Google Cloud Console:

1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth client ID
3. Add to **Authorized JavaScript origins:**
   ```
   https://yourdomain.com
   ```
4. Add to **Authorized redirect URIs:**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

### Update Production Environment Variables:

```env
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Troubleshooting

### Error: "Redirect URI mismatch"
- Ensure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check that there are no trailing slashes or typos

### Error: "Access blocked: This app's request is invalid"
- Make sure you've added your email as a test user in the OAuth consent screen
- Verify the OAuth consent screen is properly configured

### Error: "Invalid client"
- Double-check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly copied
- Ensure there are no extra spaces or quotes in the `.env` file

### Google Sign-in button does nothing
- Check browser console for errors
- Verify the development server is running
- Clear browser cache and cookies

## Security Notes

- Never commit `.env` file to version control (it's already in `.gitignore`)
- Keep your `GOOGLE_CLIENT_SECRET` private
- Use different OAuth credentials for development and production
- Regularly rotate your credentials if compromised

## Additional Resources

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
