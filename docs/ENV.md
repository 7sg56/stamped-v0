# Environment Configuration

## Setup

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your configuration

## Environment Variables

### Database
```env
MONGODB_URI=mongodb://localhost:27017/stamped-attendance
```
- **Local MongoDB**: `mongodb://localhost:27017/stamped-attendance`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/stamped-attendance`

### Server Configuration
```env
PORT=5001
NODE_ENV=development
```
- **PORT**: Backend server port (default: 5001)
- **NODE_ENV**: Environment mode (`development` or `production`)

### API Configuration
```env
API_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001
```
- **API_URL**: Backend API URL for server-side requests
- **NEXT_PUBLIC_API_URL**: Frontend API URL (must be public for client-side)

### Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-here
```
- **JWT_SECRET**: Secret key for JWT token signing (use a strong secret in production)

### Admin Credentials (for seeding)
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```
- **ADMIN_USERNAME**: Default admin username
- **ADMIN_PASSWORD**: Default admin password


## Frontend Environment Variables

Next.js requires environment variables to be in the frontend directory:

### Option 1: Symlink (Recommended)
```bash
# From project root
ln -s ../.env ./frontend/.env.local
```

### Option 2: Copy
```bash
# From project root
cp .env ./frontend/.env.local
```

### Option 3: Separate Files
Create `frontend/.env.local` with only frontend variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Production Configuration

### Security Checklist
- [ ] Change default admin credentials
- [ ] Use strong JWT secret (32+ characters)
- [ ] Use HTTPS URLs in production
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific MongoDB URI
- [ ] Configure production email service

### Example Production .env
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stamped-prod

# Server
PORT=5001
NODE_ENV=production

# API
API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Auth
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-here

# Admin
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password

## Troubleshooting

### Common Issues

**Frontend can't connect to backend**
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Ensure backend is running on correct port
- Verify CORS settings in backend

**Database connection failed**
- Check MongoDB is running
- Verify connection string format
- Ensure database permissions

**JWT token errors**
- Verify `JWT_SECRET` is set
- Check token expiration settings
- Ensure secret is consistent across restarts
