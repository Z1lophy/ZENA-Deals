# Quick Fix: Remove API Keys from Git History

GitHub blocked your push because it detected API keys in your code. Here's how to fix it:

## Step 1: Create .env file (for local development)

Create a file named `.env` in your project root with:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
SERPAPI_KEY=your_serpapi_key_here
PORT=3000
```

**Get your keys from:**
- Stripe: https://dashboard.stripe.com/apikeys
- SerpAPI: https://serpapi.com/dashboard

## Step 2: Install dotenv

```bash
npm install
```

This will install the `dotenv` package we added to package.json.

## Step 3: Remove keys from Git history

Since you already committed the keys, you need to remove them from Git history:

```bash
# Remove the keys from the last commit
git reset --soft HEAD~1

# Stage all files again (keys are now removed from code)
git add .

# Commit again (without keys)
git commit -m "Initial commit - ZENA Deals"

# Force push (since you're rewriting history)
git push --force origin master
```

**OR** if you want to keep your commit history, use GitHub's secret scanning bypass:

1. Go to: https://github.com/Z1lophy/ZENA-Deals/security/secret-scanning/unblock-secret/37wjTGUQvFBVShbJ3ZT7fr1hAK
2. Click "Allow secret" (only if you're sure the keys are test keys)
3. Then push again

## Step 4: Verify .env is ignored

Make sure `.env` is in `.gitignore` (it should be already).

## Step 5: Push again

```bash
git push --set-upstream origin master
```

## For Production Deployment

When deploying to Render/Railway/etc., add these as **Environment Variables** in the dashboard (NOT in code):

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`  
- `SERPAPI_KEY`

See `ENV_SETUP.md` for detailed instructions.
