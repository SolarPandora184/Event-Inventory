# Package.json Fix for Render Deployment

## Issue
Render is not installing devDependencies by default, causing "vite: not found" error.

## Solution
Move these packages from devDependencies to dependencies:
- vite
- esbuild
- typescript
- @vitejs/plugin-react

## Steps to Fix
1. Edit package.json in your GitHub repository
2. Move the above packages from devDependencies to dependencies section
3. Commit and push changes
4. Render will auto-deploy the fix

## Alternative Quick Fix
Change build command in Render to:
```
npm install --include=dev && npm run build
```

This forces installation of dev dependencies during build.