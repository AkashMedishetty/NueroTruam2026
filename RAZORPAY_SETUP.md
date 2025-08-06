# 🚀 Razorpay Setup Guide for NeuroTrauma Conference

## 🧪 Development Setup (Works with localhost)

### Step 1: Create Razorpay Account
1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Sign up for FREE account
3. Verify email

### Step 2: Get Test Credentials
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Copy **TEST** credentials (NOT live ones)
4. Add to `.env.local`:

```env
# Razorpay TEST Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

### Step 3: Configure Webhooks (Optional for basic testing)
1. Settings → Webhooks
2. Add webhook URL: `http://localhost:3001/api/payment/verify`
3. Select events: `payment.authorized`, `payment.failed`

### Step 4: Test Payment
Use these test cards (NO REAL MONEY):
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

## 🌐 Production Setup (When ready to deploy)

### Step 1: Get Production Domain
- Deploy to Vercel/Netlify/Railway/DigitalOcean
- Get HTTPS URL (required for live payments)

### Step 2: Update Razorpay Settings
1. Complete KYC verification in Razorpay
2. Add production domain to authorized domains
3. Update webhook URL to production URL
4. Switch to LIVE credentials

### Step 3: Environment Variables
```env
# Production Environment
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
NEXTAUTH_URL=https://your-domain.com
```

## 🔒 Security Notes
- Never commit `.env.local` to Git
- Test thoroughly before going live
- Monitor transactions in Razorpay dashboard

## 📞 Support
- Razorpay Docs: https://razorpay.com/docs/
- Test in development first
- Contact Razorpay support for production issues