# Local Testing Guide

## 1. Setup Local Server (5 minutes)

```bash
# Navigate to server directory
cd server-setup

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB connection
# You can use your existing MongoDB connection string
```

## 2. Start Local Server

```bash
# Start the server
npm run dev

# Server will run on http://localhost:3002
```

## 3. Test Server Endpoints

### Test 1: Health Check
```bash
curl http://localhost:3002/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-06T...",
  "sessions": "connected"
}
```

### Test 2: Login Test
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Fingerprint: test-device-1" \
  -d '{"email":"your-test-email@example.com","password":"your-password"}' \
  -c cookies.txt
```

### Test 3: Session Check
```bash
curl http://localhost:3002/api/auth/session \
  -b cookies.txt
```

### Test 4: Multi-Device Test
```bash
# Login from "Device 1"
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Fingerprint: device-1" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c device1-cookies.txt

# Login from "Device 2" 
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Device-Fingerprint: device-2" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c device2-cookies.txt

# Check sessions from Device 1
curl http://localhost:3002/api/auth/active-sessions \
  -b device1-cookies.txt

# Check sessions from Device 2  
curl http://localhost:3002/api/auth/active-sessions \
  -b device2-cookies.txt

# Both should show 2 active sessions! ✅
```

## 4. Frontend Integration Test

Create a simple test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Server Auth Test</title>
</head>
<body>
    <h1>Multi-Device Auth Test</h1>
    
    <div id="login-form">
        <input type="email" id="email" placeholder="Email" value="test@example.com">
        <input type="password" id="password" placeholder="Password" value="password">
        <button onclick="login()">Login</button>
    </div>
    
    <div id="session-info" style="display:none;">
        <h3>Session Info:</h3>
        <pre id="session-data"></pre>
        <button onclick="getActiveSessions()">Get Active Sessions</button>
        <button onclick="logout()">Logout</button>
    </div>
    
    <div id="active-sessions">
        <h3>Active Sessions:</h3>
        <pre id="sessions-data"></pre>
    </div>

    <script>
        const API_BASE = 'http://localhost:3002'
        
        // Generate device fingerprint
        function getDeviceFingerprint() {
            return `test-device-${Math.random().toString(36).substring(2, 8)}`
        }
        
        async function login() {
            const email = document.getElementById('email').value
            const password = document.getElementById('password').value
            
            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-Device-Fingerprint': getDeviceFingerprint()
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                })
                
                const data = await response.json()
                
                if (data.success) {
                    document.getElementById('login-form').style.display = 'none'
                    document.getElementById('session-info').style.display = 'block'
                    document.getElementById('session-data').textContent = JSON.stringify(data, null, 2)
                    await getActiveSessions()
                } else {
                    alert('Login failed: ' + data.error)
                }
            } catch (error) {
                alert('Network error: ' + error.message)
            }
        }
        
        async function getActiveSessions() {
            try {
                const response = await fetch(`${API_BASE}/api/auth/active-sessions`, {
                    credentials: 'include'
                })
                
                const sessions = await response.json()
                document.getElementById('sessions-data').textContent = JSON.stringify(sessions, null, 2)
            } catch (error) {
                console.error('Error fetching sessions:', error)
            }
        }
        
        async function logout() {
            try {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include'
                })
                
                document.getElementById('login-form').style.display = 'block'
                document.getElementById('session-info').style.display = 'none'
                document.getElementById('sessions-data').textContent = ''
            } catch (error) {
                console.error('Logout error:', error)
            }
        }
        
        // Check session on load
        window.onload = async function() {
            try {
                const response = await fetch(`${API_BASE}/api/auth/session`, {
                    credentials: 'include'
                })
                
                const data = await response.json()
                
                if (data.authenticated) {
                    document.getElementById('login-form').style.display = 'none'
                    document.getElementById('session-info').style.display = 'block'
                    document.getElementById('session-data').textContent = JSON.stringify(data, null, 2)
                    await getActiveSessions()
                }
            } catch (error) {
                console.error('Session check error:', error)
            }
        }
    </script>
</body>
</html>
```

Save as `test-auth.html` and open in multiple browser tabs/windows to test multi-device sessions.

## 5. Expected Test Results

### ✅ Single Device Login
- Login successful
- Session created in MongoDB
- User data returned correctly

### ✅ Multi-Device Login  
- Login from Device A → Session A created
- Login from Device B → Session B created
- Both sessions active simultaneously
- Each device sees both sessions in active sessions list

### ✅ Session Management
- View all active sessions
- Terminate other device sessions
- Current session protected from termination

### ✅ Session Persistence
- Restart server → Sessions persist (stored in MongoDB)
- Refresh browser → Session maintained
- Close/reopen browser → Session restored

## 6. Troubleshooting

### CORS Issues
If you get CORS errors, make sure your frontend URL is in the CORS configuration in server.js

### MongoDB Connection
Make sure your MongoDB connection string is correct in the .env file

### Session Issues
Check the MongoDB `sessions` collection to see stored sessions

## 7. Performance Test

```bash
# Test concurrent logins (requires Apache Bench)
ab -n 100 -c 10 -H "Content-Type: application/json" -p login-data.json http://localhost:3002/api/auth/login
```

Where `login-data.json` contains:
```json
{"email":"test@example.com","password":"password"}
```

This tests 100 concurrent login requests to ensure the server handles multiple simultaneous authentications.