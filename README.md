# NeuroTrauma 2026 Conference Platform

A comprehensive conference management platform built with Next.js 14, featuring user registration, payment processing, admin management, and email communications.

## 🚀 Features

### ✅ **Completed Phase 1 Features**

- **🔐 Complete Authentication System**
  - User registration with multi-step process
  - Secure login with NextAuth.js
  - Password reset functionality
  - Role-based access control (User/Admin)

- **💳 Integrated Payment System**
  - Razorpay payment gateway integration
  - Dynamic pricing with category-based fees
  - Workshop add-ons and accompanying person fees
  - Automated discount system (time-based & code-based)
  - Invoice generation and email delivery

- **👥 User Dashboard**
  - Registration status and details
  - Payment history and invoices
  - Profile management
  - Accompanying person registration

- **🏛️ Comprehensive Admin Panel**
  - Real-time dashboard with statistics
  - User registration management
  - Payment transaction tracking
  - System configuration management
  - Bulk email functionality with filtering
  - CSV/Excel data export

- **📧 Email Communication System**
  - Professional branded email templates
  - Automated registration confirmations
  - Payment receipts and invoices
  - Password reset emails
  - Bulk communication tools

- **🔒 Security & Performance**
  - Global error boundaries
  - Input validation and sanitization
  - Rate limiting and CSRF protection
  - Production-optimized configuration
  - Comprehensive test coverage

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Payment**: Razorpay Integration
- **Email**: Nodemailer with SMTP
- **UI Components**: Shadcn/ui, Framer Motion
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, PM2, Nginx

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- SMTP email account (Gmail recommended)
- Razorpay account for payments

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd neurotrauma-2026
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/neurotrauma2026

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Payment (Razorpay)
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com  
SMTP_PASS=your-app-password

# App
APP_NAME="NeuroTrauma 2026"
APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Start MongoDB (if local)
mongod

# Seed initial data (optional)
npm run seed
```

### 4. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:ci

# Type checking
npm run type-check
```

## 🚀 Production Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t neurotrauma-2026 .
docker run -p 3000:3000 neurotrauma-2026
```

### VPS Deployment

```bash
# Make scripts executable
chmod +x scripts/deploy.sh scripts/backup.sh

# Deploy to production
./scripts/deploy.sh production

# Create backup
./scripts/backup.sh full
```

### Environment Files

- `.env.production` - Production environment
- `.env.staging` - Staging environment
- `.env.example` - Template with all variables

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # User dashboard pages  
│   ├── admin/             # Admin panel pages
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # User dashboard components
│   ├── admin/             # Admin panel components
│   ├── payment/           # Payment components
│   ├── error/             # Error handling components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── mongodb/           # Database connection
│   ├── models/            # Mongoose schemas
│   ├── email/             # Email service
│   ├── validation/        # Input validation
│   ├── middleware/        # Security middleware
│   └── utils/             # Helper functions
├── __tests__/             # Test files
├── scripts/               # Deployment scripts
└── public/                # Static assets
```

## 🔧 Configuration

### Payment Categories

- **Regular Delegate**: ₹15,000
- **Student/Resident**: ₹8,000  
- **International**: $300
- **Faculty**: ₹12,000
- **Accompanying Person**: ₹3,000

### Workshop Add-ons

- Advanced Joint Replacement: ₹2,000
- Arthroscopic Surgery: ₹2,500
- Spine Surgery Innovations: ₹2,000
- Trauma Management: ₹1,500

### Discount System

- **Independence Day Special**: 15% off (Aug 10-20)
- **Early Bird**: 10% off (before July 31)
- **Custom Codes**: Admin-configurable

## 📧 Email Configuration

### Gmail SMTP Setup

1. Enable 2-Factor Authentication
2. Generate App Password in Google Account
3. Use app password in `SMTP_PASS`

### Email Templates

All emails use professional conference branding:
- Registration confirmation
- Payment receipts with invoice details
- Password reset links
- Admin bulk communications

## 🔒 Security Features

- **Input Validation**: Comprehensive Zod schemas
- **Rate Limiting**: IP-based request limits
- **CSRF Protection**: Token-based protection
- **XSS Prevention**: Input sanitization
- **Error Boundaries**: Graceful error handling
- **Security Headers**: Production-ready headers

## 📊 Admin Features

### Dashboard Statistics
- Total registrations and revenue
- Payment status breakdown
- Workshop popularity
- Recent activity

### User Management  
- Registration filtering and search
- Bulk email with recipient targeting
- Registration status management
- Data export (CSV/Excel)

### System Configuration
- Dynamic pricing management
- Discount code creation
- Email template configuration
- Workshop management

## 🚀 Performance Optimizations

- **Server-Side Rendering**: Optimized public pages
- **Image Optimization**: Next.js Image component
- **Bundle Splitting**: Optimized JavaScript chunks
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: API response caching
- **Compression**: Gzip compression enabled

## 🐛 Error Handling

- **Global Error Boundary**: React error catching
- **API Error Standards**: Consistent error responses  
- **Logging**: Comprehensive error logging
- **User Feedback**: Friendly error messages
- **Rollback**: Automatic deployment rollback

## 📱 Mobile Responsiveness

Fully responsive design tested on:
- Mobile phones (320px+)
- Tablets (768px+) 
- Desktops (1024px+)
- Large screens (1440px+)

## 🔄 Backup Strategy

### Automated Backups
- **Database**: MongoDB dumps with compression
- **Files**: Application and upload files  
- **SSL**: Certificate backups
- **Logs**: Log file archival
- **Retention**: 30-day backup retention

### Manual Backup
```bash
# Full backup
./scripts/backup.sh full

# Database only
./scripts/backup.sh database

# Files only  
./scripts/backup.sh files
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Razorpay** - Payment gateway
- **MongoDB** - Database platform  
- **Vercel** - Hosting platform
- **Shadcn** - UI components

## 📞 Support

For support and questions:
- **Email**: support@neurotrauma2026.com
- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

---

**NeuroTrauma 2026 Conference Platform** - Built with ❤️ for the medical community