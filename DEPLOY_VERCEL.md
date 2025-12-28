# Deploying to Vercel - Detailed Guide

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm i -g vercel
```

Or you can deploy directly from GitHub if your code is in a repository.

## Step 2: Verify Your Files Are Set Up

Make sure these files exist in your project:

1. ✅ `api/proxy/[...path].ts` - The serverless function (already created)
2. ✅ `vercel.json` - The rewrite configuration (already created)
3. ✅ `.env.local` - Your local environment file (you should have this)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy:**
   ```bash
   cd chameleon-royale
   vercel
   ```

3. **For production deployment:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via GitHub (Recommended)

1. **Push your code to GitHub** (if not already)

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure the project:**
   - Framework Preset: Vite
   - Root Directory: `chameleon-royale` (if your repo root is the parent folder)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 4: Set Environment Variables in Vercel

This is the **most important step**:

1. **In your Vercel project dashboard**, go to **Settings** → **Environment Variables**

2. **Add a new environment variable:**
   - **Key:** `CLASH_ROYALE_API_TOKEN`
   - **Value:** Your actual Clash Royale API token (the long JWT token)
   - **Environment:** Select all (Production, Preview, Development)

3. **Click "Save"**

4. **Important:** After adding the environment variable, you need to **redeploy** for it to take effect:
   - Go to the **Deployments** tab
   - Click the **three dots** (...) on your latest deployment
   - Select **Redeploy**
   - Make sure to select the same environment (Production, Preview, etc.)

## Step 5: Verify the Deployment

1. **Check that your app is running** at the Vercel URL

2. **Test the API proxy:**
   - Open your browser's developer console (F12)
   - Try starting a game
   - Check the Network tab - you should see requests to `/api/clashroyale/cards`
   - They should return 200 (success) instead of falling back to the static card list

3. **If it's still using fallback cards:**
   - Check the browser console for errors
   - Verify the environment variable is set correctly in Vercel
   - Make sure you redeployed after adding the environment variable
   - Check the Vercel function logs: Go to **Deployments** → Click your deployment → **Functions** tab → Click on `api/proxy` to see logs

## Troubleshooting

### The proxy function isn't working

**Check the Vercel function logs:**
1. Go to your deployment in Vercel dashboard
2. Click on the **Functions** tab
3. Click on `api/proxy`
4. Check for errors like "API token not configured"

### Getting 500 errors

**Common causes:**
- Environment variable `CLASH_ROYALE_API_TOKEN` is not set
- Environment variable has the wrong name (should be exactly `CLASH_ROYALE_API_TOKEN`)
- Need to redeploy after adding the environment variable

### Still seeing fallback cards

**Check:**
1. Browser console for fetch errors
2. Network tab to see what status code `/api/clashroyale/cards` returns
3. Vercel function logs for errors
4. Make sure the API token is valid and not expired

## File Structure

Your project should look like this:

```
chameleon-royale/
├── api/
│   └── proxy/
│       └── [...path].ts    ← Serverless function
├── vercel.json             ← Rewrite configuration
├── vite.config.ts
├── package.json
└── ... (other files)
```

## Important Notes

- The `api/` folder must be at the root of your project (where `package.json` is)
- Vercel automatically detects TypeScript files in the `api/` folder
- The environment variable must be set in Vercel's dashboard, not just in `.env.local`
- `.env.local` only works locally - Vercel needs the environment variable in its dashboard

### About Deprecation Warnings

If you see a deprecation warning about `url.parse()` in your Vercel deployment logs:
- This warning comes from Vercel's runtime or dependencies, not your code
- The code already uses the modern WHATWG URL API
- The project is configured with:
  - Updated `@vercel/node` package (latest 3.x version)
  - Node.js 22.x runtime (configured in `vercel.json`)
- These updates should minimize or eliminate the warning
- If the warning persists, it's a known issue with Vercel's runtime and will be resolved in future Vercel updates
- The warning is harmless and doesn't affect functionality


