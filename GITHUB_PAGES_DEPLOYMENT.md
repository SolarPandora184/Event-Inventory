# GitHub Pages Deployment

Simple setup for hosting the AESA Squadron 72 Inventory Management System on GitHub Pages.

## Quick Deployment

1. **Build for GitHub Pages**:
   ```bash
   ./build-github-pages.js
   ```

2. **Push to GitHub**:
   ```bash
   git add index.html 404.html assets/
   git commit -m "Deploy to GitHub Pages"
   git push
   ```

3. **Enable GitHub Pages**:
   - Go to your repository Settings > Pages
   - Select "Deploy from a branch" 
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

## What the build script does

The `build-github-pages.js` script:
- Builds the app with `npm run build`
- Copies `index.html` to root with relative asset paths
- Creates `404.html` for client-side routing
- Copies the `assets/` folder to root

## Files created

- `index.html` - Main page
- `404.html` - Handles routing for single-page app
- `assets/` - CSS and JavaScript files

## That's it!

Your app will be available at `https://yourusername.github.io/repository-name/`