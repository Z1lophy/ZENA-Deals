# Deploy ZENA Deals to Render - Step by Step Guide

## Prerequisites

✅ Your code is already on GitHub (you've pushed it)
✅ You have a GitHub account
✅ You have your API keys ready

---

## Step 1: Create .env File (For Local Development)

**Before deploying, create a `.env` file locally** so your site works when you test it:

1. In your project folder, create a new file named `.env` (no extension)
2. Add your keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_51Sn3O4GRdegJOpfLDhtndFMBg9e9T5ghw5lfXYMWND7URUyVZ5MVcfqqWuaJcKVqPnyMD6aVc0qbiqIeZJbqv1xW00W2tTdI1o
   STRIPE_PUBLISHABLE_KEY=pk_test_51Sn3O4GRdegJOpfLIthHZpWjG0NEPpRipyVNkgkZPvDtcxiS42Tpbw44DySCoE77EHpodHFlYFggKcyc5n1owAXS00QPLspmVn
   SERPAPI_KEY=8f0dbd9504d4b13eab4f0c7d688c6483fee216e26bf4646ae8942cb9b30c6633
   PORT=3000
   ```

3. **Important:** The `.env` file is in `.gitignore`, so it won't be uploaded to GitHub (that's good!)

---

## Step 2: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"** or **"Sign Up"**
3. Sign up with your **GitHub account** (easiest option)
4. Authorize Render to access your GitHub repositories

---

## Step 3: Create a New Web Service

1. Once logged in, click the **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repositories
4. **Find and select:** `ZENA-Deals` (or `Z1lophy/ZENA-Deals`)

---

## Step 4: Configure Your Service

Fill in these settings:

### Basic Settings:
- **Name:** `zena-deals` (or whatever you want)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `master` (or `main` if that's your branch)
- **Root Directory:** Leave empty (or `./` if it asks)

### Build & Deploy:
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

### Plan:
- **Free** (select this - it's free!)

---

## Step 5: Add Environment Variables

**This is CRITICAL!** Your API keys must be added here:

1. Scroll down to the **"Environment Variables"** section
2. Click **"Add Environment Variable"** for each one:

   **Variable 1:**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_51Sn3O4GRdegJOpfLDhtndFMBg9e9T5ghw5lfXYMWND7URUyVZ5MVcfqqWuaJcKVqPnyMD6aVc0qbiqIeZJbqv1xW00W2tTdI1o`
   
   **Variable 2:**
   - Key: `STRIPE_PUBLISHABLE_KEY`
   - Value: `pk_test_51Sn3O4GRdegJOpfLIthHZpWjG0NEPpRipyVNkgkZPvDtcxiS42Tpbw44DySCoE77EHpodHFlYFggKcyc5n1owAXS00QPLspmVn`
   
   **Variable 3:**
   - Key: `SERPAPI_KEY`
   - Value: `8f0dbd9504d4b13eab4f0c7d688c6483fee216e26bf4646ae8942cb9b30c6633`

3. **PORT** is optional (Render sets it automatically, but you can add `PORT=10000` if you want)

---

## Step 6: Deploy!

1. Scroll to the bottom
2. Click **"Create Web Service"**
3. Wait 2-3 minutes while Render:
   - Clones your repository
   - Installs dependencies (`npm install`)
   - Starts your server
   - Deploys your site

---

## Step 7: Your Site is Live! 🎉

Once deployment completes, you'll see:
- ✅ **Status:** Live
- 🌐 **Your URL:** `https://zena-deals.onrender.com` (or similar)

**Click the URL to visit your live site!**

---

## Step 8: Update Stripe Success/Cancel URLs

After deployment, update your Stripe checkout URLs:

1. Go to your Render dashboard
2. Copy your live URL (e.g., `https://zena-deals.onrender.com`)
3. In `server.js`, update the success/cancel URLs (or we can do this later)

---

## Important Notes

### Free Tier Limitations:
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **First request after spin-down takes ~30 seconds** (wake-up time)
- ✅ **750 hours/month free** (enough for always-on if you get traffic)
- ✅ **Free SSL certificate** (HTTPS)
- ✅ **Automatic deployments** when you push to GitHub

### To Keep It Always On:
- Get some traffic (visitors keep it awake)
- Or upgrade to paid plan ($7/month for always-on)

### Updating Your Site:
- Just push to GitHub: `git push origin master`
- Render automatically redeploys! 🚀

---

## Troubleshooting

**"Build failed"**
- Check the logs in Render dashboard
- Make sure `package.json` has all dependencies
- Verify build command is `npm install`

**"Application error"**
- Check environment variables are set correctly
- Check logs for error messages
- Make sure `PORT` is set (Render sets it automatically, but check)

**"Can't connect to API"**
- Verify environment variables are set
- Check that SerpAPI key is correct
- Check Render logs for specific errors

---

## Next Steps After Deployment

1. ✅ Test your site at the Render URL
2. ✅ Test the search functionality
3. ✅ Test the payment flow (use Stripe test card: `4242 4242 4242 4242`)
4. ✅ Share your site URL with others!

**Your site is now live on the internet!** 🌐
