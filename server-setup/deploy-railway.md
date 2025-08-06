# Deploy to Railway (Fastest - 15 minutes)

## 1. Setup Railway Account
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

## 2. Deploy Server
```bash
# In the server-setup directory
cd server-setup

# Initialize Railway project
railway init

# Add environment variables
railway variables set MONGODB_URI="your-mongodb-connection-string"
railway variables set SESSION_SECRET="your-super-secret-key"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://nuerotruama2026.vercel.app"

# Deploy
railway up
```

## 3. Get Server URL
```bash
# Get your server URL
railway domain
```

Your server will be available at: `https://your-app.railway.app`

## 4. Update Frontend
Update your Next.js app to use the server:

```javascript
// In your frontend, update API calls to use the server
const API_BASE = 'https://your-app.railway.app'

// Example login function
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  })
  return response.json()
}
```

## 5. Test Multi-Device Sessions
- Login from Device A → Session A created
- Login from Device B → Session B created  
- Both devices stay logged in! ✅

## Alternative: Deploy to Heroku (20 minutes)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create neurotrauma-server

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set SESSION_SECRET="your-secret"
heroku config:set FRONTEND_URL="https://nuerotruama2026.vercel.app"

# Deploy
git init
git add .
git commit -m "Initial server setup"
heroku git:remote -a neurotrauma-server
git push heroku main
```

## Alternative: Deploy to DigitalOcean App Platform (25 minutes)
1. Push code to GitHub
2. Connect DigitalOcean to GitHub repo
3. Set environment variables in DO dashboard
4. Deploy automatically

## Benefits of Dedicated Server:
✅ **True multi-device sessions** - Each device maintains independent sessions
✅ **Persistent session storage** - Sessions stored in MongoDB, survive server restarts  
✅ **Real-time session management** - View/terminate sessions from any device
✅ **Better performance** - No cold starts, persistent connections
✅ **Proper session cleanup** - Automatic cleanup of expired sessions
✅ **Enhanced security** - Server-side session validation
✅ **Scalability** - Can handle thousands of concurrent sessions