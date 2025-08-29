# NVOCC Platform Server

A comprehensive authentication system for NVOCC (Non-Vessel Operating Common Carrier) platform with multi-role support, role switching, and dynamic menu management.

## Features

### Authentication System

- ✅ **User Login** via email and password
- ✅ **JWT-based Authentication** with access and refresh tokens
- ✅ **Password Security** with bcrypt hashing and strength validation
- ✅ **Rate Limiting** to prevent brute force attacks
- ✅ **Session Management** with automatic cleanup

### Multi-Role Support

- ✅ **7 Supported Roles:**
  - `ADMIN` - Full system access
  - `CUSTOMER` - Customer portal access
  - `PORT` - Port operations
  - `DEPOT` - Depot and container management
  - `SALES` - Sales activities and customer management
  - `MASTER_PORT` - Elevated port operations
  - `HR` - Human resources management

### Advanced Features

- ✅ **Multi-role Access** - Users can have multiple roles simultaneously
- ✅ **Role Switching** - Switch between roles without logout
- ✅ **Dynamic Menus** - Context-aware menu display based on active role
- ✅ **Permission-based Authorization** - Granular permission control
- ✅ **Activity Logging** - Track user actions and system events
- ✅ **Database Audit Trail** - Complete audit trail for security

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt, express-rate-limit, express-validator
- **API:** RESTful API with comprehensive error handling

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and install dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   # Copy and edit the .env file
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/nvocc_platform?schema=public"

   # JWT Secrets (generate strong secrets for production)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"

   # Server
   PORT=5000
   NODE_ENV=development
   WEBSITE_URL=http://localhost:3000
   ```

3. **Set up the database:**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed the database with initial data
   npm run db:seed
   ```

4. **Start the server:**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Or production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## Database Schema

### Core Tables

- **Users** - User accounts and profiles
- **Roles** - System roles with permissions
- **UserRoles** - Many-to-many relationship between users and roles
- **UserSessions** - Active user sessions with role context
- **RefreshTokens** - JWT refresh token management
- **Menus** - Hierarchical menu structure
- **RoleMenus** - Role-based menu permissions
- **ActivityLogs** - System audit trail

## API Endpoints

### Authentication Endpoints

| Method | Endpoint                  | Description          | Rate Limit |
| ------ | ------------------------- | -------------------- | ---------- |
| `POST` | `/api/auth/register`      | Register new user    | 3/hour     |
| `POST` | `/api/auth/login`         | User login           | 5/15min    |
| `POST` | `/api/auth/logout`        | User logout          | -          |
| `POST` | `/api/auth/refresh-token` | Refresh access token | -          |
| `POST` | `/api/auth/switch-role`   | Switch active role   | 10/5min    |
| `GET`  | `/api/auth/profile`       | Get user profile     | -          |
| `GET`  | `/api/auth/roles`         | Get available roles  | -          |
| `GET`  | `/api/auth/menus`         | Get role-based menus | -          |
| `GET`  | `/api/auth/check`         | Check auth status    | -          |

### Sample API Usage

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@nvocc.com",
    "password": "Admin@123"
  }'
```

#### Switch Role

```bash
curl -X POST http://localhost:5000/api/auth/switch-role \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "role": "SALES"
  }'
```

## Default Users

After running the seed command, you'll have these test accounts:

| Email                | Password       | Roles           |
| -------------------- | -------------- | --------------- |
| `admin@nvocc.com`    | `Admin@123`    | ADMIN           |
| `customer@test.com`  | `Customer@123` | CUSTOMER        |
| `sales@test.com`     | `Sales@123`    | SALES           |
| `port@test.com`      | `Port@123`     | PORT            |
| `multiuser@test.com` | `Multi@123`    | SALES, CUSTOMER |

## Security Features

### Password Security

- Minimum 8 characters with complexity requirements
- bcrypt hashing with salt rounds of 12
- Password strength validation
- Protection against common passwords

### Rate Limiting

- **API Routes:** 100 requests per 15 minutes
- **Authentication:** 5 attempts per 15 minutes
- **Registration:** 3 attempts per hour
- **Password Reset:** 3 attempts per hour
- **Role Switch:** 10 attempts per 5 minutes

### Token Security

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Automatic token rotation
- Session invalidation on logout

## Development

### Available Scripts

```bash
npm run dev          # Start development server with auto-reload
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with initial data
npm run db:reset     # Reset database and reseed
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Database Commands

```bash
# View database in browser
npm run db:studio

# Create new migration
npx prisma migrate dev --name "migration_name"

# Reset database (⚠️ DESTRUCTIVE)
npm run db:reset
```

## Production Deployment

### Environment Setup

1. **Generate secure JWT secrets:**

   ```bash
   # Generate random secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update environment variables:**

   ```env
   NODE_ENV=production
   DATABASE_URL="your-production-database-url"
   JWT_SECRET="your-secure-jwt-secret"
   JWT_REFRESH_SECRET="your-secure-refresh-secret"
   WEBSITE_URL="https://your-domain.com"
   ```

3. **Security checklist:**
   - [ ] Use HTTPS in production
   - [ ] Set secure JWT secrets
   - [ ] Configure CORS for your domain
   - [ ] Set up database backups
   - [ ] Monitor rate limiting logs
   - [ ] Enable access logging

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Role Permissions

### ADMIN

- Full system access
- User management
- Role management
- System configuration

### CUSTOMER

- View/create/edit bookings
- Track shipments
- View documents
- Access customer portal

### SALES

- Customer management
- Booking management
- Sales reports
- Quote generation

### PORT / MASTER_PORT

- Vessel management
- Schedule management
- Port operations
- (Master Port has additional create/delete permissions)

### DEPOT

- Container inventory
- Container tracking
- Depot operations

### HR

- Employee management
- HR reports
- Payroll access

## Support

For issues and questions:

1. Check the API documentation
2. Review error codes and messages
3. Check rate limiting headers
4. Verify JWT token validity
5. Ensure proper role permissions

## License

This project is proprietary software for NVOCC Platform.
