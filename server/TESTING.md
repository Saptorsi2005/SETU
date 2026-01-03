# SETU Backend - Testing Without PostgreSQL

If you don't have PostgreSQL installed yet, here's how to verify the backend code is working:

## Quick Test (Without Database)

### 1. Check if the server starts

```powershell
cd server
npm start
```

**Expected behavior:**
- Server will try to start
- You'll see an error: "Database connection failed"
- This is NORMAL if PostgreSQL isn't installed yet
- The error confirms the server code is working

### 2. What the error means

```
❌ Database connection failed: connect ECONNREFUSED 127.0.0.1:5432
```

This means:
- ✅ Node.js is working
- ✅ Server code is valid
- ✅ Express is configured correctly
- ❌ PostgreSQL is not running (needs to be installed)

## To Fix: Install PostgreSQL

Follow these steps:

1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. **Install it** (use password: `postgres` for development)
3. **Create database**: See INSTALLATION.md
4. **Try again**: `npm run dev`

## Alternative: Test with Mock Data

If you want to test the frontend without the backend:

1. Comment out API calls temporarily
2. Use mock data in the frontend
3. Test UI components

But for full authentication, you MUST have PostgreSQL installed.

## Verification Checklist

Before testing, ensure:

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Dependencies installed (`npm install` in server folder)
- [ ] PostgreSQL installed and running
- [ ] Database created (`setu_db`)
- [ ] Tables initialized (`npm run init-db`)
- [ ] Environment variables configured (`.env` file)

## Get Help

If you're stuck:
1. Check INSTALLATION.md for step-by-step setup
2. Check README.md for quick start
3. Check SETUP.md for detailed documentation

The most important step is installing PostgreSQL - without it, the authentication backend cannot work.
