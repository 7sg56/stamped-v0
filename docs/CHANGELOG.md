# Changelog

All notable changes to the Stamped project will be documented in this file.

## [Latest Updates] - 2025-01-20

### 🎯 System Improvements

- **Event-Specific Scanner Validation**: QR codes are now validated against the specific event being scanned
- **Smart Event Handling**: Prevents QR codes from being used at wrong events
- **Duplicate Registration Protection**: Backend validation prevents duplicate registrations for the same event
- **Enhanced QR Code Format**: QR codes now use `eventId:registrationId` format for better reliability

### 🎨 User Interface Improvements

- **Dark Theme Implementation**: Applied consistent dark theme across admin interfaces with zinc color palette
- **Simplified Scanner Feedback**: Replaced crowded feedback with clean success/failure messages
- **Dashboard UI Overhaul**: Converted to card-based layout with inline action buttons
- **Event Cards Enhancement**: Improved visual consistency with darker create event card styling

### 🚀 User Experience Enhancements

- **Auto-Download Tickets**: PDF tickets now automatically download after registration
- **Improved Registration Flow**: Full registration form with name and email inputs restored
- **Better Error Handling**: Clear error messages for different failure scenarios
- **Enhanced Navigation**: Fixed back button navigation to prevent accidental logout

### 🔧 Technical Improvements

- **API Endpoint Corrections**: Fixed multiple endpoint mismatches including registration endpoints
- **Build Error Fixes**: Resolved all TypeScript and ESLint warnings for clean builds
- **Component Optimization**: Removed unused imports and variables for better performance
- **Error Boundary Implementation**: Added proper 404 page and error handling

### 📱 Mobile Responsiveness

- **Scanner Interface**: Optimized QR scanner for mobile devices
- **Registration Forms**: Improved mobile form experience with proper input sizing
- **Dashboard Layout**: Enhanced mobile navigation and card layouts

### 🛠️ Backend Improvements

- **Registration Endpoint**: Corrected from `/events/{id}/register` to `/registrations`
- **Attendance Validation**: Added `expectedEventId` parameter for proper event validation
- **Data Structure Updates**: Updated field names from `hasAttended` to `attended`
- **Error Response Enhancement**: Improved error messages and response structure

### 🎯 Admin Features

- **Event-Specific Scanners**: Each event now has its own dedicated scanner page
- **Global Scanner Conversion**: Transformed global scanner to event selector interface
- **Participant Management**: Enhanced participant list with attendance status indicators
- **Export Functionality**: Maintained CSV/Excel export capabilities with updated data structure

### 🐛 Bug Fixes

- **Registration Endpoint**: Fixed "endpoint not found" errors in public registration
- **Authentication Issues**: Resolved admin access to scanner functionality
- **QR Code Parsing**: Fixed format parsing from JSON to string-based format
- **Navigation Flow**: Fixed back button issues that caused logout problems
- **Syntax Errors**: Resolved JSX structure issues and missing closing tags

### 📚 Documentation Updates

- **Security Documentation**: Added comprehensive security fix documentation
- **API Documentation**: Updated endpoint references and request/response examples
- **README Updates**: Reflected all new features and improvements
- **Changelog Creation**: Added this changelog to track future updates

## Previous Versions

### [Initial Release]

- Basic event management system
- QR code generation and scanning
- Admin dashboard
- PDF ticket generation
- User registration system

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
