# SETU Backend - Quick Start Guide

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js** (v16 or later) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or later) - [Download](https://www.postgresql.org/download/)

## 🚀 Quick Setup (5 Steps)

### Step 1: Install PostgreSQL

**Windows:**
1. Download and run the PostgreSQL installer
2. During installation, set a password for the `postgres` user (remember this!)
3. Keep default port: `5432`
4. Complete the installation

### Step 2: Create Database

Open **pgAdmin** (installed with PostgreSQL) or use command line:

```sql
-- Create a new database named 'setu_db'
CREATE DATABASE setu_db;
```

### Step 3: Configure Environment

Edit the `.env` file in the `server` folder:

```env
DB_PASSWORD=your_postgres_password  # Change this to your PostgreSQL password
```

You can keep other settings as they are for development.

### Step 4: Initialize Database Tables

Open a terminal in the `server` folder and run:

```powershell
npm run init-db
```

This creates all necessary tables (users, admins, etc.).

### Step 5: Create Default Admin (Optional)

```powershell
node config/createDefaultAdmin.js
```

**Default admin credentials:**
- Email: `admin@setu.com`
- Password: `admin123`

## ▶️ Running the Server

Start the backend server:

```powershell
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   🚀 SETU Server Running               ║
║   📡 Port: 5000                        ║
║   🌍 Environment: development          ║
║   🔗 URL: http://localhost:5000        ║
╚════════════════════════════════════════╝
```

## 🧪 Testing the API

### Test Server Health

Open your browser and go to: `http://localhost:5000`

You should see a JSON response confirming the server is running.

### Test Registration (Student)

Use Postman, Thunder Client, or cURL:

```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "test123",
    "role": "student",
    "college": "IIT Bombay",
    "batch_year": 2024,
    "department": "Computer Science"
  }'
```

### Test Login (Student)

```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "student@test.com",
    "password": "test123"
  }'
```

Save the `token` from the response - you'll need it for authenticated requests!

### Test Admin Login

```powershell
curl -X POST http://localhost:5000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@setu.com",
    "password": "admin123"
  }'
```

## 📚 Available API Endpoints

### Authentication (Students & Alumni)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile (requires token)
- `PUT /api/auth/profile` - Update user profile (requires token)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile (requires token)
- `GET /api/admin/users` - Get all users (requires admin token)
- `POST /api/admin/create` - Create new admin (requires admin token)

## 🔧 Troubleshooting

### "Database connection failed"
- Make sure PostgreSQL is running
- Check if your password in `.env` matches your PostgreSQL password
- Verify the database `setu_db` exists

### "Port 5000 is already in use"
- Change `PORT=5000` in `.env` to another port like `PORT=5001`

### "Cannot find module"
- Run `npm install` in the server folder

## 📝 What's Included

✅ User authentication (JWT-based)  
✅ Password hashing (bcrypt)  
✅ Role-based access (student/alumni/admin)  
✅ PostgreSQL database with proper schema  
✅ RESTful API endpoints  
✅ Error handling middleware  
✅ CORS enabled for frontend integration  
✅ Input validation  

## 🔐 Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- HTTP-only cookies support
- Role-based access control
- Input validation and sanitization

## 📂 Project Structure

```
server/
├── config/           # Database configuration
├── controllers/      # Request handlers
├── middleware/       # Auth, error handling
├── routes/          # API routes
├── utils/           # Helper functions
├── .env             # Environment variables
├── server.js        # Main server file
└── package.json     # Dependencies
```

## 🎯 Next Steps

1. ✅ Backend is running
2. Start the frontend (`cd ../client && npm run dev`)
3. Try logging in from the UI
4. Register new users
5. Test all features

## 📞 Need Help?

If you encounter issues:
1. Check SETUP.md for detailed documentation
2. Verify all prerequisites are installed
3. Check server logs for error messages
4. Ensure PostgreSQL is running

Happy coding! 🚀
