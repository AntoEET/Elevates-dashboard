# Xero Integration Setup Guide

## Step 1: Create Xero Developer App

1. **Go to Xero Developer Portal**
   - Visit: https://developer.xero.com/myapps
   - Sign in with your Xero account credentials

2. **Create New App**
   - Click "New app"
   - Choose "Web app" as the integration type

3. **App Details**
   - **App name**: "Elevates Finance Dashboard" (or your preferred name)
   - **Company or application URL**: `http://localhost:3000` (for development)
   - **OAuth 2.0 redirect URI**: `http://localhost:3000/api/integrations/xero/callback`
   - Click "Create app"

4. **Get Your Credentials**
   After creating the app, you'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Generate a secret" and copy it

   ⚠️ **IMPORTANT**: Save these somewhere safe. You won't be able to see the Client Secret again!

5. **Configure Scopes**
   Make sure these scopes are enabled:
   - ✅ `accounting.transactions` - Read transactions
   - ✅ `accounting.reports.read` - Access financial reports
   - ✅ `accounting.settings` - Read chart of accounts

## Step 2: Add Credentials to Environment

1. **Create `.env.local` file** in the `elevates-dashboard` root folder

2. **Add these variables**:
   ```env
   # Xero Integration
   XERO_CLIENT_ID=your_client_id_here
   XERO_CLIENT_SECRET=your_client_secret_here
   XERO_REDIRECT_URI=http://localhost:3000/api/integrations/xero/callback

   # Stripe Integration (add later)
   STRIPE_SECRET_KEY=
   STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=

   # Base Currency
   BASE_CURRENCY=GBP
   ```

3. **Replace the values**:
   - Replace `your_client_id_here` with your Client ID
   - Replace `your_client_secret_here` with your Client Secret

## Step 3: Test the Integration

Once the API routes are built (next step), you'll:

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/finance/settings`
3. Click "Connect Xero"
4. Authorize the app in the Xero popup
5. You'll be redirected back to the dashboard
6. Your Xero account is now connected!

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in your Xero app settings EXACTLY matches:
  `http://localhost:3000/api/integrations/xero/callback`
- No trailing slash
- Must be http (not https) for localhost

### "Invalid client credentials" error
- Double-check your Client ID and Client Secret
- Make sure there are no extra spaces
- Client Secret is case-sensitive

### "Organization not found" error
- Make sure you've added transactions to your Xero account
- The account must have at least one organization

## Production Setup (Later)

When deploying to production:

1. **Update Xero App Settings**
   - Add production redirect URI: `https://yourdomain.com/api/integrations/xero/callback`
   - Add both localhost and production URIs (you can have multiple)

2. **Update Environment Variables**
   - Set `XERO_REDIRECT_URI=https://yourdomain.com/api/integrations/xero/callback`

3. **Security**
   - Never commit `.env.local` to git
   - Use Vercel/hosting platform's environment variable settings
   - Rotate Client Secret if ever exposed

## Next Steps

After Xero is connected:
1. ✅ Connect Stripe (optional - for subscription data)
2. ✅ Import historical transactions (Xero will provide last 12 months)
3. ✅ View your financial dashboard with real data!
