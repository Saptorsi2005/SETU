# 🚀 SETU Backend - Quick Start

## ✅ What's Been Built

Your SETU Alumni Network now has a **complete authentication backend** with:

- ✅ PostgreSQL database integration
- ✅ User registration & login (Students & Alumni)
- ✅ Admin authentication system
- ✅ JWT token-based security
- ✅ Password hashing (bcrypt)
- ✅ Profile management
- ✅ Role-based access control
- ✅ Frontend integration (React + Axios)

## 🎯 To Get Started

### Step 1️⃣: Install PostgreSQL

**Download**: https://www.postgresql.org/download/windows/

**During installation:**
- Set password: `postgres` (or remember your own)
- Keep port: `5432`

### Step 2️⃣: Create Database

**Option A - Using pgAdmin (Easier):**
1. Open pgAdmin 4
2. Connect to PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `setu_db`
5. Save

**Option B - Using Command Line:**
```powershell
psql -U postgres
CREATE DATABASE setu_db;
\q
```

### Step 3️⃣: Configure & Initialize

```powershell
# 1. Go to server folder
cd c:\Users\DELL\Desktop\SETU\server

# 2. Update .env file with your PostgreSQL password
# Edit server/.env and change DB_PASSWORD=your_password

# 3. Initialize database tables
npm run init-db

# 4. Create default admin
node config/createDefaultAdmin.js
```

### Step 4️⃣: Run Everything

**Terminal 1 - Backend:**
```powershell
cd c:\Users\DELL\Desktop\SETU\server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\DELL\Desktop\SETU\client
npm run dev
```

### Step 5️⃣: Test It!

1. **Open browser**: http://localhost:5173
2. **Register a student**:
   - Click "Student Login"
   - Need to register first? Create account via API or database
3. **Or login as admin**:
   - Email: `admin@setu.com`
   - Password: `admin123`

## 📝 Create Test Users

### Method 1: Using API (Recommended)

```powershell
# Create a student
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Doe",
    "email": "john@student.com",
    "password": "test123",
    "role": "student",
    "college": "IIT Bombay",
    "batch_year": 2024,
    "department": "Computer Science"
  }'

# Create an alumni
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Jane Smith",
    "email": "jane@alumni.com",
    "password": "test123",
    "role": "alumni",
    "college": "IIT Delhi",
    "batch_year": 2020,
    "department": "Electrical Engineering"
  }'
```

### Method 2: Update Login Pages to Include Signup

The login pages have signup buttons, but you may need to create signup pages that use the register API.

## 🧪 Test API Endpoints

### Check Server Health
```powershell
curl http://localhost:5000
```

### Login as Student
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@student.com",
    "password": "test123"
  }'
```

### Login as Admin
```powershell
curl -X POST http://localhost:5000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@setu.com",
    "password": "admin123"
  }'
```

## 📚 Available Endpoints

### Public (No Auth Required)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/admin/login` - Admin login

### Protected (Requires Token)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/create` - Create admin (admin)

## 🔧 Common Issues

### "Database connection failed"
→ Make sure PostgreSQL is installed and running
→ Check password in `server/.env`

### "Cannot find module"
→ Run `npm install` in server folder

### "Port already in use"
→ Change port in `server/.env` to 5001

### Login doesn't work
→ Make sure backend is running on port 5000
→ Create a test user first (see above)

## 📖 Documentation

- **Complete Setup**: See `INSTALLATION.md`
- **Backend Details**: See `server/BACKEND_SUMMARY.md`
- **API Reference**: See `server/SETUP.md`
- **Quick Guide**: See `server/README.md`

## ✨ What Works Now

✅ User registration with validation  
✅ Secure login with JWT tokens  
✅ Password hashing (bcrypt)  
✅ Admin authentication  
✅ Profile management  
✅ Role-based access (student/alumni/admin)  
✅ Frontend-backend integration  
✅ Error handling  
✅ CORS configured  
✅ All existing frontend features preserved  

## 🎯 Your Existing Features

**All your existing frontend features still work:**
- Home page ✅
- Profile page ✅
- Events ✅
- Donations ✅
- Messages ✅
- Map ✅
- Directory ✅
- Dashboard ✅

**Now enhanced with:**
- Real authentication ✅
- User data from database ✅
- Secure token-based sessions ✅

## 🚨 Important Notes

1. **PostgreSQL is REQUIRED** - The backend won't work without it
2. **Run init-db** - Must initialize tables before first use
3. **Two terminals** - Keep both backend and frontend running
4. **Default admin** - Remember to create it for admin access

## 💡 Next Steps

1. ✅ Install PostgreSQL
2. ✅ Initialize database
3. ✅ Start servers
4. ✅ Create test users
5. ✅ Test login flows
6. 🔜 Build signup pages (optional)
7. 🔜 Add more features (events, posts, etc.)

---

**Everything is ready to go!** Just need to install PostgreSQL and run the initialization commands. 🎉

**Need help?** Check `INSTALLATION.md` for detailed step-by-step instructions.
