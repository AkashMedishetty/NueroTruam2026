# NeuroTrauma 2026 Conference Platform - Requirements Document

## Introduction

The NeuroTrauma 2026 Conference Platform is a comprehensive web application for managing conference registrations, payments, and administration for the Annual Conference of the Neurotrauma Society of India. The platform will handle user registration with authentication, integrated payment processing via Razorpay, automated email communications, and provide a robust admin panel for conference management.

## Requirements

### Requirement 1: User Registration & Authentication System

**User Story:** As a conference attendee, I want to register for the conference with my email and password, so that I can access my registration details and make payments.

#### Acceptance Criteria

1. WHEN a user visits the registration page THEN the system SHALL display a multi-step registration form
2. WHEN a user provides email and password THEN the system SHALL create a user account with email as username
3. WHEN a user completes registration without payment THEN the system SHALL mark their status as "Registered - Payment Pending"
4. WHEN a user registers THEN the system SHALL send a confirmation email with registration details
5. WHEN a user logs in THEN the system SHALL authenticate using email/password credentials and display their dashboard
6. WHEN a logged-in user accesses dashboard THEN the system SHALL show their registration details, payment status, and conference information
7. IF a user forgets password THEN the system SHALL provide password reset functionality via email
8. WHEN registration is complete THEN the system SHALL generate a unique registration ID with a Pre Defined Prefix

### Requirement 2: Dynamic Payment System with Categories & Discounts

**User Story:** As a registered user, I want to pay for my conference registration with appropriate category pricing and available discounts, so that I can complete my registration at the correct rate.

#### Acceptance Criteria

1. WHEN a user chooses to pay THEN the system SHALL display available registration categories (Regular, Student, International, Faculty, etc.)
2. WHEN payment is initiated THEN the system SHALL calculate total amount including selected workshops and applicable discounts
3. WHEN Independence Day discount is active THEN the system SHALL automatically apply discount based on current date and user eligibility
4. WHEN admin creates discount codes THEN the system SHALL allow users to apply promotional codes during payment
5. WHEN payment is successful THEN the system SHALL update user status to "Registered - Paid" with category details
6. WHEN payment fails THEN the system SHALL maintain "Payment Pending" status and allow retry with same pricing
7. WHEN payment is completed THEN the system SHALL send an invoice email with detailed breakdown of charges and discounts
8. WHEN payment is processed THEN the system SHALL store transaction details with category, discounts, and workshop selections
9. IF payment is partial or failed THEN the system SHALL log the attempt and notify administrators

### Requirement 3: Email Communication System

**User Story:** As a user, I want to receive automated emails for registration confirmation and payment receipts, so that I have proper documentation of my conference participation.

#### Acceptance Criteria

1. WHEN a user registers THEN the system SHALL send a welcome email with registration details
2. WHEN payment is completed THEN the system SHALL send an invoice email with payment receipt
3. WHEN user requests password reset THEN the system SHALL send a secure reset link via email
4. WHEN admin sends bulk emails THEN the system SHALL deliver emails to filtered user groups
5. IF email delivery fails THEN the system SHALL log the failure and retry automatically
6. WHEN emails are sent THEN the system SHALL use professional templates with conference branding
7. WHEN invoice is generated THEN the system SHALL include all payment and registration details

### Requirement 4: Comprehensive Admin Panel with Dynamic Configuration

**User Story:** As a conference administrator, I want a comprehensive admin panel to manage all registrations, payments, communications, and website content, so that I can efficiently oversee the entire conference and dynamically update website information.

#### Acceptance Criteria

1. WHEN admin logs in THEN the system SHALL display a dashboard with key metrics and statistics
2. WHEN admin configures pricing THEN the system SHALL allow setting registration categories, workshop fees, and discount rates that reflect on the website
3. WHEN admin updates conference details THEN the system SHALL allow editing dates, venue, speakers, and schedule that automatically update the public website
4. WHEN admin manages discounts THEN the system SHALL provide interface to create/modify time-based and code-based discounts
5. WHEN admin views registrations THEN the system SHALL show all user registrations with status, payment info, and accompanying person details
6. WHEN admin needs to filter data THEN the system SHALL provide advanced filtering by status, payment, date, category, etc.
7. WHEN admin wants to export data THEN the system SHALL generate CSV/Excel exports of registration and payment data
8. WHEN admin sends emails THEN the system SHALL provide bulk email functionality with user filtering
9. WHEN admin views payments THEN the system SHALL display all transactions with Razorpay integration details
10. WHEN admin needs reports THEN the system SHALL generate comprehensive reports on registrations, payments, and attendance
11. IF admin needs to modify registration THEN the system SHALL allow editing user details and payment status
12. WHEN admin manages content THEN the system SHALL provide CMS-like interface to update website content, speakers, schedule, and announcements

### Requirement 5: Performance Optimization & Bug Fixes

**User Story:** As any user of the platform, I want fast loading times and smooth performance across all devices, so that I can efficiently use the platform without technical issues.

#### Acceptance Criteria

1. WHEN 3D models load THEN the system SHALL implement lazy loading with proper loading states
2. WHEN users access on mobile THEN the system SHALL provide optimized mobile experience
3. WHEN page loads THEN the system SHALL eliminate duplicate code and optimize bundle size
4. WHEN errors occur THEN the system SHALL implement proper error boundaries and handling
5. WHEN animations run THEN the system SHALL respect user's reduced-motion preferences
6. WHEN production build runs THEN the system SHALL enable proper TypeScript and ESLint checking
7. WHEN memory usage increases THEN the system SHALL properly cleanup resources and prevent leaks

### Requirement 6: Data Management & Security

**User Story:** As a platform stakeholder, I want secure data handling and proper backup systems, so that user data and payment information are protected and recoverable.

#### Acceptance Criteria

1. WHEN user data is stored THEN the system SHALL encrypt sensitive information
2. WHEN payments are processed THEN the system SHALL comply with PCI DSS standards
3. WHEN data is accessed THEN the system SHALL implement proper authentication and authorization
4. WHEN backups are needed THEN the system SHALL provide automated database backups
5. WHEN audit trails are required THEN the system SHALL log all critical operations
6. IF security breach occurs THEN the system SHALL have incident response procedures
7. WHEN GDPR compliance is needed THEN the system SHALL provide data export and deletion capabilities

### Requirement 7: Hosting & Infrastructure

**User Story:** As a system administrator, I want reliable hosting with scalability options, so that the platform can handle conference traffic and remain available during peak registration periods.

#### Acceptance Criteria

1. WHEN traffic increases THEN the system SHALL scale automatically to handle load
2. WHEN deployment is needed THEN the system SHALL support CI/CD pipelines
3. WHEN monitoring is required THEN the system SHALL provide comprehensive logging and metrics
4. WHEN backups are needed THEN the system SHALL implement automated backup strategies
5. IF downtime occurs THEN the system SHALL have disaster recovery procedures
6. WHEN SSL is required THEN the system SHALL implement proper HTTPS encryption
7. WHEN CDN is needed THEN the system SHALL optimize static asset delivery

## Technical Considerations

### Database Options
- **PostgreSQL** (Recommended for complex queries and ACID compliance)
- **MySQL** (Alternative relational database)
- **MongoDB** (If document-based storage is preferred)

### Hosting Options
- **Vercel** (Recommended for Next.js, easy deployment)
- **AWS** (Full control, scalable, multiple services)
- **Google Cloud Platform** (Good integration options)
- **DigitalOcean** (Cost-effective, simple setup)
- **Railway** (Developer-friendly, good for startups)

### Email Service Options
- **Resend** (Modern, developer-friendly)
- **SendGrid** (Enterprise-grade, reliable)
- **AWS SES** (Cost-effective, integrates with AWS)
- **Mailgun** (Good deliverability, API-focused)

### Payment Gateway
- **Razorpay** (As specified, Indian market leader)

### Additional Services Needed
- **Redis** (For session management and caching)
- **File Storage** (AWS S3, Cloudinary for images/documents)
- **Monitoring** (Sentry for error tracking, Analytics)
##
# Requirement 8: Future Abstract Submission System

**User Story:** As a conference participant, I want to submit abstracts for presentation consideration, so that I can contribute to the conference program.

#### Acceptance Criteria

1. WHEN abstract submission opens THEN the system SHALL provide abstract submission form for registered users
2. WHEN user submits abstract THEN the system SHALL store submission with user association and generate submission ID
3. WHEN abstract is submitted THEN the system SHALL send confirmation email to user
4. WHEN admin reviews abstracts THEN the system SHALL provide review interface with status management
5. WHEN abstract status changes THEN the system SHALL notify user via email
6. WHEN abstracts are accepted THEN the system SHALL allow users to upload presentation files
7. WHEN submission deadline approaches THEN the system SHALL send reminder emails to registered users

## Updated Technical Stack

### Database (Selected)
- **MongoDB Atlas** (Document-based, flexible schema, easy scaling, free tier available)

### Hosting (Selected)
- **VPS (Hostinger or similar)** (Cost-effective, full control, suitable for Node.js applications)
- **Setup Requirements:** Node.js, PM2, Nginx reverse proxy, SSL certificate

### Email Service Options
- **Resend** (Modern, developer-friendly, good deliverability)
- **SendGrid** (Enterprise-grade, reliable)
- **Nodemailer with Gmail SMTP** (Simple setup for smaller volumes)

### Payment Gateway
- **Razorpay** (Indian market leader, excellent documentation)

### Optional Services (Phase 2)
- **Redis** (Session management and caching - can be added later)
- **File Storage** (Local storage initially, can migrate to cloud later)
- **Monitoring** (Basic logging initially, Sentry for production)

### Discount Management System
- **Time-based Discounts** (Independence Day, Early Bird)
- **Code-based Discounts** (Promotional codes)
- **Category-based Pricing** (Student, Regular, International, Faculty)
- **Workshop Add-ons** (Additional pricing for workshops)

## Payment Categories Structure

### Registration Types
1. **Regular Delegate** - ₹15,000
2. **Student/Resident** - ₹8,000  
3. **International Delegate** - $300
4. **Faculty Member** - ₹12,000

### Workshop Add-ons
1. **Advanced Joint Replacement** - ₹2,000
2. **Arthroscopic Surgery Masterclass** - ₹2,500
3. **Spine Surgery Innovations** - ₹2,000
4. **Trauma Management** - ₹1,500

### Discount Types
1. **Independence Day Special** - 15% off (Aug 15 period)
2. **Early Bird** - 10% off (before specific date)
3. **Group Registration** - 5% off (5+ registrations)
4. **Promotional Codes** - Variable percentage
5. **Sfication** - Additional discount for verified students
###
 Requirement 9: Accompanying Person Registration

**User Story:** As a conference attendee, I want to register accompanying persons (spouse, family) for conference events, so that they can participate in social activities and meals.

#### Acceptance Criteria

1. WHEN a user registers THEN the system SHALL provide option to add accompanying persons
2. WHEN accompanying person is added THEN the system SHALL collect their basic details (name, age, dietary requirements)
3. WHEN accompanying person registration is complete THEN the system SHALL add accompanying person fees to total payment
4. WHEN payment is processed THEN the system SHALL include accompanying person details in invoice
5. WHEN admin views registrations THEN the system SHALL display accompanying person information
6. WHEN badges are generated THEN the system SHALL create separate badges for accompanying persons
7. WHEN meal planning occurs THEN the system SHALL include accompanying persons in headcount

### Requirement 10: Advanced Abstract Submission & Review System (Future Phase)

**User Story:** As a conference participant, I want to submit abstracts in specific categories for peer review, so that my research can be considered for presentation at the conference.

#### Acceptance Criteria

1. WHEN admin sets up conference THEN the system SHALL allow creation of abstract categories (e.g., Neurotrauma, Spine Surgery, Pediatric Neurosurgery, etc.)
2. WHEN user submits abstract THEN the system SHALL require selection of submission category
3. WHEN abstract is submitted THEN the system SHALL store submission with category association and generate unique submission ID
4. WHEN admin assigns reviewers THEN the system SHALL allow assignment of reviewers to specific categories
5. WHEN reviewer logs in THEN the system SHALL display abstracts assigned to their categories for review
6. WHEN reviewer submits review THEN the system SHALL store review scores and comments
7. WHEN multiple reviews are complete THEN the system SHALL calculate average scores and provide recommendation
8. WHEN abstract status changes THEN the system SHALL notify author via email with reviewer feedback
9. WHEN abstracts are accepted THEN the system SHALL categorize them for conference program scheduling

### Requirement 11: Reviewer Portal System (Future Phase)

**User Story:** As an expert reviewer, I want a dedicated portal to review abstracts in my area of expertise, so that I can contribute to maintaining conference quality standards.

#### Acceptance Criteria

1. WHEN admin invites reviewers THEN the system SHALL send invitation emails with portal access credentials
2. WHEN reviewer registers THEN the system SHALL collect their expertise areas and category preferences
3. WHEN reviewer logs in THEN the system SHALL display dashboard with assigned abstracts and review deadlines
4. WHEN reviewer opens abstract THEN the system SHALL display abstract details with structured review form
5. WHEN reviewer submits review THEN the system SHALL require scores for multiple criteria (originality, methodology, relevance, etc.)
6. WHEN review is submitted THEN the system SHALL send confirmation and update abstract status
7. WHEN review deadline approaches THEN the system SHALL send reminder emails to pending reviewers
8. WHEN all reviews are complete THEN the system SHALL notify admin with consolidated review results

## Updated Payment Structure

### Registration Types (Updated)
1. **Regular Delegate** - ₹15,000
2. **Student/Resident** - ₹8,000  
3. **International Delegate** - $300
4. **Faculty Member** - ₹12,000
5. **Accompanying Person** - ₹3,000 (includes meals and social events)

### File Storage Strategy
- **Local Storage** (VPS-based file system)
- **User Profile Pictures** - Stored locally with size limits
- **Invoice PDFs** - Generated and stored locally
- **Abstract Documents** - PDF uploads stored locally (future feature)
- **Conference Materials** - Downloadable resources stored locally
- **Backup Strategy** - Regular automated backups to external storage