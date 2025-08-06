# 🔐 Admin Panel Setup Guide

## Method 1: Promote Existing User (Recommended)

### Step 1: Register Normal User
1. Go to `http://localhost:3001/register`
2. Register with your email (remember it!)
3. Complete the registration

### Step 2: Promote to Admin
Use this curl command (replace `your-email@example.com` with your email):

```bash
curl -X POST http://localhost:3001/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hello@purplehatevents.in",
    "secret": "promote-admin-2026"
  }'
```

Or use Postman/Insomnia:
- URL: `POST http://localhost:3001/api/admin/promote`
- Body: 
```json
{
  "email": "your-email@example.com",
  "secret": "promote-admin-2026"
}
```

### Step 3: Access Admin Panel
1. Login with your credentials at `http://localhost:3001/auth/login`
2. Go to `http://localhost:3001/admin`
3. You should now have admin access!

## Method 2: Quick Test Admin
If you want a ready-made admin account, you can modify the register API to create an admin user directly.

## 📧 Email Configuration

### For Development (Optional):
Add to your `.env.local`:
```env
# Email Configuration (SMTP) - OPTIONAL for development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=NeuroTrauma Conference
SMTP_FROM_EMAIL=your-email@gmail.com
```

### Email Issues:
- Emails are **OPTIONAL** for development
- The app works without email configuration
- Email errors won't break the system
- For production, set up proper SMTP

## Security Notes:
- **DELETE** the promote route (`app/api/admin/promote/route.ts`) in production
- Change the secret key
- Use proper admin user creation in production

## Troubleshooting:
- If promote API fails, check if user exists first
- Make sure MongoDB is connected (via your .env.local)
- Check browser console for errors