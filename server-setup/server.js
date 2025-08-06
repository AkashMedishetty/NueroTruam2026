const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}))
app.use(compression())
app.use(cookieParser())

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://nuerotruama2026.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 30 * 24 * 60 * 60 // 30 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'neurotrauma.sid'
}))

// User model (simplified)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    designation: String,
    institution: String
  },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  activeSessions: [{
    sessionId: String,
    deviceId: String,
    deviceFingerprint: String,
    loginTime: Date,
    lastActivity: Date,
    userAgent: String,
    ipAddress: String
  }]
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)

// Middleware to track active sessions
const trackSession = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const deviceFingerprint = req.headers['x-device-fingerprint'] || 
                               req.session.deviceFingerprint ||
                               `${req.ip}_${req.headers['user-agent']?.substring(0, 50)}`
      
      await User.findByIdAndUpdate(req.session.userId, {
        $set: {
          'activeSessions.$[elem].lastActivity': new Date()
        }
      }, {
        arrayFilters: [{ 'elem.deviceFingerprint': deviceFingerprint }]
      })
    } catch (error) {
      console.error('Session tracking error:', error)
    }
  }
  next()
}

app.use(trackSession)

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create device fingerprint
    const deviceFingerprint = req.headers['x-device-fingerprint'] || 
                             `${req.ip}_${req.headers['user-agent']?.substring(0, 50)}_${Date.now()}`
    
    const sessionData = {
      sessionId: req.sessionID,
      deviceId: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      deviceFingerprint,
      loginTime: new Date(),
      lastActivity: new Date(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    }

    // Add session to user's active sessions
    await User.findByIdAndUpdate(user._id, {
      $push: { activeSessions: sessionData }
    })

    // Set session data
    req.session.userId = user._id.toString()
    req.session.userEmail = user.email
    req.session.userRole = user.role
    req.session.deviceFingerprint = deviceFingerprint
    req.session.loginTime = Date.now()

    console.log('✅ Server login successful:', {
      userId: user._id,
      email: user.email,
      deviceFingerprint,
      sessionId: req.sessionID,
      totalSessions: user.activeSessions.length + 1
    })

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        role: user.role
      },
      session: {
        sessionId: req.sessionID,
        deviceFingerprint,
        loginTime: Date.now()
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/logout', async (req, res) => {
  try {
    if (req.session.userId) {
      const deviceFingerprint = req.session.deviceFingerprint
      
      // Remove this session from user's active sessions
      await User.findByIdAndUpdate(req.session.userId, {
        $pull: { 
          activeSessions: { deviceFingerprint } 
        }
      })
      
      console.log('✅ Server logout:', {
        userId: req.session.userId,
        deviceFingerprint,
        sessionId: req.sessionID
      })
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' })
      }
      res.clearCookie('neurotrauma.sid')
      res.json({ success: true })
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

app.get('/api/auth/session', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        role: req.session.userRole
      },
      session: {
        sessionId: req.sessionID,
        deviceFingerprint: req.session.deviceFingerprint,
        loginTime: req.session.loginTime
      }
    })
  } else {
    res.json({ authenticated: false })
  }
})

app.get('/api/auth/active-sessions', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const user = await User.findById(req.session.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Clean up expired sessions (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeSessions = user.activeSessions.filter(
      session => session.lastActivity > thirtyDaysAgo
    )

    // Update user with cleaned sessions
    if (activeSessions.length !== user.activeSessions.length) {
      await User.findByIdAndUpdate(req.session.userId, {
        activeSessions
      })
    }

    const formattedSessions = activeSessions.map(session => ({
      sessionId: session.sessionId,
      deviceId: session.deviceId,
      deviceFingerprint: session.deviceFingerprint,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      userAgent: session.userAgent,
      isCurrent: session.deviceFingerprint === req.session.deviceFingerprint
    }))

    res.json(formattedSessions)
  } catch (error) {
    console.error('Active sessions error:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

app.post('/api/auth/terminate-session', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const { deviceFingerprint } = req.body
    
    if (!deviceFingerprint) {
      return res.status(400).json({ error: 'Device fingerprint required' })
    }

    if (deviceFingerprint === req.session.deviceFingerprint) {
      return res.status(400).json({ error: 'Cannot terminate current session' })
    }

    await User.findByIdAndUpdate(req.session.userId, {
      $pull: { 
        activeSessions: { deviceFingerprint } 
      }
    })

    console.log('✅ Session terminated:', {
      userId: req.session.userId,
      terminatedDevice: deviceFingerprint,
      byDevice: req.session.deviceFingerprint
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Terminate session error:', error)
    res.status(500).json({ error: 'Failed to terminate session' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    sessions: req.sessionStore ? 'connected' : 'disconnected'
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeuroTrauma Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔐 Session store: MongoDB`)
  console.log(`🌐 CORS enabled for frontend`)
})

module.exports = app