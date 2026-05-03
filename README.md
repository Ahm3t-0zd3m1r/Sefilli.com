<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/49d51e54-7894-4a9c-ad93-9e6778e9db87

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in `.env.local`
3. Run the app:
   `npm run dev`

## Vercel setup

Add `GEMINI_API_KEY` to your Vercel project environment variables.
The app now uses a server-side `/api/gemini` endpoint so the API key is no longer exposed to the browser bundle.

## Upload behavior

Image uploads still require an authenticated Firebase user.
The Firebase Storage size limit is aligned to 10 MB.
