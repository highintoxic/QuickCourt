# Validation & Error Handling Documentation

This project uses **Zod** for request validation and comprehensive error handling. All API endpoints now have proper validation and return consistent error responses.

## ✅ **What's Implemented**

### **1. Request Validation**
- **Body validation** using Zod schemas
- **Query parameter validation** 
- **URL parameter validation**
- **Type-safe validation** with TypeScript inference

### **2. Error Responses**
- **Consistent error format** across all endpoints
- **Detailed validation errors** with field-specific messages
- **HTTP status codes** that match the error type
- **Development vs production** error details

### **3. Enhanced Controllers**
- **BaseController** with helper methods for responses
- **Type-safe request handling** 
- **Proper error handling** in all auth routes

## 📝 **Error Response Format**

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### **Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password", 
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### **General Error:**
```json
{
  "success": false,
  "message": "User not found"
}
```

## 🛠️ **Available Validation Schemas**

### **Auth Schemas:**
- `registerSchema` - Email, strong password, optional phone
- `loginSchema` - Email and password
- `refreshTokenSchema` - Refresh token validation
- `requestOTPSchema` - OTP request with channel validation
- `verifyOTPSchema` - OTP verification

### **Common Schemas:**
- `idParamSchema` - UUID validation for URL parameters
- `paginationQuerySchema` - Page, limit, sort validation

## 🚀 **Using Validation in Routes**

```typescript
// routes/exampleRoutes.ts
import { validateRequest, validateParams, validateQuery } from "../middleware/validation.js";
import { registerSchema, idParamSchema, paginationQuerySchema } from "../utils/validation.js";

router.post("/register", 
  validateRequest(registerSchema), 
  controller.register.bind(controller)
);

router.get("/:id", 
  validateParams(idParamSchema),
  controller.getById.bind(controller)
);

router.get("/", 
  validateQuery(paginationQuerySchema),
  controller.getAll.bind(controller)
);
```

## 🎯 **Controller Best Practices**

```typescript
// controllers/ExampleController.ts
import { BaseController } from "./BaseController.js";
import type { RegisterInput } from "../utils/validation.js";

export class ExampleController extends BaseController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterInput; // Type-safe!
      
      // Check if exists
      if (await this.checkExists(data.email)) {
        return this.error(res, "Already exists", 409);
      }
      
      const result = await this.createUser(data);
      return this.success(res, result, "Created successfully", 201);
    } catch (error) {
      next(error); // Let error handler deal with it
    }
  }
}
```

## 📋 **BaseController Helper Methods**

- `success(res, data, message, statusCode)` - Send success response
- `error(res, message, statusCode, errors)` - Send error response  
- `validationError(res, errors)` - Send validation error (400)
- `notFound(res, resource)` - Send not found error (404)
- `unauthorized(res, message)` - Send unauthorized error (401)
- `forbidden(res, message)` - Send forbidden error (403)

## 🔧 **Adding New Validations**

### **1. Create Schema:**
```typescript
// utils/validation.ts
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### **2. Use in Route:**
```typescript
// routes/userRoutes.ts
router.post("/", validateRequest(createUserSchema), controller.create.bind(controller));
```

### **3. Use in Controller:**
```typescript
// controllers/UserController.ts
async create(req: Request, res: Response, next: NextFunction) {
  try {
    const userData = req.body as CreateUserInput; // Fully typed!
    // Your logic here
  } catch (error) {
    next(error);
  }
}
```

## ⚡ **Current Auth Endpoints with Validation**

All auth endpoints now have proper validation:

- `POST /api/auth/register` - Email, strong password validation
- `POST /api/auth/login` - Email, password validation  
- `POST /api/auth/token/refresh` - Refresh token validation
- `POST /api/auth/logout` - Refresh token ID validation
- `POST /api/auth/logout/all` - User ID validation
- `POST /api/auth/otp/request` - Email, channel, phone validation
- `POST /api/auth/otp/verify` - Email, code, channel validation

## 🎉 **Benefits**

✅ **Type Safety** - Full TypeScript support  
✅ **Consistent APIs** - Same response format everywhere  
✅ **Better UX** - Clear, helpful error messages  
✅ **Developer Friendly** - Easy to add new validations  
✅ **Production Ready** - Handles all edge cases  
✅ **Maintainable** - Centralized validation logic

Your API is now bulletproof! 🛡️
