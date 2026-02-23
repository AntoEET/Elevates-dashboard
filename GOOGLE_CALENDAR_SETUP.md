# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for the Elevates Dashboard.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "Elevates Dashboard"
5. Click "Create"

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, select your project
2. Navigate to "APIs & Services" > "Library"
3. Search for "Google Calendar API"
4. Click on it and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (or Internal if using Google Workspace)
   - App name: "Elevates Dashboard"
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Click "Add or Remove Scopes"
     - Add: `https://www.googleapis.com/auth/calendar.events`
     - Add: `https://www.googleapis.com/auth/userinfo.email`
   - Click "Save and Continue"
   - Test users: Add your email (for development)
   - Click "Save and Continue"
4. Return to "Credentials" and click "Create Credentials" > "OAuth client ID"
5. Application type: "Web application"
6. Name: "Elevates Dashboard Web Client"
7. Authorized redirect URIs:
   - Add: `http://localhost:3000/api/calendar/google/auth/callback`
   - For production, add: `https://yourdomain.com/api/calendar/google/auth/callback`
8. Click "Create"
9. Copy the Client ID and Client Secret

## Step 4: Generate Encryption Keys

Open your terminal and run these commands to generate secure random keys:

```bash
# Generate OAUTH_STATE_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate OAUTH_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy these values for the next step.

## Step 5: Configure Environment Variables

1. Open `.env.local` in your project root
2. Update the Google Calendar section with your values:

```env
# Google Calendar Integration
GOOGLE_OAUTH_CLIENT_ID=your_client_id_from_step_3
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_from_step_3
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/calendar/google/auth/callback
OAUTH_STATE_SECRET=generated_secret_from_step_4
OAUTH_ENCRYPTION_KEY=generated_secret_from_step_4
```

Replace:
- `your_client_id_from_step_3` with the Client ID from Step 3
- `your_client_secret_from_step_3` with the Client Secret from Step 3
- The two generated secrets from Step 4

## Step 6: Start the Development Server

```bash
npm run dev
```

## Step 7: Connect Google Calendar

1. Open the dashboard in your browser: `http://localhost:3000`
2. Navigate to the Calendar page
3. Click the Settings icon (gear icon) in the calendar header
4. Click "Connect Google Calendar"
5. You'll be redirected to Google's OAuth consent screen
6. Sign in with your Google account
7. Grant the requested permissions
8. You'll be redirected back to the dashboard

## Step 8: Upload Existing Events (Optional)

After connecting, if you have existing local events, you'll see a migration wizard:

1. Review the events to be uploaded
2. Click "Upload X Events" to sync them to Google Calendar
3. Wait for the upload to complete

## Features

### Two-Way Sync
- Events created in the dashboard sync to Google Calendar
- Events created in Google Calendar sync to the dashboard
- Changes sync automatically (newest wins)

### Automatic Sync
- Syncs every 30 minutes automatically
- Manual sync available via the refresh button
- Syncs when coming back online after being offline

### Event Management
- Create, edit, and delete events in either place
- Changes reflect in both locations
- Conflict resolution: newest change wins

### Offline Mode
- Works offline - changes queue and sync when online
- Visual indicators for sync status
- Error handling with retry logic

## Troubleshooting

### "Not authenticated" error
- Make sure you're logged into the dashboard
- Check that your session cookie is valid

### OAuth redirect fails
- Verify the redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/calendar/google/auth/callback`
- Check that the OAuth client is configured correctly

### Sync errors
- Check your internet connection
- Verify the Google Calendar API is enabled
- Check the browser console for detailed error messages

### Token expired
- Tokens refresh automatically, but if you see errors:
- Disconnect and reconnect Google Calendar in settings

## Security Notes

- OAuth tokens are encrypted with AES-256-GCM
- Tokens are stored securely in `src/data/oauth-tokens/`
- Never commit `.env.local` to version control
- Use different secrets for development and production

## Production Deployment

When deploying to production:

1. Update `GOOGLE_OAUTH_REDIRECT_URI` to your production URL
2. Add the production redirect URI to Google Cloud Console
3. Generate new, secure secrets for production
4. Ensure environment variables are set securely
5. Consider publishing your OAuth app (remove "Testing" status in Google Cloud Console)

## Support

For issues or questions:
- Check the browser console for errors
- Review the API logs in the terminal
- Verify all environment variables are set correctly
- Ensure Google Calendar API is enabled

## API Rate Limits

Google Calendar API has rate limits:
- 1,000,000 queries per day
- 10 queries per second per user

The integration includes:
- Exponential backoff retry logic
- Automatic rate limit handling
- Efficient incremental sync using sync tokens

## Data Storage

Sync metadata is stored in:
- OAuth tokens: `src/data/oauth-tokens/{userId}.json` (encrypted)
- Sync metadata: `src/data/calendar-sync/{userId}.json`

Make sure these directories exist and have proper permissions.
