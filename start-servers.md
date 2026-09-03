# Kizuna Server Startup Guide

## Prerequisites
1. **PostgreSQL Database**: Make sure PostgreSQL is running on localhost:5432
2. **Database Setup**: Create a database named `civiceye`
3. **Environment**: The `.env` file has been created with default settings

## Starting the Servers

### Method 1: Both servers together (Recommended)
```bash
npm run dev
```
This will start:
- Backend server on http://localhost:5000
- Frontend (Vite) server on http://localhost:3000

### Method 2: Start servers separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Accessing the Application

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **Health Check**: http://localhost:5000/api/health

## Troubleshooting

### Database Connection Issues
If you see database connection errors:

1. **Check PostgreSQL is running:**
   ```bash
   # Windows (if installed via installer)
   pg_ctl -D "C:\Program Files\PostgreSQL\15\data" status
   
   # Or check Windows Services for PostgreSQL
   ```

2. **Create database if not exists:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE civiceye;
   \q
   ```

3. **Update .env file** with correct credentials:
   ```
   DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/civiceye
   ```

### Port Conflicts
- Backend (5000): Change PORT in .env if needed
- Frontend (3000): Vite will auto-increment if port busy

### AI Features
- The Gemini API key is optional for testing
- Without it, the AI analysis will use mock data
- Get key from: https://ai.google.dev/

## First Time Setup

1. The backend will automatically create all necessary database tables
2. It will seed initial data (departments, problem categories)
3. You can register a new user account at http://localhost:3000/register

## Testing the Japanese Dashboard

1. Go to http://localhost:3000
2. Register or login as a citizen
3. The dashboard will default to Japanese language
4. You'll see the purple/pink Kizuna theme

## Available Test Accounts
You can create test accounts with different roles:
- **Citizen**: Regular user who reports problems
- **Department**: Official who handles reports
- **Admin**: System administrator

Happy testing! 🎌