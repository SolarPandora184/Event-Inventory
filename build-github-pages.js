#!/bin/bash

# Simple GitHub Pages build script
# Run this to prepare files for GitHub Pages hosting

echo "Building for GitHub Pages..."

# Build the app
npm run build

# Copy and modify index.html for GitHub Pages
cp dist/public/index.html ./index.html
sed -i 's|src="/assets/|src="./assets/|g' index.html
sed -i 's|href="/assets/|href="./assets/|g' index.html

# Create 404.html for SPA routing
cp index.html 404.html

# Copy assets
cp -r dist/public/assets ./

echo "GitHub Pages build complete!"
echo "Files created: index.html, 404.html, assets/"
echo "Commit and push these files to deploy to GitHub Pages"