# Quick SQLite Setup (Alternative)

If you're having PostgreSQL connection issues, here's a quick SQLite alternative:

## Option 1: Fix PostgreSQL (Recommended)
1. Open your PostgreSQL installation
2. Find your actual password (often set during installation)
3. Update the .env file:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/civiceye
   ```

## Option 2: Reset PostgreSQL Password
```bash
# Windows - Open as Administrator
psql -U postgres
\password postgres
# Enter new password
```

## Option 3: Use Docker PostgreSQL
```bash
docker run --name kizuna-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=civiceye -p 5432:5432 -d postgres:15
```

## Current Status
- ✅ Frontend: http://localhost:3000 (RUNNING)
- ❌ Backend: Failed (Database connection)
- ⚠️ AI Features: Will use mock data (no Gemini key)

## Next Steps
1. Fix database connection using one of the options above
2. Restart the servers: Stop current process and run `npm run dev` again
3. Visit http://localhost:3000 to see the Japanese Kizuna dashboard!