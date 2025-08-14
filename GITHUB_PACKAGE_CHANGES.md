# Exact Package.json Changes for GitHub

## In your GitHub repository, edit package.json:

### MOVE these lines FROM "devDependencies" TO "dependencies":

**Add to dependencies section (around line 77, before the closing bracket):**
```json
    "vite": "^5.4.19",
    "esbuild": "^0.25.0",
    "typescript": "5.6.3",
    "@vitejs/plugin-react": "^4.3.2"
```

**Remove from devDependencies section (lines 93, 96, 100, 101):**
```json
    "@vitejs/plugin-react": "^4.3.2",
    "esbuild": "^0.25.0", 
    "typescript": "5.6.3",
    "vite": "^5.4.19"
```

## Complete dependencies section should look like:
```json
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.10.4",
    [... all existing dependencies ...]
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0",
    "vite": "^5.4.19",
    "esbuild": "^0.25.0",
    "typescript": "5.6.3",
    "@vitejs/plugin-react": "^4.3.2"
  }
```

## After making changes:
1. Commit and push to GitHub
2. Render will automatically redeploy
3. Build should succeed since vite and esbuild will be installed