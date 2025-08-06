# 🚀 Complete Setup Guide - NeuroTrauma 2026 Conference Platform

## 🏁 **Quick Start - Your Platform is Ready!**

### ✅ **Current Status:**
- ✅ Server running on `http://localhost:3001`
- ✅ Database connected (MongoDB Atlas)
- ✅ Payments working (Razorpay Test Mode)
- ✅ Authentication system functional
- ✅ Admin panel created
- ✅ Email system configured
- ✅ Invoice generation ready

---

## 🔐 **1. Admin Panel Access**

### **Step 1: Promote Your Account to Admin**
```powershell
# Replace with your email from .env.local (hello@violetvoyage.in)
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/promote" -Method POST -Body '{"email":"hello@violetvoyage.in","secret":"promote-admin-2026"}' -ContentType "application/json"
```

### **Step 2: Login as Admin**
1. Go to: `http://localhost:3001/auth/login`
2. Login with your email: `hello@violetvoyage.in`
3. Use the password you set during registration

### **Step 3: Access Admin Panel**
- Visit: `http://localhost:3001/admin`
- You now have full admin access!

---

## 📧 **2. Email System Setup & Testing**

### **Current Email Configuration:**
Your `.env.local` has SMTP configured with:
- **Host:** `smtpout.secureserver.net`
- **Port:** `465`
- **User:** `hello@violetvoyage.in`
- **Password:** `VioletVoyage@123`

### **Test Email System:**
```powershell
# Test basic email
Invoke-RestMethod -Uri "http://localhost:3001/api/test/email" -Method POST -Body '{"email":"hello@violetvoyage.in","type":"test"}' -ContentType "application/json"

# Test registration email
Invoke-RestMethod -Uri "http://localhost:3001/api/test/email" -Method POST -Body '{"email":"hello@violetvoyage.in","type":"registration"}' -ContentType "application/json"

# Test payment confirmation email
Invoke-RestMethod -Uri "http://localhost:3001/api/test/email" -Method POST -Body '{"email":"hello@violetvoyage.in","type":"payment"}' -ContentType "application/json"
```

### **Why Emails Might Not Work:**
1. **SMTP Settings**: Check if GoDaddy SMTP settings are correct
2. **Firewall**: Some ISPs block port 465
3. **App Password**: Might need specific app password instead of regular password
4. **Templates Disabled**: Check admin panel → Email Configuration

---

## 📄 **3. Invoice Generation & Download**

### **How Invoices Work:**
1. **Auto-Generation**: Invoices are created when payment is successful
2. **PDF Download**: Available from dashboard after payment
3. **Admin Access**: Admins can download any invoice

### **Download Invoice Steps:**
1. **Complete a Payment** (using test card: `4111 1111 1111 1111`)
2. **Go to Dashboard**: `http://localhost:3001/dashboard`
3. **Click "Download Invoice"** button in Payment History
4. **PDF Downloads**: Automatically downloads as PDF

### **Admin Invoice Access:**
1. **Login as Admin**: `http://localhost:3001/admin`
2. **View Payments**: See all payments in system
3. **Download Any Invoice**: Click download button for any payment

---

## 🏦 **4. Test Payment Flow**

### **Complete Test Registration:**
1. **Register**: `http://localhost:3001/register`
2. **Fill Details**: Use any test data
3. **Select Workshops**: Choose workshops (optional)
4. **Payment**: Choose "Pay Now"
5. **Test Card**: `4111 1111 1111 1111`
6. **CVV**: `123`
7. **Expiry**: `12/25`
8. **Complete**: Payment should succeed

### **After Payment:**
- ✅ Redirected to dashboard with success message
- ✅ Invoice available for download
- ✅ Payment visible in admin panel
- ✅ Email sent (if SMTP working)

---

## 🛠️ **5. Admin Panel Features**

### **What You Can Do as Admin:**

#### **Dashboard Overview:**
- Total registrations count
- Revenue analytics
- Recent activities
- Quick stats

#### **User Management:**
- View all registered users
- Export user data
- Manage user roles
- View registration details

#### **Payment Management:**
- View all payments
- Download invoices
- Export payment data
- Refund management

#### **Email Management:**
- Send bulk emails
- View email templates
- Configure SMTP settings
- Test email delivery

#### **Configuration:**
- Manage pricing
- Set up discounts
- Configure workshops
- Email template editing

---

## 🧪 **6. Testing Checklist**

### **✅ Basic Functionality:**
- [ ] Registration works
- [ ] Login/logout works
- [ ] Dashboard loads
- [ ] Payment calculation works
- [ ] Razorpay modal opens
- [ ] Test payment succeeds
- [ ] Invoice downloads

### **✅ Admin Functions:**
- [ ] Admin promotion works
- [ ] Admin panel accessible
- [ ] User management works
- [ ] Payment viewing works
- [ ] Bulk email works

### **✅ Email Testing:**
- [ ] SMTP connection works
- [ ] Test emails send
- [ ] Registration emails send
- [ ] Payment emails send

---

## 🔧 **7. Troubleshooting**

### **Common Issues:**

#### **Admin Panel 404:**
```powershell
# Restart server and try again
npm run dev
```

#### **Email Not Working:**
1. Check SMTP credentials in `.env.local`
2. Test with API: `http://localhost:3001/api/test/email`
3. Check firewall/ISP blocking ports
4. Try different SMTP settings

#### **Invoice Not Downloading:**
1. Complete a payment first
2. Check payment status in database
3. Ensure payment has `invoiceGenerated: true`

#### **Payment Failing:**
1. Check Razorpay keys in `.env.local`
2. Use test card: `4111 1111 1111 1111`
3. Ensure amount is greater than ₹1

---

## 🚀 **8. Next Steps (Production Ready)**

### **For Production Deployment:**
1. **Database**: Switch to production MongoDB cluster
2. **Razorpay**: Use live credentials (complete KYC)
3. **Domain**: Deploy to proper domain (not localhost)
4. **Email**: Configure production SMTP
5. **Security**: Remove admin promotion route
6. **SSL**: Enable HTTPS
7. **Backup**: Set up database backups

---

## 📞 **Quick Commands Reference**

```powershell
# Promote to Admin
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/promote" -Method POST -Body '{"email":"hello@violetvoyage.in","secret":"promote-admin-2026"}' -ContentType "application/json"

# Test Email
Invoke-RestMethod -Uri "http://localhost:3001/api/test/email" -Method POST -Body '{"email":"hello@violetvoyage.in","type":"test"}' -ContentType "application/json"

# Restart Server
npm run dev
```

**🎯 Your platform is fully functional! Test each feature and let me know what needs adjustment.**