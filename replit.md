# Overview

This is a modern mobile-first marketplace web application designed for students to buy and sell items within their school communities. The platform combines e-commerce functionality with social features, allowing users to browse items, engage in real-time chat, and participate in community discussions. Built as a Progressive Web App (PWA) with a mobile-first design approach, it targets the student market with location-based filtering by school and country.

## Recent Changes (November 2025)
- **Nickname Registration System (November 16, 2025)**:
  - Added nickname field to user schema for personalized user identification
  - Updated registration flow: nickname → country → school (3-step process)
  - Modified welcome message to display user's nickname after first step
  - Added "한글명으로 입력해주세요" guidance text below school input field
- **Settings Page Updates (November 16, 2025)**:
  - Replaced logout button with account deletion button in settings page
  - Increased spacing in settings "기타" section for better readability
  - Implemented contact form with dialog interface and completion popup
  - Contact form currently logs to server console (email integration pending)
  - Note: Email sending to park36470805@gmail.com requires integration setup (Resend/SendGrid/Gmail)

## Recent Changes (January 2025)
- Added comprehensive admin dashboard with separate authentication flow
- Implemented scroll position restoration for improved navigation experience
- Enhanced mobile UI with larger product images and optimized text sizing
- Added country-specific filtering with dropdown selection
- Created admin management system with user and item controls
- Admin access via dedicated login page at /admin route
- Implemented OAuth authentication with social login support (Google, Kakao, Naver)
- Added OAuth provider and providerId fields to user schema for social authentication
- Updated database schema to support both email and OAuth authentication
- Added social login buttons to login page with OAuth callback handling
- **Comprehensive Item Status System (January 5, 2025)**:
  - Added status field to items with three states: 거래가능/거래완료/거래기간만료
  - Implemented visual status indicators with graying effect for inactive items
  - Status badges repositioned before price in item cards for better visibility
  - Created seller-only status management in item detail pages
  - Implemented automatic expiration based on trading period dates
  - Added test data with various statuses and realistic product images
- **Currency Conversion System (January 6, 2025)**:
  - Implemented multi-currency support with automatic KRW conversion
  - Added currency field to items schema and database
  - Created formatCurrency utility function for price display
  - Enhanced price display format: €12(19,758원) showing original currency with KRW conversion
  - Applied currency conversion to homepage item cards and detail pages
  - Fixed /items/create page with currency selection and conversion preview
  - Implemented automatic exchange rate service with daily updates via cron jobs
  - Added fallback rates for exchange service reliability
- **Community Feature Implementation (January 9, 2025)**:
  - Created comprehensive community system with "이야기방" and "모임방" tabs
  - Added semester field to community posts schema for meeting posts
  - Implemented country-based color coding for meeting cards in grid layout
  - Added header with logo to community pages for consistent navigation
  - Created meeting creation form with semester selection (year + semester dropdown)
  - Built story posts with traditional list layout showing images, views, and comments
  - Added database seeding for community test data with both story and meeting posts
- **UI/UX Improvements and Feature Removals (November 2025)**:
  - Removed favorites/likes feature completely from all pages (home, MY, item detail)
  - Made registration mandatory: country and school inputs now required, removed skip button
  - Enhanced ItemCard layout: status badges moved before price, view count and timestamp moved to bottom
  - Fixed country filter behavior: defaults to "전체 국가" for unauthenticated users, user's country when logged in
  - Removed likes count display from item cards and detail pages
  - Streamlined MY page by removing favorites menu option
  - Removed heart/like button from item detail bottom action bar
  - Deleted favorites-related pages (/favorites, /my/favorites) and hooks (use-favorites)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses a React-based Single Page Application (SPA) architecture built with Vite for fast development and optimized builds. The application follows a mobile-first responsive design pattern using Tailwind CSS for styling and shadcn/ui components for consistent UI elements. State management is handled through React Query for server state and React Context for authentication state. The routing system uses Wouter for lightweight client-side navigation.

## Backend Architecture  
The server implements a REST API architecture using Express.js with TypeScript. The application follows a layered architecture pattern with clear separation between routes, business logic, and data access layers. Real-time communication is enabled through WebSocket connections for instant messaging features. The server includes comprehensive middleware for request logging, error handling, and JWT-based authentication.

## Authentication & Authorization
The system uses JWT (JSON Web Tokens) for stateless authentication with bcrypt for password hashing. Authentication state is managed client-side through React Context with tokens stored in localStorage. Protected routes require valid JWT tokens passed via Authorization headers. The authentication flow supports both login and registration with user session persistence.

## Data Storage Strategy
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations and migrations. The database schema supports users, items, chat rooms, messages, community posts, comments, and favorites with proper foreign key relationships. Neon Database is used as the PostgreSQL provider for serverless database hosting.

## File Upload & Storage
File uploads are handled through Uppy.js on the frontend with support for drag-and-drop, progress tracking, and multiple file selection. The backend integrates with Google Cloud Storage for scalable file storage with AWS S3 compatibility as a fallback option. Images are stored as arrays in the database with cloud storage URLs.

## Real-time Communication
WebSocket connections enable real-time messaging between users with automatic reconnection logic and message queuing. The WebSocket server handles user authentication, room-based messaging, and message broadcasting. Client-side WebSocket management includes connection state handling and automatic reconnection on network failures.

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle Kit**: Database migration and schema management tools

## Cloud Storage
- **Google Cloud Storage**: Primary file storage solution for images and documents
- **AWS S3**: Alternative cloud storage option for file uploads

## UI Component Library
- **shadcn/ui**: Pre-built accessible UI components based on Radix UI primitives
- **Radix UI**: Headless component library for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework for responsive design

## Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and salt generation

## File Upload Management  
- **Uppy**: Modular file upload library with dashboard, drag-drop, and progress features
- **Multiple Uppy plugins**: Core, Dashboard, Drag Drop, File Input, Progress Bar, React integration

## Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **React Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **ESBuild**: Fast JavaScript bundler for production builds

## Real-time Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time messaging
- **Custom WebSocket manager**: Client-side connection management with reconnection logic