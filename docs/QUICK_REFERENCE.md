# Quick Reference Guide

## 🚀 Development Commands

### Backend

```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
```

### Frontend

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🔗 Important URLs

| Service     | Development               | Production       |
| ----------- | ------------------------- | ---------------- |
| Frontend    | http://localhost:3000     | Your domain      |
| Backend API | http://localhost:5001     | Your API domain  |
| MongoDB     | mongodb://localhost:27017 | Your MongoDB URI |

## 📁 Key File Locations

### Frontend Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── events/            # Event-related pages
│   ├── dashboard/         # Admin dashboard
│   └── scanner/           # QR scanner pages
├── components/            # Reusable components
├── lib/                   # Utility functions
└── public/               # Static assets
```

### Backend Structure

```
backend/
├── routes/               # API route handlers
│   ├── events.js        # Event management
│   ├── registrations.js # Registration handling
│   └── attendance.js    # QR scanning & attendance
├── models/              # MongoDB models
├── middleware/          # Custom middleware
└── utils/              # Utility functions
```

## 🔑 Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Backend (.env)

```bash
PORT=5001
MONGODB_URI=mongodb://localhost:27017/stamped
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 🛠️ Common Tasks

### Create New Event

1. Navigate to `/dashboard`
2. Click "Create New Event" card
3. Fill in event details
4. Submit form

### Scan QR Codes

1. Go to `/scanner` (shows event list)
2. Select specific event
3. Click "Start Scanning"
4. Point camera at QR code

### Export Data

1. Go to event in dashboard
2. Click "Export" button
3. Choose CSV or Excel format
4. File downloads automatically

## 🔍 Debugging Tips

### Common Issues

1. **CORS Errors**: Check API URL in frontend env
2. **Database Connection**: Verify MongoDB is running
3. **Authentication**: Check JWT token in localStorage
4. **QR Scanner**: Ensure HTTPS for camera access
5. **Build Errors**: Check for TypeScript/ESLint issues

### Useful Browser Console Commands

```javascript
// Check authentication status
localStorage.getItem("adminToken");
localStorage.getItem("adminUser");

// Clear authentication
localStorage.removeItem("adminToken");
localStorage.removeItem("adminUser");

// Check API connectivity
fetch("http://localhost:5001/events");
```

## 📊 API Endpoints Quick Reference

### Events

- `GET /events` - List all events
- `POST /events` - Create new event
- `GET /events/:id` - Get event details
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Registrations

- `POST /registrations` - Register for event
- `GET /registrations/event/:eventId` - Get event registrations

### Attendance

- `POST /attendance/mark` - Mark attendance via QR scan
- `GET /attendance/export/:eventId` - Export attendance data

### Authentication

- `POST /auth/login` - Admin login
- `POST /auth/register` - Admin registration

## 🎨 UI Components

### Common Components

```jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import TicketGenerator from "@/components/TicketGenerator";
```

### Toast Notifications

```javascript
import toast from "react-hot-toast";

toast.success("Success message");
toast.error("Error message");
toast.loading("Loading...");
```

## 🔒 Security Checklist

### Before Deployment

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure MongoDB authentication
- [ ] Enable rate limiting
- [ ] Set up proper logging
- [ ] Configure security headers
- [ ] Test all authentication flows

### Regular Maintenance

- [ ] Update dependencies regularly
- [ ] Monitor error logs
- [ ] Check security vulnerabilities
- [ ] Backup database regularly
- [ ] Monitor performance metrics
- [ ] Review access logs
- [ ] Test disaster recovery

## 📱 Mobile Testing

### Test Scenarios

1. **Registration Flow**: Complete registration on mobile
2. **QR Scanner**: Test camera access and scanning
3. **Ticket Download**: Verify PDF download works
4. **Navigation**: Test all navigation flows
5. **Form Inputs**: Test all form interactions
6. **Responsive Design**: Test on different screen sizes

### Testing Tools

- Chrome DevTools mobile emulation
- Real device testing (iOS/Android)
- BrowserStack for cross-browser testing
- Lighthouse for performance auditing

## 🚨 Emergency Procedures

### System Down

1. Check server status and logs
2. Verify database connectivity
3. Check DNS and SSL certificates
4. Review recent deployments
5. Rollback if necessary

### Data Issues

1. Stop write operations if needed
2. Create immediate backup
3. Identify scope of issue
4. Plan recovery strategy
5. Execute recovery with monitoring

### Security Incident

1. Isolate affected systems
2. Preserve evidence and logs
3. Assess impact and scope
4. Implement immediate fixes
5. Notify stakeholders
6. Document incident and lessons learned

---

**Need help?** Check the full documentation or create an issue on GitHub.
