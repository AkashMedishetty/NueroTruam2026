# 🚀 Automated Production Deployment & Cache Invalidation Guide

This guide explains how to set up automated cache invalidation for your Next.js PWA, ensuring users always receive the latest version without manual intervention.

## 📋 Overview

The system automatically:
- ✅ Generates unique cache versions on each deployment
- ✅ Invalidates old caches across all user devices
- ✅ Forces service worker updates
- ✅ Reloads user browsers with new content
- ✅ Sends deployment notifications

## 🔧 Setup Instructions

### 1. Repository Secrets (Required)

Add these secrets to your GitHub repository:

```bash
# Go to: Settings > Secrets and variables > Actions

# Optional: Notification webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...

# Deployment tokens (choose your platform)
VERCEL_TOKEN=your_vercel_token
NETLIFY_AUTH_TOKEN=your_netlify_token
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 2. Configure Deployment Platform

Edit `.github/workflows/auto-deploy.yml` and uncomment your deployment method:

#### For Vercel:
```yaml
- name: 🌐 Deploy to Production Server
  run: |
    npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

#### For Netlify:
```yaml
- name: 🌐 Deploy to Production Server
  run: |
    npx netlify deploy --prod --auth ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

#### For AWS S3:
```yaml
- name: 🌐 Deploy to Production Server
  run: |
    aws s3 sync .next/ s3://your-bucket-name/
```

#### For Custom Server (SSH):
```yaml
- name: 🌐 Deploy to Production Server
  run: |
    rsync -avz .next/ user@your-server.com:/path/to/app/
```

### 3. Test Scripts (Optional)

Add test commands to `package.json`:

```json
{
  "scripts": {
    "test:ci": "npm run test -- --watchAll=false --coverage",
    "type-check": "tsc --noEmit"
  }
}
```

## 🚀 How It Works

### Automatic Deployment Trigger

The system triggers on:
- ✅ Push to `main`, `master`, or `production` branches
- ✅ Merged pull requests to these branches

### Cache Invalidation Process

1. **Generate Cache Version**
   ```javascript
   // Format: v{timestamp}-{git-hash}
   // Example: v1703123456789-a1b2c3d
   ```

2. **Update Service Worker**
   ```javascript
   // sw-force-update.js gets new version
   const CACHE_VERSION = 'v1703123456789-a1b2c3d';
   ```

3. **Create Manifests**
   ```json
   // cache-manifest.json
   {
     "version": "v1703123456789-a1b2c3d",
     "timestamp": 1703123456789,
     "gitCommit": "a1b2c3d"
   }
   ```

4. **Client-Side Detection**
   ```javascript
   // Auto-cache-updater checks for new versions
   // Clears all caches and reloads page
   ```

## 📱 User Experience

### What Users See:

1. **First Visit**: Normal page load
2. **Update Available**: 
   - Toast notification: "🔄 New version available, updating..."
   - Automatic cache clearing
   - Page reload with latest content
3. **No Manual Action Required**

### Cache Clearing Strategy:

- ✅ Browser caches (`caches.delete()`)
- ✅ Service worker cache
- ✅ localStorage (app-specific items)
- ✅ sessionStorage (app-specific items)
- ✅ Force service worker update

## 🔍 Monitoring & Debugging

### Check Deployment Status

```bash
# View GitHub Actions
https://github.com/your-username/your-repo/actions

# Check deployment logs
# Look for: "🚀 Production deployment completed!"
```

### Verify Cache Invalidation

```javascript
// Open browser console on your site
console.log('Cache Version:', window.CACHE_VERSION);

// Check service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Check caches
caches.keys().then(cacheNames => {
  console.log('Cache Names:', cacheNames);
});
```

### Manual Cache Clear (Emergency)

```javascript
// Run in browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}

caches.keys().then(cacheNames => {
  cacheNames.forEach(cacheName => caches.delete(cacheName));
});

localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

## 🛠️ Manual Deployment

### Local Development

```bash
# Generate new cache version
npm run cache:generate

# Build with cache invalidation
npm run build

# Deploy to production
npm run deploy:prod
```

### Force Cache Update

```bash
# Clear all caches and rebuild
npm run cache:clear
npm run cache:generate
npm run build
```

## 📊 Deployment Artifacts

Each deployment creates:

- `cache-manifest.json` - Version info for client-side checking
- `deployment-manifest.json` - Full deployment metadata
- `sw-force-update.js` - Updated service worker
- Build artifacts in `.next/`

## 🚨 Troubleshooting

### Issue: Users Not Getting Updates

**Solution:**
```bash
# Check if files exist
ls -la public/cache-manifest.json
ls -la public/sw-force-update.js

# Verify cache version in service worker
grep "CACHE_VERSION" public/sw-force-update.js
```

### Issue: Deployment Fails

**Check:**
1. GitHub secrets are set correctly
2. Deployment platform credentials are valid
3. Build passes locally: `npm run build`
4. Tests pass: `npm test`

### Issue: Service Worker Not Updating

**Solution:**
```javascript
// Force service worker update
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-force-update.js', {
    updateViaCache: 'none'
  }).then(registration => {
    registration.update();
  });
}
```

## 📈 Performance Impact

- **Initial Load**: No impact
- **Update Check**: ~1KB network request every 30 seconds
- **Cache Clear**: ~2-3 seconds one-time operation
- **Memory Usage**: Minimal (auto-cleanup)

## 🔒 Security Considerations

- ✅ Only clears app-specific cache items
- ✅ Preserves user authentication (handled separately)
- ✅ No sensitive data in cache manifests
- ✅ HTTPS required for service workers

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Verify browser console for errors
3. Test cache clearing manually
4. Review deployment platform logs

---

**🎉 Congratulations!** Your app now automatically delivers updates to all users without manual intervention.