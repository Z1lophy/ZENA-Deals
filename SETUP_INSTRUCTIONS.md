# Setup Instructions - Fix CORS Error

## The Problem
SerpAPI blocks direct browser requests due to CORS security. You need a backend proxy to make it work.

## Solution: Use the Node.js Backend Server

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Download from: https://nodejs.org/
2. Install it (choose the LTS version)

### Step 2: Install Dependencies
Open a terminal in your "Best deals" folder and run:
```bash
npm install
```

This will install Express and CORS packages needed for the server.

### Step 3: Start the Server
Run:
```bash
npm start
```

You should see:
```
✅ Server running at http://localhost:3000
📱 Open your browser and go to: http://localhost:3000
```

### Step 4: Open Your Website
Open your browser and go to: **http://localhost:3000**

The website will now work with real product prices! 🎉

## Alternative: Quick Start Script

I've created a batch file for Windows:
1. Double-click `START_NODE_SERVER.bat`
2. Wait for "Server running" message
3. Open http://localhost:3000 in your browser

## What Changed?

- **Before**: Direct API calls from browser → CORS blocked ❌
- **Now**: Browser → Your Node.js server → SerpAPI → Works! ✅

The server acts as a proxy, keeping your API key secure and bypassing CORS restrictions.

## Troubleshooting

**"npm is not recognized"**
- Make sure Node.js is installed
- Restart your terminal after installing Node.js

**"Port 3000 already in use"**
- Close other applications using port 3000
- Or edit `server.js` and change `PORT = 3000` to a different number

**Still getting errors?**
- Make sure the server is running (you should see the "Server running" message)
- Make sure you're accessing http://localhost:3000 (not file://)
- Check the terminal for error messages

## Deploying Online (Free Options)

Once it works locally, you can deploy for free:

### Netlify (Easiest)
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify deploy`
3. Follow the prompts

### Heroku
1. Create account at heroku.com
2. Install Heroku CLI
3. Run: `heroku create` then `git push heroku main`

### Railway
1. Sign up at railway.app
2. Connect your GitHub repo
3. Deploy automatically
