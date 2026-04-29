# HRMS - Human Resource Management System

A modern, production-ready HR management system built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### 🔐 Authentication & Authorization
- [x] Role-based access control (Employee, Manager, HR, Admin)
- [x] NextAuth.js integration with credentials provider
- [x] Protected routes with auth guards

### 👥 Employee Management
- [x] Employee listing with search and filters
- [x] Detailed employee profiles with tabs
- [x] Add/edit employee information
- [x] Department and designation management

### ⏰ Attendance Tracking
- [x] Attendance records view
- [x] Monthly attendance reports
- [x] CSV export functionality
- [x] Role-based attendance access

### 🏖️ Leave Management
- [x] Leave request submission
- [x] Leave approval workflow for HR/Managers
- [x] Leave balance tracking
- [x] Multiple leave types support

### 📅 Holiday Management
- [x] Holiday calendar view
- [x] Year and region filtering
- [x] Holiday creation (HR/Admin only)

### 👤 Profile Management
- [x] Self-service profile editing
- [x] Personal information management
- [x] Emergency contact management
- [x] Password change functionality

### ⚙️ Administration
- [x] Department management
- [x] Designation management
- [x] User management
- [x] Leave policies configuration

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Date Handling**: Day.js
- **HTTP Client**: Axios

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

Use these credentials to test different roles:

- **Employee**: john.doe@company.com / password
- **Manager**: sarah.manager@company.com / password  
- **HR**: mike.hr@company.com / password
- **Admin**: admin@company.com / password

## Project Structure

```
├── app/
│   ├── (auth)/login/          # Authentication pages
│   ├── (app)/                 # Protected app pages
│   │   ├── dashboard/         # Dashboard
│   │   ├── employees/         # Employee management
│   │   ├── attendance/        # Attendance tracking
│   │   ├── holidays/          # Holiday management
│   │   ├── leaves/            # Leave management
│   │   ├── profile/           # Profile management
│   │   └── admin/             # Administration
│   ├── api/                   # API routes (stubbed)
│   └── providers.tsx          # App providers
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   └── auth/                  # Auth components
├── lib/                       # Utilities and configurations
├── store/                     # Zustand stores
└── README.md
```

## Key Features Implementation

### Role-Based Access Control
The system implements comprehensive role-based access control with four roles:
- **Employee**: Basic access to personal data
- **Manager**: Team management capabilities
- **HR**: People management functions
- **Admin**: Full system administration

### Responsive Design
- Mobile-first responsive design
- Collapsible sidebar for desktop
- Mobile drawer navigation
- Optimized for all screen sizes

### Modern UI/UX
- Clean, professional design
- Dark mode support
- Loading states and skeletons
- Empty states with helpful messaging
- Toast notifications for user feedback

### Data Management
- Mock data system for development
- Proper TypeScript interfaces
- Client-side filtering and searching
- CSV export functionality

## Development Notes

This is a frontend-only implementation with stubbed API routes using mock data. In production, you would:

1. Replace mock data with real database integration
2. Implement proper authentication with secure password hashing
3. Add file upload functionality for documents and avatars
4. Implement real-time notifications
5. Add comprehensive error handling
6. Set up proper logging and monitoring

## License

MIT License - feel free to use this project as a starting point for your own HRMS solution.