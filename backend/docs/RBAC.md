# Role-Based Access Control (RBAC) Documentation

This project implements a comprehensive Role-Based Access Control (RBAC) system with three distinct user roles: **USER**, **ADMIN**, and **FACILITY_OWNER**.

## 🎯 **User Roles**

### **USER** (Default Role)
- Basic authenticated access
- Can browse facilities
- Limited to own resources

### **FACILITY_OWNER**
- Can create and manage facilities
- Can manage their own facilities only
- Has all USER permissions

### **ADMIN**
- Full system access
- Can manage all users and roles
- Can view system statistics
- Can manage all facilities
- Override permissions for all resources

## 🛡️ **Authentication & Authorization**

### **JWT Token Structure**
```json
{
  "userId": "user_id_here",
  "email": "user@example.com", 
  "role": "USER|ADMIN|FACILITY_OWNER",
  "isVerified": true,
  "jti": "token_id",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### **Middleware Chain**
1. `authenticate` - Verifies JWT token and adds user to request
2. `authorize(roles...)` - Checks if user has required role
3. `requireVerified` - Ensures user account is verified
4. `requireOwnershipOrAdmin` - Checks resource ownership or admin access

## 🚀 **API Endpoints by Role**

### **Public Endpoints (No Authentication)**
```
GET  /api/health                    # Health check
POST /api/auth/register            # User registration  
POST /api/auth/login               # User login
GET  /api/facilities               # Browse facilities (public)
GET  /api/facilities/:id           # View facility details (public)
```

### **USER Endpoints** (Requires: Authentication)
```
POST /api/auth/token/refresh       # Refresh access token
POST /api/auth/logout              # Logout current session
POST /api/auth/logout/all          # Logout all sessions
POST /api/auth/otp/request         # Request OTP
POST /api/auth/otp/verify          # Verify OTP
```

### **FACILITY_OWNER Endpoints** (Requires: Authentication + FACILITY_OWNER or ADMIN role)
```
POST /api/facilities               # Create new facility
GET  /api/facilities/my/facilities # Get own facilities
PATCH /api/facilities/:id          # Update own facility
DELETE /api/facilities/:id         # Delete own facility
```

### **ADMIN Endpoints** (Requires: Authentication + ADMIN role)
```
GET    /api/admin/users            # Get all users (with pagination)
PATCH  /api/admin/users/:id/role   # Update user role
DELETE /api/admin/users/:id        # Delete user  
GET    /api/admin/stats            # Get system statistics

# Admins can also access all FACILITY_OWNER endpoints for any facility
```

## 💾 **Database Schema**

### **User Model**
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  phone         String?        @unique
  passwordHash  String
  isVerified    Boolean        @default(false)
  role          UserRole       @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  facilities    Facility[]     # For facility owners
  otps          OTP[]
  refreshTokens RefreshToken[]
}

enum UserRole {
  USER
  ADMIN
  FACILITY_OWNER
}
```

### **Facility Model**
```prisma
model Facility {
  id          String   @id @default(cuid())
  name        String
  description String?
  address     String
  phone       String?
  email       String?
  isActive    Boolean  @default(true)
  owner       User     @relation(fields: [ownerId], references: [id])
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔐 **Usage Examples**

### **Using Middleware in Routes**
```typescript
import { authenticate, requireAdmin, requireFacilityOwner } from "../middleware/rbac.js";

// Admin only route
router.get("/admin/users", authenticate, requireAdmin, controller.getAllUsers);

// Facility owner or admin route  
router.post("/facilities", authenticate, requireFacilityOwner, controller.createFacility);

// Any authenticated user
router.get("/profile", authenticate, controller.getProfile);
```

### **Checking Permissions in Controllers**
```typescript
// Check if user is admin or owns resource
export class FacilityController extends BaseController {
  async updateFacility(req: Request, res: Response, next: NextFunction) {
    const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
    
    const isAdmin = req.user!.role === "ADMIN";
    const isOwner = facility.ownerId === req.user!.id;
    
    if (!isAdmin && !isOwner) {
      return this.forbidden(res, "You can only update your own facilities");
    }
    
    // Proceed with update...
  }
}
```

### **Creating Users with Roles**
```typescript
// Register as facility owner
POST /api/auth/register
{
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "FACILITY_OWNER"
}

// Admin promotes user to facility owner
PATCH /api/admin/users/user_id/role
{
  "role": "FACILITY_OWNER"
}
```

## 🎛️ **Admin Management**

### **Create Admin User**
1. Register normally as USER
2. Manually update in database OR
3. Have existing admin promote via API

### **System Statistics Available to Admins**
```json
{
  "users": {
    "total": 150,
    "admins": 2, 
    "facilityOwners": 12,
    "verified": 140,
    "unverified": 10
  },
  "facilities": {
    "total": 45,
    "active": 42,
    "inactive": 3
  }
}
```

## 🛠️ **Security Features**

- ✅ **JWT-based authentication** with separate access/refresh tokens
- ✅ **Role-based permissions** enforced at middleware level
- ✅ **Resource ownership validation** in controllers
- ✅ **Account verification** requirement for sensitive operations
- ✅ **Token refresh** and revocation capabilities
- ✅ **Admin audit capabilities** with user management
- ✅ **Input validation** using Zod schemas
- ✅ **Password strength** requirements
- ✅ **Rate limiting** ready (can be added with express-rate-limit)

## 🚦 **HTTP Status Codes**

- `200` - Success
- `201` - Created (registration, facility creation)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user/facility not found)
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

Your RBAC system is now fully implemented and ready for use! 🎉
