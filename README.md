# ForzaBuildBase

A full-stack web application for creating, sharing, and discovering Forza Horizon 5 car tunes and builds. Browse all 903 cars, create custom setups, and share them with the community.

### Live Demo

**[View Live Project](https://forza-build-base.vercel.app/)**

## Features

- **User Authentication**: Secure sign-up, login, email verification, and password reset
- **Tune Management**: Create, edit, rename, and delete car tunes with detailed settings
- **Browse & Search**: Explore 903 cars with advanced filtering and full-text search
- **Tune Sharing**: Generate public shareable links for tunes with customizable URLs
- **Save Tunes**: Bookmark and manage saved tunes from the community
- **User Profiles**: View creator profiles with their tune collections
- **Profile Customization**: Update profile pictures, usernames, emails, and passwords
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: TanStack Router
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Build Tool**: Vite
- **Icons**: Heroicons, FontAwesome

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **ORM**: MikroORM (MySQL)
- **Database**: MySQL
- **Authentication**: JWT
- **Email Service**: Brevo (production) / Mailtrap (development)
- **Storage**: Cloudflare R2

## Installation

### Prerequisites
- Node.js 16+
- MySQL 8+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

create .env file:

```
NODE_ENV=development
PORT=3000
FRONTEND=http://localhost:5173

# Database
MYSQL_DB_URL=mysql://user:password@localhost:3306/forzabuildbase

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# Cloudflare R2
R2_ACCT_ID=your_account_id
R2_ACCESS_KEY=your_access_key
R2_SECRET_KEY=your_secret_key

# Email Service
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_USER=your_user
MAILTRAP_PASS=your_password
BREVO_API=your_brevo_api_key
```

Start the backend:

```bash
npm run dev
```

### Frontend setup:
```bash
cd frontend
npm install 
```

Create .env file:

```
VITE_BACKEND=http://localhost:3000
VITE_S3_BUCKET=https://your-bucket-url
VITE_FRONTEND=http://localhost:5173
VITE_PROFILE_PIC=https://your-profile-pic-url
```

Start the frontend:
```bash
npm run dev
```

## Build & Deploy

### Frontend
```bash
npm run build
```
Deploy the `dist` folder to Vercel/Netlify

### Backend
```bash
npm run build
npm start
```
Deploy to your hosting platform (Railway, Render, Heroku, etc.)

## Keep-Alive Configuration
The backend is deployed on Render's free tier, which automatically suspends instances after 15 minutes of inactivity. To prevent this, the application uses a combination of keep-alive strategies:

**GitHub Actions Workflow**
A scheduled GitHub Actions workflow pings the /health endpoint every 10 minutes, ensuring the backend remains active and returns a 200 status code.

**External Cron Job**
For additional reliability, a cron job at cron-job.org is configured to ping the backend health endpoint every 10 minutes. This provides redundancy since GitHub Actions scheduling can sometimes be unreliable.

**Health Check Endpoint**
Endpoint: GET /health
Response: 200 OK
Purpose: Keeps the Render instance awake and prevents cold starts
Without these keep-alive mechanisms, the backend may take 30-40 seconds to wake up when a request hits a sleeping instance, significantly impacting user experience.