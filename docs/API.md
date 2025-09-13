# API Endpoints

## Authentication

- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

## Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

## Participants

- `POST /api/registrations` - Register for event
- `GET /api/registrations/event/:eventId` - Get event registrations (admin)

## Attendance

- `POST /api/attendance/mark` - Mark attendance via QR code
- `GET /api/attendance/event/:eventId` - Get event attendance (admin)
- `GET /api/attendance/stats/:eventId` - Get attendance statistics (admin)

## Export

- `GET /api/export/:eventId` - Export event data as Excel

## Request/Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Create Event
```bash
POST /api/events
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "date": "2024-12-15",
  "time": "09:00",
  "location": "Convention Center",
  "maxParticipants": 500
}
```

### Register for Event
```bash
POST /api/registrations
Content-Type: application/json

{
  "eventId": "event-id-here",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

### Mark Attendance
```bash
POST /api/attendance/mark
Content-Type: application/json

{
  "qrData": "participant-id:event-id"
}
```
