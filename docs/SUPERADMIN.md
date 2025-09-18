# Superadmin System

## Overview
The superadmin system provides elevated privileges to access and manage all events across the platform, regardless of who created them.

**⚠️ IMPORTANT: Superadmin is COMPLETELY HARDCODED and cannot be registered through the normal registration process.**

## Hardcoded Superadmin User

The superadmin account is automatically created on server startup using environment variables and is the ONLY way to obtain superadmin privileges:

| Username | Password | Role |
|----------|----------|------|
| `SUPERADMIN_USERNAME` | `SUPERADMIN_PASSWORD` | superadmin |

**Environment Variables Required:**
- `SUPERADMIN_USERNAME` - The superadmin username
- `SUPERADMIN_PASSWORD` - The superadmin password

## Superadmin Privileges

### 1. **Access All Events**
- Superadmins can view and manage ALL events in the system
- Regular admins can only see events they created
- Dashboard shows all events with organizer information

### 2. **Enhanced Dashboard**
- View events from all organizers
- See organizer names for each event
- Access comprehensive statistics across all events

### 3. **Visual Indicators**
- Superadmin badge displayed in dashboard header
- Organizer information shown on event cards
- Purple gradient "SUPERADMIN" badge

## Technical Implementation

### Backend Changes
- **Admin Model**: Added `role` field with enum `['admin', 'superadmin']`
- **Authentication**: JWT tokens include role information
- **Events API**: Modified to return all events for superadmins
- **Middleware**: Updated to include role in request object

### Frontend Changes
- **Dashboard**: Shows superadmin indicators and organizer info
- **Event Cards**: Display organizer names for superadmins
- **User Interface**: Visual badges and enhanced information display

## Security Notes

- **Superadmin account is COMPLETELY HARDCODED** and created automatically from environment variables
- **NO REGISTRATION**: Superadmin cannot be registered through the normal registration flow
- **RESERVED USERNAME**: The superadmin username from `SUPERADMIN_USERNAME` is blocked from registration
- **ROLE PROTECTION**: Database-level protection prevents role escalation
- **Environment Variables**: Username and password stored in environment variables for security
- **Passwords are hashed** using bcrypt with 12 salt rounds
- **Role information** is included in JWT tokens
- **Superadmin status** is checked on every authenticated request

## Usage

1. **Set Environment Variables** in your `.env` file:
   ```
   SUPERADMIN_USERNAME=superadmin
   SUPERADMIN_PASSWORD=SuperAdmin123!
   ```
2. **Login** with the superadmin credentials
3. **Dashboard** will show "SUPERADMIN" badge
4. **All Events** from all organizers will be visible
5. **Organizer Info** displayed on each event card
6. **Full Access** to manage any event in the system

## API Endpoints

All existing endpoints work the same way, but superadmins get enhanced data:
- `GET /api/events` - Returns all events (not just own)
- `GET /api/dashboard/stats` - Returns statistics for all events
- All other endpoints work with elevated privileges
