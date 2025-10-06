# Bioinformatics Platform

## Overview

A full-stack web-based bioinformatics platform for DNA sequence analysis with user authentication, account management, and comprehensive reporting. The application features a modern dashboard interface with collapsible sidebar navigation and includes advanced codon usage analysis tools.

The platform allows authenticated users to analyze DNA sequences, translate them to amino acids using standard codon tables, manage user accounts, and track analysis history through a robust reporting system.

## Recent Changes

**October 6, 2025**: Major transformation from standalone client-side tool to full-stack authenticated application
- Added Node.js/Express backend with session-based authentication
- Implemented collapsible sidebar navigation with Dashboard, Sequence Analysis, Reports, and Settings pages
- Created comprehensive settings page with Basic, Advanced, Accounts, and Appearance tabs
- Added account management system with create/delete functionality
- Implemented file-based storage fallback for MongoDB compatibility
- Integrated notification bar and user profile section in sidebar
- Moved codon analyzer to dedicated Sequence Analysis page within dashboard

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: Vanilla JavaScript with modular design
- Multi-page application with dynamic content loading
- Pages: Login, Dashboard (with Sequence Analysis, Reports, Settings)
- Responsive design with collapsible sidebar navigation
- Clean card-based UI with purple gradient theme

**Navigation Structure**:
- Collapsible sidebar with toggle button
- Navigation items: Dashboard, Sequence Analysis, Reports, Settings
- Bottom section: Notification bar + User profile with logout
- Logo displayed when sidebar is collapsed

**Design Pattern**: SPA-like behavior within authenticated session
- Authentication check runs on page load
- Dynamic page switching without full reloads
- Fetch API for all server communication
- Session-based state management

**Rationale**: Modern user experience with minimal dependencies while maintaining clean separation of concerns.

### Backend Architecture

**Technology Stack**: Node.js with Express
- RESTful API design for all data operations
- Session-based authentication using express-session
- bcryptjs for password hashing
- Body-parser for request parsing

**Dual Storage Strategy**: File-based fallback with MongoDB support
- Primary: MongoDB (when `MONGODB_URI` environment variable is set)
- Fallback: JSON file storage in `/data` directory
- Abstraction layer (`FileStorage` class) provides consistent API regardless of backend
- FileQuery class enables query chaining (sort, limit, toArray) for file storage

**API Endpoints**:
- POST /api/login - User authentication
- POST /api/logout - Session termination
- GET /api/user - Current user info
- GET /api/accounts - List all accounts
- POST /api/accounts - Create new account
- DELETE /api/accounts/:id - Remove account
- GET /api/reports - Fetch analysis history
- POST /api/reports - Save new analysis

**Rationale**: The dual storage approach allows the application to run in environments without database access while being production-ready when MongoDB is available. This makes the app highly portable and easy to deploy.

### Authentication & Authorization

**Session Management**:
- Express-session for server-side session storage
- Sessions persist user authentication state
- Protected routes check session before allowing access
- Automatic redirect to login for unauthorized requests

**Password Security**:
- bcryptjs hashing with salt rounds (10 rounds by default)
- Passwords never stored in plain text
- Admin default credentials: username `admin`, password `admin123` (should be changed in production)

**Role-based Access Control**:
- User roles stored in user documents (e.g., "admin", "user")
- Role checked on both frontend and backend
- Session stores username, userId, and role

**Rationale**: Session-based auth chosen for simplicity and security in server-rendered context.

### Data Models

**Users Collection/File** (`data/users.json`):
```javascript
{
  _id: string,
  username: string,
  password: string (hashed),
  email: string,
  role: string,
  createdAt: ISO date string
}
```

**Accounts Collection/File** (`data/accounts.json`):
```javascript
{
  _id: string,
  name: string,
  email: string,
  type: string,
  description: string,
  createdBy: string,
  createdAt: ISO date string
}
```

**Reports Collection/File** (`data/reports.json`):
```javascript
{
  _id: string,
  sequenceLength: number,
  totalCodons: number,
  gcContent: string,
  atContent: string,
  sequence: string (first 100 chars),
  createdBy: string,
  createdAt: ISO date string
}
```

**Rationale**: Simple document structure optimized for both MongoDB and JSON file storage. Minimal nesting keeps queries simple and data retrieval fast.

### Bioinformatics Features

**DNA Sequence Analysis**:
- Codon table for standard genetic code translation (64 codons)
- DNA to amino acid conversion with full names
- Sequence validation and processing
- GC/AT content calculation
- Codon frequency analysis with visual charts

**Analysis Capabilities**:
- Sequence input and validation (ATCG only)
- Translation to protein sequences
- Top 20 codon frequency visualization
- Amino acid grouping by codon
- Report generation and storage
- Historical analysis tracking

**Visualization**:
- Interactive codon frequency grid
- Amino acid translation groups
- Color-coded bar charts for top codons
- Real-time statistics display

**Rationale**: Implements core bioinformatics functionality using standard genetic code tables. Client-side processing for immediate feedback, server-side for permanent storage.

## External Dependencies

### Core Runtime Dependencies

**express (^5.1.0)**: Web application framework
- Handles routing, middleware, and HTTP server
- Version 5.x chosen for modern async/await support

**express-session (^1.18.2)**: Session management
- Provides server-side session storage
- Used for maintaining authentication state

**body-parser (^2.2.0)**: Request body parsing
- Parses JSON and urlencoded request bodies
- Required for API endpoint data handling

**bcryptjs (^3.0.2)**: Password hashing
- Pure JavaScript implementation (no native dependencies)
- Provides secure password storage

**mongodb (^6.20.0)**: MongoDB driver
- Official Node.js driver for MongoDB
- Only used when `MONGODB_URI` is configured
- Supports latest MongoDB features

### External Services

**MongoDB Database** (Optional):
- Connection via `MONGODB_URI` environment variable
- Database name: `bioinformatics_db`
- Collections: `users`, `accounts`, `reports`
- Falls back to file storage if not configured

**File System Storage** (Fallback):
- Local JSON files in `/data` directory
- Files: `users.json`, `accounts.json`, `reports.json`
- Automatic initialization if MongoDB unavailable
- FileQuery class for query chaining support

### Static Assets

All frontend assets served from `/public` directory:
- **HTML pages**: login.html, dashboard.html
- **CSS stylesheets**: css/login.css, css/dashboard.css
- **JavaScript modules**: js/dashboard.js, js/login.js, js/sequence.js, js/reports.js, js/settings.js

No CDN dependencies - all code is self-contained within the repository.

## Project Structure

```
/
├── server.js                 # Express backend server
├── package.json             # Node.js dependencies
├── data/                    # File-based storage (auto-created)
│   ├── users.json
│   ├── accounts.json
│   └── reports.json
└── public/                  # Frontend static files
    ├── login.html
    ├── dashboard.html
    ├── css/
    │   ├── login.css
    │   └── dashboard.css
    └── js/
        ├── login.js
        ├── dashboard.js
        ├── sequence.js
        ├── reports.js
        └── settings.js
```

## Getting Started

1. Install dependencies: `npm install`
2. (Optional) Set MongoDB URI: `export MONGODB_URI=your_mongodb_connection_string`
3. Run server: `node server.js`
4. Access application at `http://localhost:5000`
5. Login with default credentials: `admin` / `admin123`

## Security Notes

- Default admin credentials should be changed before production deployment
- Session secret should be set via `SESSION_SECRET` environment variable in production
- MongoDB credentials should be stored securely via environment variables
- Consider implementing HTTPS for production environments
