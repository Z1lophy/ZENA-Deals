# Quick Start - Deploy to Render (5 Minutes)

## Step 1: Push to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/zena-deals.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your `zena-deals` repository
5. Configure:
   - **Name:** zena-deals (or your choice)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. Your site is live! 🎉

## Step 3: Add Environment Variables (Optional)

In Render dashboard → Environment:
- Add `STRIPE_SECRET_KEY` (if you want to change it)
- Add `STRIPE_PUBLISHABLE_KEY` (if you want to change it)

## That's it!

Your site will be live at: `https://your-app-name.onrender.com`

**Note:** Free tier spins down after 15 min inactivity. First request takes ~30 seconds to wake up.

---

## Alternative: Railway (Always On)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repo
5. Done! (Auto-detects Node.js)

Your site: `https://your-app-name.up.railway.app`
