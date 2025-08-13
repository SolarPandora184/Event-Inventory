# GitHub Pages Deployment Guide

This guide explains how to deploy the AESA Squadron 72 Inventory Management System to GitHub Pages.

## Quick Setup

The repository now includes the necessary files for GitHub Pages deployment:

- `index.html` - Main page with corrected asset paths
- `404.html` - Handles client-side routing for single-page app
- `assets/` - CSS and JavaScript files

## Deployment Steps

1. **Push to GitHub**: Commit and push all files to your GitHub repository
2. **Enable GitHub Pages**: 
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

## Manual Build Process

If you need to rebuild the static files:

1. Run the build command:
   ```bash
   npm run build
   ```

2. Copy the built files to the root:
   ```bash
   # Copy the built index.html and modify asset paths
   cp dist/public/index.html ./index.html
   
   # Update asset paths in index.html from "/assets/" to "./assets/"
   sed -i 's|src="/assets/|src="./assets/|g' index.html
   sed -i 's|href="/assets/|href="./assets/|g' index.html
   
   # Copy the 404.html for SPA routing
   cp index.html 404.html
   
   # Copy assets directory
   cp -r dist/public/assets .
   ```

3. Commit and push the updated files

## Files for GitHub Pages

- `index.html` - Entry point with relative asset paths
- `404.html` - Handles client-side routing (same as index.html)
- `assets/index-[hash].js` - Main JavaScript bundle
- `assets/index-[hash].css` - Compiled CSS styles

## Important Notes

- The app is configured as a Single Page Application (SPA)
- Client-side routing is handled by the 404.html file
- All asset paths use relative URLs (`./assets/`) for GitHub Pages compatibility
- The app will work offline once loaded since it's a static build

## What The Error "Did you forget to add the page to the router" Means

This error message appears when:
1. You're trying to access a direct URL (like `/admin` or `/inventory`) on GitHub Pages
2. GitHub Pages serves the 404.html file instead of letting React handle the routing
3. The app shows the "404 Page Not Found" component from the NotFound page

This is **normal behavior** that gets fixed once you deploy to GitHub Pages with the proper routing setup.

## How The Fix Works

The setup includes:
1. **404.html** - Automatically redirects failed routes back to the main app
2. **Route handling in main.tsx** - Restores the original URL after redirect
3. **Relative asset paths** - Ensures CSS and JavaScript load properly

## Troubleshooting

If you see "Did you forget to add the page to the router":
1. This is expected when testing locally with direct URL access
2. The error will disappear once deployed to GitHub Pages
3. Make sure you push both `index.html` and `404.html` to your repository

If you see 404 errors on GitHub Pages:
1. Ensure all files are in the repository root
2. Check that GitHub Pages is enabled and pointing to the main branch
3. Verify asset paths are relative (start with `./`)

If routing doesn't work after deployment:
1. Ensure 404.html exists and has the redirect script
2. Check that the GitHub Pages URL is using HTTPS
3. Wait a few minutes for GitHub Pages to update after pushing changes