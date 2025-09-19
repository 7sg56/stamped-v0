# Cross-Event Attendance Security Fix

## Problem Identified

The system had a critical security vulnerability where users registered for multiple events by the same organizer could have their attendance marked incorrectly across events.

### Attack Scenario:

1. Sam registers for **Hackathon** (Event A) → gets QR: `eventA_id:REG-123-ABC`
2. Sam registers for **Ideathon** (Event B) → gets QR: `eventB_id:REG-456-DEF`
3. Sam goes to **Ideathon** but accidentally shows **Hackathon QR**
4. Scanner at Ideathon scans `eventA_id:REG-123-ABC`
5. **BUG**: System marks Sam's Hackathon registration as attended
6. **RESULT**: Sam can no longer attend the actual Hackathon event

## Root Cause

The attendance API (`/api/attendance/mark`) only validated that the QR code was valid and the participant existed, but **did not validate that the QR code belonged to the event where the scanner was being used**.

## Solution Implemented

### Backend Changes (`backend/routes/attendance.js`):

1. **Added `expectedEventId` parameter** to the attendance marking API
2. **Added validation** to ensure the QR code's event ID matches the expected event ID
3. **Returns clear error** when QR codes from different events are scanned

```javascript
// CRITICAL SECURITY CHECK: Ensure QR code is for the expected event
if (eventId !== expectedEventId) {
  return res.status(400).json({
    success: false,
    message: `This QR code is for a different event. Please scan a QR code for this event only.`,
    data: {
      scannedEventId: eventId,
      expectedEventId: expectedEventId,
    },
  });
}
```

### Frontend Changes:

1. **Event-specific scanners** now send the current event ID as `expectedEventId`
2. **Global scanner converted to event selector** - now shows list of active events and redirects to event-specific scanners
3. **Enhanced error messages** for better user experience
4. **Improved UX** - admins select which event to scan for, eliminating confusion

## Security Impact

- ✅ **Prevents cross-event attendance marking**
- ✅ **Maintains data integrity across events**
- ✅ **Provides clear error messages for users**
- ✅ **Backward compatible with existing QR codes**

## New User Flow

1. **Admin accesses `/scanner`** → Shows list of active events
2. **Admin selects event** → Redirected to `/events/[eventId]/scanner`
3. **Event-specific scanner opens** → Only accepts QR codes for that event
4. **Cross-event QR scanned** → Rejected by backend with clear error message

## Testing Scenarios

1. ✅ Valid QR code for correct event → Attendance marked successfully
2. ✅ QR code from different event → Rejected with clear error message
3. ✅ Invalid QR code format → Rejected with appropriate error
4. ✅ Multiple events by same organizer → Each event isolated correctly
5. ✅ Global scanner → Now shows event selector for better UX

This fix ensures that attendance can only be marked for the correct event, preventing the cross-event contamination issue while providing an intuitive user experience.
