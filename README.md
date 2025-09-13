# Stamped

<div align="center">

**Event management system with QR code attendance tracking**

<div align="center">

### Website Landing Page
<img src="assets/website.png" alt="Stamped Website" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"/>

### Admin Dashboard
<img src="assets/admin-dashboard.png" alt="Admin Dashboard" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"/>

</div>

## 📋 Table of Contents

- [Features](#-features)
- [Planned Features](#-planned-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Live Demo](#-live-demo)

## ✨ Features

### Current Features
- **Event Management** - Create and manage events with full CRUD operations
- **QR Code Attendance** - Real-time QR code scanning for instant check-ins
- **Admin Dashboard** - Comprehensive analytics and event management
- **Email Notifications** - Automatic QR code delivery via email
- **Data Export** - Export attendance data as CSV/Excel files
- **Responsive Design** - Mobile-first design that works on all devices

### 🚧 Planned Features

- **Super Admin Route** - Access to all events across the platform with centralized management
- **Account Verification System** - Super admin approval process for new accounts before they can publish events
- **Enhanced Event Media** - Image carousels and video playback in event cards and detail pages
- **Advanced Analytics** - Improved reporting and insights dashboard
- **Billing & Subscriptions** - Usage-based pricing and subscription management


## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Aceternity UI** - Advanced animations and effects

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **QRCode** - QR generation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stamped.git
   cd stamped
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd frontend && npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Update .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm run dev
   
   # Frontend (Terminal 2)
   cd frontend && npm run dev
   ```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Default Admin**: `admin` / `admin123`

## 📚 Documentation

<details>
<summary><strong>📖 API Endpoints</strong></summary>

Complete API reference with request/response examples.

[View API Documentation →](docs/API.md)

</details>

<details>
<summary><strong>🏗️ Project Structure</strong></summary>

Detailed file organization and directory explanations.

[View Structure Guide →](docs/STRUCTURE.md)

</details>

<details>
<summary><strong>⚙️ Environment Setup</strong></summary>

Configuration guide for development and production.

[View Environment Guide →](docs/ENV.md)

</details>

## 🤝 Contributing

This project is **open to contributions**! We welcome community involvement in:

- 🐛 Bug fixes and improvements
- ✨ New feature development
- 📚 Documentation enhancements
- 🎨 UI/UX improvements
- 🧪 Testing and quality assurance

Feel free to open issues, submit pull requests, or reach out with ideas!

---

<div align="center">

**Built with ❤️ by [Sourish Ghosh](https://github.com/7sg56)**

</div>