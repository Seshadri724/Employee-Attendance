# CARIVIX - Dynamic Attendance Management System

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

CARIVIX is a high-performance, real-time attendance management system designed for modern enterprises. Built with a focus on speed, reliability, and user experience, it streamlines employee tracking, task management, and performance analytics through a dynamic, state-driven architecture.

## ✨ Core Features

### 🏢 Comprehensive Administration
- **Employee Lifecycle Management**: Intuitive CRUD operations for team members.
- **Real-Time Analytics**: Live dashboards with attendance rates and performance trends.
- **Dynamic Configuration**: Adaptable form systems and role-based access control.

### 👤 Employee empowerment
- **Smart Check-in/Out**: Seamless attendance tracking with integrated voice commands.
- **Task Orchestration**: Real-time task creation, status tracking, and submission workflows.
- **Performance Insights**: Personal metrics, streaks, and engagement scores.

### 🛠️ Technical Excellence
- **Zero-Latency State**: Powered by React Context API for instant updates across the UI.
- **Reliable Persistence**: Robust local storage integration ensuring data continuity.
- **Responsive Architecture**: Pixel-perfect design across mobile, tablet, and desktop environments.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `^20.19.0` or `>=22.12.0`
- **npm**: `^10.0.0` or `^11.0.0`

### Installation

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd carivix-attendance
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   ```

## 🔐 Credentials (Demo)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@carivix.com` | `admin123` |
| **Employee** | `john@carivix.com` | `employee123` |

## 📁 Project Architecture

```text
src/
├── components/      # UI Components (Admin, Employee, Shared)
├── context/         # Global State Management (Auth, Data, Notifications)
├── hooks/           # Custom React Hooks
├── types/           # TypeScript Definitions
└── utils/           # Helper Functions & Utilities
```

## 📜 Development Philosophy

- **Type Safety**: Comprehensive TypeScript implementation for robust code quality.
- **Modular Design**: Reusable components and logic for easy maintainability.
- **Performance**: Optimized re-rendering and efficient data handling.
- **Accessibility**: Commitment to inclusive design standards.

---

*Developed by CARIVIX Team - Empowering Modern Workforces.*