# Free Deployment Guide - ZENA Deals Website

## 🚀 Free Hosting Options for Node.js Apps

Your website has a Node.js backend, so you need a platform that supports Node.js (not just static hosting).

### Option 1: Render (Recommended - Easiest) ⭐

**Best for:** Quick deployment, free tier, easy setup

1. **Sign up:** Go to [render.com](https://render.com) and create a free account
2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account (or upload files)
3. **Configure:**
   - **Name:** zena-deals (or your choice)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
4. **Environment Variables (if needed):**
   - Add your API keys in the Environment section
5. **Deploy:** Click "Create Web Service"
   - Your site will be live at: `https://your-app-name.onrender.com`

**Free Tier:**
- ✅ Free SSL certificate
- ✅ 750 hours/month (enough for always-on)
- ✅ Automatic deployments from GitHub
- ⚠️ Spins down after 15 minutes of inactivity (first request takes ~30 seconds)

---

### Option 2: Railway (Best Performance)

**Best for:** Fast performance, no spin-down

1. **Sign up:** Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Create Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or upload files)
3. **Configure:**
   - Railway auto-detects Node.js
   - It will run `npm install` and `npm start` automatically
4. **Deploy:**
   - Your site will be live at: `https://your-app-name.up.railway.app`

**Free Tier:**
- ✅ $5 free credit/month (plenty for small apps)
- ✅ No spin-down (always on)
- ✅ Free SSL
- ✅ Fast deployments

---

### Option 3: Fly.io (Great for Global)

**Best for:** Global edge deployment

1. **Install Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```
2. **Sign up:** Go to [fly.io](https://fly.io) and create account
3. **Login:**
   ```bash
   fly auth login
   ```
4. **Deploy:**
   ```bash
   fly launch
   ```
   - Follow the prompts
   - Your site will be live at: `https://your-app-name.fly.dev`

**Free Tier:**
- ✅ 3 shared VMs free
- ✅ 160GB outbound data/month
- ✅ Global edge network

---

### Option 4: Vercel (For Serverless)

**Best for:** Serverless functions (requires code changes)

**Note:** Vercel is serverless, so you'd need to convert your Express server to serverless functions. This is more complex.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

1. ✅ All dependencies are in `package.json`
2. ✅ Your `server.js` uses `process.env.PORT` (for cloud hosting)
3. ✅ API keys are set as environment variables (not hardcoded)
4. ✅ Test locally first

---

## 🔧 Quick Fixes Needed

### 1. Update server.js to use environment PORT

Your server currently uses `PORT = 3000`. Update it to:

```javascript
const PORT = process.env.PORT || 3000;
```

### 2. Set Environment Variables

In your hosting platform, add these environment variables:
- `SERPAPI_KEY` (if you want to change it)
- `STRIPE_SECRET_KEY` (for production, use live keys)
- `STRIPE_PUBLISHABLE_KEY` (for production, use live keys)

---

## 🎯 Recommended: Render (Easiest)

**Steps:**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/zena-deals.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to render.com
   - New → Web Service
   - Connect GitHub repo
   - Configure:
     - Build: `npm install`
     - Start: `node server.js`
   - Deploy!

3. **Your site is live!** 🎉

---

## 💡 Pro Tips

1. **Custom Domain:** Most platforms let you add a custom domain for free
2. **Environment Variables:** Never commit API keys to GitHub - use environment variables
3. **Monitoring:** Set up error tracking (Sentry has a free tier)
4. **Backup:** Keep your code in GitHub

---

## 🆘 Troubleshooting

**"Application error"**
- Check logs in your hosting dashboard
- Make sure all dependencies are in package.json
- Verify PORT is set correctly

**"Module not found"**
- Run `npm install` locally and commit `package-lock.json`
- Check that all dependencies are listed in package.json

**"Port already in use"**
- Make sure you're using `process.env.PORT || 3000`

---

## 📝 Next Steps After Deployment

1. ✅ Test the payment flow with Stripe test cards
2. ✅ Set up Stripe webhooks for production
3. ✅ Add Google Analytics (optional)
4. ✅ Set up custom domain (optional)
5. ✅ Switch to Stripe live keys when ready

Good luck! 🚀
