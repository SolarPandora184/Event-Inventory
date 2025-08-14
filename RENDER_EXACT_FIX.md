# Exact Steps to Fix Render Deployment

## The Issue
Your build command is still `npm run build` but needs to be `npm install --include=dev && npm run build`

## Exact Steps in Render Dashboard:

1. Go to https://dashboard.render.com
2. Click on "Event-Inventory" service 
3. Click "Settings" tab
4. Scroll to "Build & Deploy" section
5. In "Build Command" field, change from:
   ```
   npm run build
   ```
   To:
   ```
   npm install --include=dev && npm run build
   ```
6. Click "Save Changes" button
7. Go back to main service page
8. Click "Manual Deploy" dropdown
9. Click "Deploy latest commit"

## Alternative if Settings Won't Save:

Delete and recreate the service with correct build command from the start.

## What This Does:
Forces installation of vite, esbuild, and other build tools that are in devDependencies but needed for production build.