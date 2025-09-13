# Project Structure

```
stamped/
├── backend/                    # Backend API server
│   ├── config/                # Database and middleware configuration
│   │   └── db.js             # MongoDB connection setup
│   ├── middleware/            # Authentication and error handling
│   │   ├── auth.js           # JWT authentication middleware
│   │   ├── errorHandler.js   # Global error handling
│   │   └── requestLogger.js  # Request logging
│   ├── models/               # MongoDB data models
│   │   ├── Admin.js          # Admin user model
│   │   ├── Event.js          # Event model
│   │   ├── Participant.js    # Participant model
│   │   └── index.js          # Model exports
│   ├── routes/               # API route handlers
│   │   ├── auth.js           # Authentication routes
│   │   ├── events.js         # Event management routes
│   │   ├── registrations.js  # Registration routes
│   │   ├── attendance.js     # Attendance tracking routes
│   │   ├── dashboard.js      # Dashboard data routes
│   │   └── index.js          # Route exports
│   ├── utils/                # Utility functions
│   │   ├── qr.js             # QR code generation
│   │   ├── mailer.js         # Email service
│   │   ├── csv.js            # CSV export functionality
│   │   ├── errorResponse.js  # Error response helpers
│   │   └── eventCleanup.js   # Event cleanup tasks
│   ├── package.json          # Backend dependencies
│   └── server.js             # Application entry point
├── frontend/                  # Next.js frontend application
│   ├── app/                  # App Router pages and layouts
│   │   ├── dashboard/        # Admin dashboard
│   │   │   └── page.tsx      # Dashboard main page
│   │   ├── events/           # Event management pages
│   │   │   ├── page.tsx      # Events listing
│   │   │   ├── create/       # Event creation
│   │   │   ├── [id]/         # Event details
│   │   │   └── admin/        # Admin event management
│   │   ├── login/            # Admin login
│   │   │   └── page.tsx      # Login form
│   │   ├── register/         # Admin registration
│   │   │   └── page.tsx      # Registration form
│   │   ├── scanner/          # QR code scanner
│   │   │   └── page.tsx      # Scanner interface
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── globals.css       # Global styles and theme
│   │   └── not-found.tsx     # 404 page
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx    # Button component
│   │   │   ├── card.tsx      # Card component
│   │   │   ├── input.tsx     # Input component
│   │   │   ├── label.tsx     # Label component
│   │   │   ├── spotlight.tsx # Spotlight effect
│   │   │   ├── shooting-stars.tsx # Shooting stars animation
│   │   │   └── stars-background.tsx # Star background
│   │   └── EventCard.tsx     # Custom event card
│   ├── lib/                  # Utility functions
│   │   └── utils.ts          # Common utilities
│   ├── public/               # Static assets
│   │   ├── logo.png          # App logo
│   │   ├── website.png       # Website preview
│   │   └── admin-dashboard.png # Dashboard preview
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── tsconfig.json         # TypeScript configuration
├── docs/                     # Documentation
│   ├── API.md               # API endpoints documentation
│   └── STRUCTURE.md         # Project structure (this file)
├── README.md                # Main project documentation
├── env.example              # Environment variables template
└── .gitignore               # Git ignore rules
```

## Key Directories

### Backend (`/backend`)
- **`config/`** - Database and server configuration
- **`middleware/`** - Express middleware for auth, logging, error handling
- **`models/`** - Mongoose schemas for database entities
- **`routes/`** - API endpoint definitions and handlers
- **`utils/`** - Helper functions for QR codes, emails, exports

### Frontend (`/frontend`)
- **`app/`** - Next.js App Router pages and layouts
- **`components/`** - Reusable React components
- **`lib/`** - Utility functions and configurations
- **`public/`** - Static assets and images

### Documentation (`/docs`)
- **`API.md`** - Complete API endpoint documentation
- **`STRUCTURE.md`** - This file with project structure details
