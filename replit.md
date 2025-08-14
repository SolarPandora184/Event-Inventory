# Overview

This is an AESA Squadron 72 Inventory Management System - a full-stack web application for military inventory tracking and request management. The system provides a comprehensive interface for submitting equipment requests, managing inventory status, and administrative oversight of squadron equipment. Built with modern web technologies, it features a dark-themed UI optimized for professional military use with real-time data synchronization.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 14, 2025)

## Project Migration and Firebase Storage Enhancement
- **Complete Migration**: Successfully migrated from Replit Agent to standard Replit environment
- **Firebase Storage Centralization**: Event name and event password now save to Firebase instead of localStorage
- **Storage Policy**: Only authentication cookies use localStorage; all settings stored in Firebase for real-time sync
- **Footer Enhancement**: Added message about system availability for other events
- **Data Persistence**: Event settings persist across sessions and sync in real-time between admin changes

# Previous Changes

## Comprehensive Survey System Implementation
- **Survey Toggle Control**: Admin panel switch to enable/disable survey button in header
- **Survey Dialog**: Complete survey form with user type dropdown (Event Senior Staff, Event Participant, Requestor Only)
- **Survey Questions**: "Would use again", "Prefer over Excel spreadsheet", and open feedback textbox
- **CSV Export**: Master password-protected export functionality for survey responses with timestamps
- **Data Management**: Survey data automatically cleared during inventory reset operations
- **Firebase Integration**: Real-time survey settings and response storage

## Advanced Password Management System
- **Password Toggle Switch**: Admin control to enable/disable event password requirement
- **Master Password Protection**: All password changes require master password "Ku2023!@" authentication
- **Conditional Authentication**: Users only prompted for event password when requirement is enabled
- **Dual Security Layers**: Master password protects system settings, event password controls user access
- **Export Security**: Survey data export requires master password verification

## Enhanced Toast Notification System
- **Maximum Popup Limit**: Implemented 3-popup maximum display with automatic removal of oldest notifications
- **Auto-Dismiss Timer**: Added 5-second auto-dismiss functionality for all toast notifications  
- **Undo Functionality**: Enhanced toasts with undo button capability for reversible actions
- **Real Actions**: Updated inventory and request forms to include undo functionality with actual database operations
- **Better Management**: Implemented proper timeout cleanup and toast lifecycle management
- **Bug Fixes**: Fixed React prop warnings by filtering DOM-incompatible props

## Simplified GitHub Pages Hosting
- **Streamlined Build Process**: Replaced complex Node.js build script with simple bash script
- **Simplified Documentation**: Condensed deployment guide to essential steps only
- **Cleaner Setup**: Removed unnecessary complexity while maintaining functionality

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom AESA Squadron theming and dark mode design
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Pattern**: RESTful API design with `/api` prefix routing
- **Development**: Hot module replacement with Vite integration for seamless development experience

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Database**: Firebase Realtime Database for live inventory updates and request synchronization
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud database hosting

## Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **User Schema**: Basic user authentication with username/password stored in PostgreSQL
- **Security**: Session-based authentication with secure cookie handling

## Key Features Architecture
- **Inventory Management**: Multi-status tracking (missing, complete, verified, returned) with real-time updates
- **Request System**: Form-based equipment requests with approval workflow
- **Admin Panel**: Administrative controls for inventory management and system oversight
- **Responsive Design**: Mobile-first approach with adaptive UI components

## Development Workflow
- **Type Safety**: Shared TypeScript types between client and server
- **Validation**: Zod schemas for runtime type validation and form handling
- **Hot Reload**: Integrated development server with automatic recompilation
- **Error Handling**: Comprehensive error boundaries and user feedback systems

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React Hook Form with Zod resolvers for form management
- **UI Components**: Radix UI primitives, Shadcn/ui component system, Lucide React icons
- **Styling**: Tailwind CSS with PostCSS processing and class variance authority

## Backend Services
- **Database**: Neon Database (PostgreSQL), Firebase Realtime Database for live features
- **ORM**: Drizzle ORM with PostgreSQL dialect and Zod integration
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

## Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development**: TSX for TypeScript execution, ESBuild for production builds
- **Replit Integration**: Cartographer plugin and runtime error overlay for Replit environment

## Utility Libraries
- **Date Handling**: date-fns for date manipulation and formatting
- **Styling Utilities**: clsx and tailwind-merge for conditional styling
- **Carousel**: Embla Carousel for image/content carousels
- **Command Interface**: CMDK for command palette functionality

## Firebase Configuration
- **Project**: video-call-system-140da (reused Firebase project)
- **Features**: Realtime Database for live inventory synchronization
- **Integration**: Custom Firebase client configuration with environment variable support