<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZSr3PdIaMpt_QJTkl36NDVwlH7iV9wee

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file in the root directory and set `CLASH_ROYALE_API_TOKEN`:
   ```
   CLASH_ROYALE_API_TOKEN=your_clash_royale_api_token_here
   ```
3. Run the app:
   `npm run dev`

## Deploying

The app requires a proxy to access the Clash Royale API (to keep the API token secure and bypass CORS).

### Vercel Deployment
1. The `vercel.json` and `api/proxy/[...path].ts` files are already set up
2. Add `CLASH_ROYALE_API_TOKEN` to your Vercel environment variables
3. Deploy - the proxy will automatically work

### Netlify Deployment
1. The `netlify.toml` and `netlify/functions/proxy.ts` files are already set up
2. Add `CLASH_ROYALE_API_TOKEN` to your Netlify environment variables
3. Deploy - the proxy will automatically work

### Other Platforms
You'll need to set up a proxy/rewrite rule that:
- Rewrites `/api/clashroyale/*` to your backend proxy function
- The proxy should add the `Authorization: Bearer <token>` header
- Set `CLASH_ROYALE_API_TOKEN` as an environment variable
