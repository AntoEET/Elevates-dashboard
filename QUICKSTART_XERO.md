# Quick Start: Connect Xero to Your Finance Dashboard

Follow these steps to integrate your Xero account with the Elevates Finance Dashboard.

---

## ✅ Step 1: Create Xero Developer App (5 minutes)

1. Go to **https://developer.xero.com/myapps**
2. Sign in with your Xero account
3. Click **"New app"**
4. Choose **"Web app"**
5. Fill in the details:
   - **App name**: `Elevates Finance Dashboard`
   - **Company URL**: `http://localhost:3000`
   - **OAuth redirect URI**: `http://localhost:3000/api/integrations/xero/callback`
6. Click **"Create app"**
7. **Copy your credentials**:
   - Client ID (looks like: `ABC123...`)
   - Client Secret (click "Generate a secret" and copy it - you can only see this once!)

---

## ✅ Step 2: Add Credentials to Your Dashboard

1. Open your `elevates-dashboard` folder
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Open `.env.local` in a text editor
4. Replace the values:
   ```env
   XERO_CLIENT_ID=paste_your_client_id_here
   XERO_CLIENT_SECRET=paste_your_client_secret_here
   XERO_REDIRECT_URI=http://localhost:3000/api/integrations/xero/callback
   BASE_CURRENCY=GBP
   ```
5. Save the file

---

## ✅ Step 3: Start Your Dashboard

1. Open terminal in the `elevates-dashboard` folder
2. Run:
   ```bash
   npm run dev
   ```
3. Wait for it to start (should say "Ready on http://localhost:3000")
4. Open your browser to **http://localhost:3000**

---

## ✅ Step 4: Connect Xero

1. In the dashboard sidebar, click **"Finance"** (the $ icon)
2. Click **"Connect Your Accounts"** button
3. On the settings page, click **"Connect Xero Account"**
4. You'll be redirected to Xero to authorize
5. **Select your organization** and click **"Allow access"**
6. You'll be redirected back to the dashboard
7. You should see "Xero connected successfully!" ✅

---

## ✅ Step 5: Sync Your Data

1. After connecting, click **"Sync Now"** on the Xero card
2. Wait for the sync to complete (usually 10-30 seconds)
3. You'll see:
   - Number of accounts synced
   - Number of transactions synced (last 12 months)
   - Balance sheet data
   - P&L data

---

## 🎉 You're Done!

Your Xero account is now connected. The dashboard will:
- ✅ Automatically sync every 6 hours
- ✅ Pull last 12 months of transaction history
- ✅ Calculate all financial metrics (MRR, burn rate, runway, etc.)
- ✅ Keep data cached locally for fast access

---

## 🔍 What Happens Next?

The dashboard is currently in **Week 2 of development**:

- ✅ **Week 1 (DONE)**: Foundation & Xero integration
- 🔄 **Week 2 (IN PROGRESS)**: API routes & data flow
- ⏳ **Week 3 (NEXT)**: Build the UI dashboard with charts

Once Week 3 is complete, you'll see:
- 📊 Revenue charts (MRR/ARR growth)
- 💰 SaaS metrics (CAC, LTV, Magic Number, Rule of 40)
- 🔥 Burn rate & runway gauges
- 📈 Cash flow waterfall charts

---

## ❓ Troubleshooting

### "Redirect URI mismatch" error
Make sure the redirect URI in your Xero app settings EXACTLY matches:
```
http://localhost:3000/api/integrations/xero/callback
```
No trailing slash, http (not https) for localhost.

### "Invalid client credentials" error
- Double-check your Client ID and Client Secret in `.env.local`
- Make sure there are no extra spaces
- Client Secret is case-sensitive

### "No organization found" error
- Make sure your Xero account has at least one organization
- Try logging into Xero directly first at https://go.xero.com

### Sync not working
- Check that you've clicked "Sync Now" after connecting
- Look at the browser console (F12) for any error messages
- Make sure your Xero account has transactions to sync

---

## 🔒 Security Notes

- Your Xero credentials are stored in `.env.local` which is **NOT committed to git**
- OAuth tokens are stored in `src/data/integrations/xero-tokens/` (also excluded from git)
- All connections use OAuth 2.0 - your Xero password is never stored
- Tokens are automatically refreshed before expiry

---

## 📚 Additional Resources

- **Xero Setup Guide**: See `XERO_SETUP_GUIDE.md` for detailed instructions
- **Implementation Progress**: See `IMPLEMENTATION_PROGRESS.md` for full feature list
- **Xero API Docs**: https://developer.xero.com/documentation/
- **Elevates Dashboard Docs**: See `CLAUDE.md` for architecture overview

---

## 💡 Next Steps

1. **Add Stripe** (optional): For subscription revenue tracking
2. **Import historical data**: Make sure your Xero has 12 months of transactions
3. **Wait for Week 3**: Dashboard UI with charts will be built next
4. **Test sync**: Click "Sync Now" to pull fresh data anytime

---

Need help? Check the troubleshooting section above or review the detailed guides in the repo.
