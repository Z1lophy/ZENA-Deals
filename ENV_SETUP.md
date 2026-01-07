# Environment Variables Setup

## ⚠️ IMPORTANT: Never commit API keys to GitHub!

GitHub automatically blocks pushes that contain API keys or secrets. Always use environment variables.

## Local Development Setup

1. **Create a `.env` file** in the project root:
   ```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
SERPAPI_KEY=your_serpapi_key_here
   PORT=3000
   ```

2. **Install dotenv package** (if not already installed):
   ```bash
   npm install dotenv
   ```

3. **Update server.js** to load .env file (add at the top):
   ```javascript
   require('dotenv').config();
   ```

## Production Deployment (Render/Railway/etc.)

Add environment variables in your hosting platform's dashboard:

### Render
1. Go to your service dashboard
2. Click "Environment"
3. Add each variable:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `SERPAPI_KEY`
   - `PORT` (optional, defaults to 3000)

### Railway
1. Go to your project
2. Click "Variables"
3. Add each variable

### Fly.io
```bash
fly secrets set STRIPE_SECRET_KEY=your_key_here
fly secrets set STRIPE_PUBLISHABLE_KEY=your_key_here
fly secrets set SERPAPI_KEY=your_key_here
```

## Your Current Keys

**Stripe Secret Key:**
```
sk_test_your_secret_key_here
```

**Stripe Publishable Key:**
```
pk_test_your_publishable_key_here
```

**SerpAPI Key:**
```
your_serpapi_key_here
```

## Security Notes

- ✅ `.env` file is in `.gitignore` (won't be committed)
- ✅ Never share your API keys publicly
- ✅ Use different keys for production (live Stripe keys)
- ✅ Rotate keys if they're ever exposed
