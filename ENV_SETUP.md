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
   npm install
   ```

3. **The server.js already loads .env file** - no changes needed!

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

## Getting Your API Keys

**Stripe Keys:**
- Go to: https://dashboard.stripe.com/apikeys
- Copy your test keys (or live keys for production)
- Test keys start with `sk_test_` and `pk_test_`
- Live keys start with `sk_live_` and `pk_live_`

**SerpAPI Key:**
- Go to: https://serpapi.com/dashboard
- Copy your API key

## Security Notes

- ✅ `.env` file is in `.gitignore` (won't be committed)
- ✅ Never share your API keys publicly
- ✅ Use different keys for production (live Stripe keys)
- ✅ Rotate keys if they're ever exposed
- ✅ Test keys are safe to use in development but should still be kept private