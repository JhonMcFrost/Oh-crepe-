# 🚀 Oh Crêpe! - Deployment Guide

## Vercel Deployment Setup

This project is now fully configured for deployment on Vercel with all necessary optimizations.

### 📋 Pre-Deployment Checklist

- ✅ `vercel.json` - Vercel configuration with proper routing and caching
- ✅ `angular.json` - Optimized build configuration for production
- ✅ `package.json` - Updated with deployment scripts
- ✅ Environment files - Development and production configurations
- ✅ `.gitignore` - Excludes build artifacts and sensitive files
- ✅ Asset paths - All images use absolute paths for Vercel hosting

### 🔧 Deployment Options

#### Option 1: GitHub Integration (Recommended)
1. Push your code to GitHub repository
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push to main branch

#### Option 2: Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

#### Option 3: Drag & Drop
1. Build the project locally: `npm run build:prod`
2. Drag the `dist/oh_crepe` folder to Vercel dashboard

### 🌐 Environment Configuration

Update the production API URL in `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-api.vercel.app/api', // Update this
  appName: 'Oh Crêpe!',
  version: '1.0.0'
};
```

### 📦 Build Commands

- `npm run build` - Standard build
- `npm run build:prod` - Production optimized build
- `npm run vercel-build` - Vercel-specific build (used automatically)
- `npm run preview` - Local production preview

### 🔍 Vercel Configuration Features

- **SPA Routing**: All routes redirect to index.html for Angular routing
- **Caching**: Assets cached for 1 year with immutable headers
- **Optimization**: Gzip compression and asset optimization
- **Framework Detection**: Auto-detected as Angular project

### 📊 Performance Optimizations

- Bundle size increased to 5MB maximum for crêpe images
- Component styles optimized
- Tree shaking enabled
- AOT compilation enabled
- Source maps disabled in production

### 🛠️ Troubleshooting

#### Build Errors
```bash
# Clear Angular cache
npm run ng cache clean

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### Asset Loading Issues
- Ensure all asset paths start with `/assets/`
- Check that images exist in `src/assets/images/`
- Verify `angular.json` assets configuration

#### Routing Issues
- `vercel.json` handles SPA routing automatically
- All routes redirect to `index.html`

### 🔗 Post-Deployment

1. Test all routes and functionality
2. Verify image loading
3. Check browser console for errors
4. Test responsive design on mobile
5. Validate form submissions and navigation

### 🔧 Backend Integration

If deploying the Node.js backend:
1. Deploy backend separately to Vercel as serverless functions
2. Update `environment.prod.ts` with backend URL
3. Ensure CORS is configured for your frontend domain

### 📈 Analytics & Monitoring

Consider adding:
- Vercel Analytics for performance monitoring
- Error tracking service
- User analytics

---

## 🎯 Quick Deploy Commands

```bash
# Build and test locally
npm run build:prod
npm run preview

# Deploy to Vercel
vercel --prod

# Or push to GitHub for auto-deployment
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

Your Oh Crêpe! application is now ready for production deployment! 🥞