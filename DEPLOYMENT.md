# 🚀 Deployment Guide - Hapi Voucher Frontend

## 📋 Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn
- Vercel account
- Git repository

## 🔧 Pre-deployment Setup

### 1. Environment Variables

Copy the environment example file and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your production values:

```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=Hapi Voucher System
VITE_APP_VERSION=1.0.0

# Production Mode
VITE_NODE_ENV=production
```

### 2. Test Build Locally

```bash
# Install dependencies
npm install

# Test production build
npm run build

# Preview production build
npm run preview
```

## 🌐 Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy from project directory:**

   ```bash
   cd /path/to/hapi-voucher-frontend
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Choose your account/team
   - Link to existing project? `N` (for first deployment)
   - Project name: `hapi-voucher-frontend` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings? `N`

5. **Set Environment Variables:**

   ```bash
   vercel env add VITE_API_BASE_URL
   vercel env add VITE_API_TIMEOUT
   vercel env add VITE_APP_NAME
   vercel env add VITE_APP_VERSION
   vercel env add VITE_NODE_ENV
   ```

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local`

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## 🔄 Continuous Deployment

Once connected to Vercel:

- **Automatic deployments** on every push to `main` branch
- **Preview deployments** for pull requests
- **Manual deployments** via Vercel dashboard

## 📁 Project Structure for Deployment

```
hapi-voucher-frontend/
├── vercel.json          # Vercel configuration
├── vite.config.ts       # Vite build configuration
├── env.example          # Environment variables template
├── dist/                # Build output (generated)
└── src/                 # Source code
```

## ⚙️ Vercel Configuration

The `vercel.json` file includes:

- **Framework detection**: Automatically detects Vite
- **SPA routing**: All routes redirect to `index.html`
- **Asset caching**: Optimized caching for static assets
- **Build optimization**: Code splitting and minification

## 🐛 Troubleshooting

### Build Failures

1. **TypeScript errors:**

   ```bash
   npm run type-check
   ```

2. **Missing dependencies:**

   ```bash
   npm install
   ```

3. **Environment variables:**
   - Ensure all `VITE_*` variables are set in Vercel
   - Check variable names match exactly

### Runtime Issues

1. **API connection errors:**
   - Verify `VITE_API_BASE_URL` is correct
   - Check CORS settings on backend
   - Ensure backend is accessible from Vercel

2. **Routing issues:**
   - Verify `vercel.json` rewrites configuration
   - Check Vue Router history mode settings

## 📊 Performance Optimization

The build includes:

- **Code splitting**: Vendor, UI, and utility chunks
- **Tree shaking**: Unused code elimination
- **Minification**: Terser for optimal bundle size
- **Asset optimization**: Compressed static assets

## 🔒 Security Considerations

- Environment variables are secure in Vercel
- No sensitive data in client-side code
- API keys should be backend-only
- Use HTTPS in production

## 📈 Monitoring

After deployment:

1. **Check Vercel Analytics** for performance metrics
2. **Monitor error logs** in Vercel dashboard
3. **Set up alerts** for deployment failures
4. **Track Core Web Vitals** for user experience

## 🎯 Next Steps

1. **Domain setup**: Configure custom domain in Vercel
2. **SSL certificate**: Automatic HTTPS with Vercel
3. **CDN**: Global edge network for fast loading
4. **Analytics**: Integrate with Google Analytics or similar

---

**🎉 Your Vue.js app is now deployed on Vercel!**

Visit your deployment URL to see your live application.
