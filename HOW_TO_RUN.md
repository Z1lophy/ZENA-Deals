# How to Run Your Website Locally

## Quick Start (Easiest Method)

### Option 1: Double-click the batch file (Windows)
1. Simply double-click `START_SERVER.bat`
2. A terminal window will open
3. Open your browser and go to: `http://localhost:8000`

### Option 2: Use PowerShell
1. Right-click in the "ZENA Deals" folder
2. Select "Open in Terminal" or "Open PowerShell window here"
3. Type: `python -m http.server 8000`
4. Press Enter
5. Open your browser and go to: `http://localhost:8000`

### Option 3: Use Command Prompt
1. Open Command Prompt (cmd)
2. Navigate to your folder:
   ```
   cd "C:\Users\schmi\Desktop\ZENA Deals"
   ```
3. Type: `python -m http.server 8000`
4. Press Enter
5. Open your browser and go to: `http://localhost:8000`

## Important Notes

- **Don't run the command inside Python** - If you see `>>>` prompt, type `exit()` first
- Keep the terminal window open while using the website
- Press `Ctrl+C` in the terminal to stop the server
- The website will be available at `http://localhost:8000`

## Alternative: Use VS Code Live Server

If you have VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Alternative: Use Node.js (if installed)

If you have Node.js installed:
```
npx http-server -p 8000
```

## Troubleshooting

**"python is not recognized"**
- Make sure Python is installed
- Try `py -m http.server 8000` instead

**Port 8000 already in use**
- Try a different port: `python -m http.server 8080`
- Then use: `http://localhost:8080`
