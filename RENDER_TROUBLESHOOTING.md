# Render Deployment Troubleshooting

## Check Your Render Logs
1. Go to your Render dashboard
2. Click on your "Event-Inventory" service
3. Go to the "Logs" tab
4. Look for error messages during build or startup

## Common 502 Bad Gateway Fixes

### Fix 1: Check Build Command
Make sure your build command is exactly:
```
npm run build
```
(NOT `npm install; npm run build`)

### Fix 2: Verify Node Version
Add this to your package.json if not present:
```json
"engines": {
  "node": "18.x"
}
```

### Fix 3: Check Environment Variables
In Render dashboard:
- Go to Environment tab
- Make sure NODE_ENV is set to "production"

### Fix 4: Check Build Logs
Look for these common errors:
- TypeScript compilation errors
- Missing dependencies
- Vite build failures

## Quick Debug Steps
1. Check if build completed successfully in logs
2. Look for "serving on port XXXX" in startup logs
3. Verify no import/require errors

## If Still Failing
Try deploying with these simplified commands:
- Build: `npm install && npm run build`
- Start: `npm start`

## Alternative: Simplified Deployment
If issues persist, we can create a simplified version that removes complex build steps.