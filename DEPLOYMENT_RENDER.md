# Deploy to Render (Free Tier)

## Prerequisites
1. GitHub account
2. Render account (free at render.com)

## Step 1: Push Code to GitHub
1. Create a new repository on GitHub
2. Push your Replit code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AESA Squadron Inventory System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: aesa-squadron-inventory
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 3: Environment Variables
Your Firebase config is already in the code, so no additional environment variables needed.

## Step 4: Custom Domain (Optional)
- Render provides a free .onrender.com subdomain
- You can add a custom domain if you have one

## Important Notes
- **Free tier sleeps after 15 minutes of inactivity**
- **Wakes up automatically when someone visits** (takes ~30 seconds)
- Perfect for military events with intermittent usage
- No cost as long as you stay within free tier limits

## Your App Will Be Available At:
`https://aesa-squadron-inventory.onrender.com`

## Firebase Considerations
Your Firebase Realtime Database will work perfectly with Render hosting. No changes needed to your Firebase configuration.