# Quick Render 502 Fix

## Most Common Issue: Build Command

1. Go to your Render dashboard
2. Click on "Event-Inventory" service
3. Go to "Settings" tab
4. Change Build Command to: `npm run build` (remove npm install part)
5. Click "Save Changes"
6. Click "Manual Deploy" → "Deploy latest commit"

## Alternative Fix: Add to package.json manually

If build still fails, edit your GitHub repository and add this to package.json:

```json
"engines": {
  "node": "18.x"
}
```

Add it right after the license line.

## Check Logs
Always check the "Logs" tab in Render for specific error messages.

## Expected Success
Once fixed, you should see:
- "Build successful" in build logs  
- "serving on port XXXX" in deploy logs
- Your app accessible at event-inventory.onrender.com