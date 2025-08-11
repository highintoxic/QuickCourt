# QuickCourt API - Comprehensive Sports Facility Booking System

## Overview
Successfully upgraded from a basic authentication system to a comprehensive sports facility booking platform with:

### 🏗️ Architecture Enhancements
- **Modular Controller Structure**: BaseController pattern with response helpers
- **Input Validation**: Zod schemas for all endpoints with detailed error responses
- **Role-Based Access Control**: JWT-based RBAC with USER, ADMIN, FACILITY_OWNER roles
- **Comprehensive Database Schema**: Complete sports booking system with facilities, courts, bookings, payments, and reviews

### 📊 Database Schema
The system now supports:
- **User Management**: Extended user model with full profile support
- **Facility Management**: Sports facilities with owner relationships
- **Court Management**: Multiple courts per facility with different sports types
- **Booking System**: Time-based booking with conflict detection
- **Payment Processing**: Payment tracking for bookings
- **Review System**: User reviews and ratings for facilities
- **Audit Logging**: System activity tracking

### 🛡️ Security Features
- JWT access/refresh token system
- Role-based permissions for different user types
- Input validation on all endpoints
- Proper error handling and response formatting

### 📋 API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration with role selection
- `POST /login` - User authentication
- `POST /refresh` - Token refresh
- `POST /logout` - Single device logout
- `POST /logout-all` - All devices logout
- `POST /request-otp` - OTP request (email/SMS/WhatsApp)
- `POST /verify-otp` - OTP verification

#### Admin Management (`/api/admin`)
- `GET /users` - List all users (paginated)
- `GET /users/:id` - Get user details
- `PATCH /users/:id/role` - Update user role
- `DELETE /users/:id` - Delete user
- `GET /stats` - System statistics

#### Facility Management (`/api/facilities`)
- `POST /` - Create facility (FACILITY_OWNER, ADMIN)
- `GET /` - List facilities (with search/filter)
- `GET /:id` - Get facility details
- `PUT /:id` - Update facility (owner/admin only)
- `DELETE /:id` - Delete facility (owner/admin only)
- `GET /:id/courts` - Get facility courts
- `POST /:id/courts` - Create court in facility

#### Booking System (`/api/bookings`)
- `POST /` - Create booking
- `GET /my-bookings` - Get user's bookings
- `GET /availability` - Check court availability
- `GET /:id` - Get booking details
- `PATCH /:id/status` - Update booking status (facility owners/admins)
- `PATCH /:id/cancel` - Cancel booking (booking owner)
- `GET /facility/:id` - Get facility bookings (facility owners/admins)

### 🚀 Features Implemented
1. **Multi-Sport Support**: Tennis, Badminton, Squash, Table Tennis, Basketball, Volleyball, Football, and more
2. **Advanced Booking Logic**: Time conflict detection, availability checking
3. **Dynamic Pricing**: Per-hour pricing with automatic calculation
4. **Permission System**: Granular permissions based on user roles and ownership
5. **Comprehensive Validation**: Input validation with detailed error messages
6. **Pagination Support**: Efficient data loading for large datasets
7. **Search & Filtering**: Advanced facility search with multiple criteria

### 🔧 Technical Stack
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod for type-safe input validation
- **Architecture**: Controller-based with RBAC middleware

### 📊 Database Models
- **User**: Extended with roles, full name, avatar, verification status
- **Facility**: Sports facilities with complete profile and ratings
- **Court**: Individual courts within facilities
- **Booking**: Time-based bookings with status tracking
- **Payment**: Payment processing and tracking
- **Review**: User reviews and ratings system
- **AuditLog**: System activity tracking
- **RefreshToken & OTP**: Authentication support models

### ✅ Status
- ✅ Database schema migrated successfully
- ✅ Prisma client generated
- ✅ Server running on port 4000
- ✅ All routes registered and accessible
- ✅ Authentication and authorization working
- ✅ Input validation implemented
- ✅ Error handling configured

### 🔄 Next Steps
1. Create PaymentController for payment processing
2. Create ReviewController for facility reviews
3. Add real-time notifications for booking updates
4. Implement email/SMS notifications
5. Add file upload for facility images
6. Create admin dashboard endpoints
7. Add analytics and reporting features
