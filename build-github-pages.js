#!/usr/bin/env node

/**
 * Build script for GitHub Pages deployment
 * This script builds the app and sets up the files needed for GitHub Pages hosting
 */

import { execSync } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔨 Building for GitHub Pages...');

// Build the application
console.log('📦 Building application...');
execSync('npm run build', { stdio: 'inherit' });

// Copy the built index.html to root, but modify asset paths for GitHub Pages
console.log('📄 Setting up index.html for GitHub Pages...');
const builtIndexPath = join('dist', 'public', 'index.html');
const builtIndex = readFileSync(builtIndexPath, 'utf8');

// Modify asset paths to be relative for GitHub Pages
const modifiedIndex = builtIndex
  .replace(/src="\/assets\//g, 'src="./assets/')
  .replace(/href="\/assets\//g, 'href="./assets/')
  .replace('<title>Vite + React + TS</title>', '<title>AESA Squadron 72 - Inventory Management System</title>')
  .replace('<head>', '<head>\n    <meta name="description" content="Military inventory tracking and request management system for AESA Squadron 72. Streamlined equipment requests and administrative oversight.">')
  // Remove the replit dev banner for production
  .replace(/\s*<!-- This is a replit script.*?<script.*?replit-dev-banner\.js"><\/script>/s, '');

writeFileSync('index.html', modifiedIndex);

// Create 404.html for SPA routing on GitHub Pages
console.log('🔄 Creating 404.html for client-side routing...');
const spa404Content = modifiedIndex.replace(
  '<div id="root"></div>',
  `<div id="root"></div>
    <script>
      // Handle client-side routing for GitHub Pages
      // This script redirects 404 errors back to the index.html 
      // which allows the React router to handle the routing
      sessionStorage.redirect = location.href;
    </script>`
);

writeFileSync('404.html', spa404Content);

// Copy assets directory
console.log('📁 Copying assets...');
execSync('cp -r dist/public/assets .', { stdio: 'inherit' });

console.log('✅ GitHub Pages build complete!');
console.log('📝 Files created:');
console.log('  - index.html (main page)');
console.log('  - 404.html (handles SPA routing)');
console.log('  - assets/ (CSS and JS files)');
console.log('');
console.log('🚀 You can now commit and push these files to deploy to GitHub Pages!');