# SETU Project - Complete Installation Guide

This guide will help you set up and run the SETU Alumni Network application with full backend authentication.

## 📋 What You Need

1. **Node.js** (v16+) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v12+) - [Download here](https://www.postgresql.org/download/windows/)
3. **Git** (optional) - For version control

## 🚀 Installation Steps

### Part 1: Install PostgreSQL Database

#### For Windows:

1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the latest version (recommended: PostgreSQL 15)

2. **Run the Installer**
   - Double-click the downloaded file
   - Click "Next" through the welcome screens
   - Choose installation directory (default is fine)
   - Select components (keep all selected)
   - Choose data directory (default is fine)
   - **IMPORTANT**: Set a password for the postgres user
     - Remember this password! You'll need it later
     - Example: `postgres` (for development)
   - Port: Keep default `5432`
   - Locale: Keep default
   - Click "Next" and let it install

3. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Type: `psql --version`
   - If you see a version number, it's installed!
   - If not, add PostgreSQL to your PATH:
     - Go to: `C:\Program Files\PostgreSQL\15\bin`
     - Add this to your system PATH environment variable

### Part 2: Set Up the Database

#### Option A: Using pgAdmin (Easier for Beginners)

1. **Open pgAdmin 4** (installed with PostgreSQL)
2. Click on "Servers" → "PostgreSQL 15"
3. Enter your postgres password when prompted
4. Right-click on "Databases" → "Create" → "Database..."
5. Database name: `setu_db`
6. Click "Save"

#### Option B: Using Command Line

```powershell
# Open PowerShell and connect to PostgreSQL
psql -U postgres

# You'll be prompted for the password you set during installation
# Then run:
CREATE DATABASE setu_db;

# Exit psql
\q
```

### Part 3: Set Up the Backend Server

1. **Navigate to the server folder**
   ```powershell
   cd c:\Users\DELL\Desktop\SETU\server
   ```

2. **Install dependencies** (if not already done)
   ```powershell
   npm install
   ```

3. **Configure environment variables**
   - Open `server/.env` file in a text editor
   - Update the database password:
   ```env
   DB_PASSWORD=your_postgres_password_here
   ```
   Replace `your_postgres_password_here` with the password you set during PostgreSQL installation

4. **Initialize the database tables**
   ```powershell
   npm run init-db
   ```
   
   You should see:
   ```
   ✅ Users table created
   ✅ Admins table created
   ✅ Refresh tokens table created
   ✅ Indexes created
   🎉 Database initialization completed successfully!
   ```

5. **Create a default admin account**
   ```powershell
   node config/createDefaultAdmin.js
   ```
   
   Default credentials:
   - Email: `admin@setu.com`
   - Password: `admin123`

6. **Start the backend server**
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

### Part 4: Set Up the Frontend

1. **Open a NEW terminal/PowerShell window**

2. **Navigate to the client folder**
   ```powershell
   cd c:\Users\DELL\Desktop\SETU\client
   ```

3. **Install dependencies** (if not already done)
   ```powershell
   npm install
   ```

4. **Start the frontend development server**
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

## ✅ Testing the Application

### 1. Test the Backend API

Open your browser and go to: `http://localhost:5000`

You should see a JSON response:
```json
{
  "success": true,
  "message": "SETU API Server is running!",
  "version": "1.0.0"
}
```

### 2. Test the Frontend

Open your browser and go to: `http://localhost:5173`

You should see the SETU landing page with login options.

### 3. Create a Test Student Account

You can create a test account in two ways:

#### Method A: Using API (cURL or Postman)

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

#### Method B: Directly in Database (using pgAdmin)

1. Open pgAdmin
2. Navigate to: Servers → PostgreSQL 15 → Databases → setu_db → Schemas → public → Tables → users
3. Right-click on "users" → "View/Edit Data" → "All Rows"
4. Add a new row manually (password must be hashed)

### 4. Test Login

#### Student Login:
1. Go to `http://localhost:5173`
2. Click "Student Login"
3. Enter:
   - Email: `student@test.com`
   - Password: `test123`
4. Click "Login"
5. You should be redirected to the home page

#### Admin Login:
1. Go to `http://localhost:5173`
2. Click "Admin Login"
3. Enter:
   - Email: `admin@setu.com`
   - Password: `admin123`
4. Click "Login"
5. You should be redirected to the directory page

## 🎯 What's Working Now

✅ **Backend Server**
- Running on `http://localhost:5000`
- PostgreSQL database connected
- JWT authentication configured
- All API endpoints ready

✅ **Database**
- Users table (for students and alumni)
- Admins table
- Proper indexes and constraints

✅ **Authentication System**
- User registration
- User login with JWT tokens
- Password hashing
- Role-based access (student/alumni/admin)

✅ **Frontend Integration**
- Axios configured for API calls
- Login pages connected to backend
- User context management
- Token storage

## 🔧 Common Issues and Solutions

### Issue 1: "Cannot connect to database"

**Solution:**
- Make sure PostgreSQL service is running
- Windows: Check Services → postgresql-x64-15
- Verify password in `.env` file matches your PostgreSQL password

### Issue 2: "Port 5000 already in use"

**Solution:**
- Stop any other applications using port 5000
- Or change the port in `server/.env`: `PORT=5001`

### Issue 3: "npm: command not found"

**Solution:**
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Issue 4: Login doesn't work

**Solution:**
- Make sure backend server is running (check `http://localhost:5000`)
- Check browser console for errors (F12)
- Verify you created a user account first

## 📊 Verifying Database Contents

To see what's in your database:

1. Open pgAdmin
2. Navigate to: Servers → PostgreSQL 15 → Databases → setu_db
3. Click "Query Tool" icon
4. Run:
   ```sql
   -- See all users
   SELECT id, name, email, role, college FROM users;
   
   -- See all admins
   SELECT id, name, email, is_super_admin FROM admins;
   ```

## 📝 API Endpoints Reference

### Public Endpoints (No Authentication Required)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/admin/login` - Admin login

### Protected Endpoints (Requires Token)

- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/create` - Create new admin (admin only)

## 🎨 Testing with Different User Types

### Create Alumni User:

```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test Alumni",
    "email": "alumni@test.com",
    "password": "test123",
    "role": "alumni",
    "college": "IIT Delhi",
    "batch_year": 2020,
    "department": "Electrical Engineering"
  }'
```

Then login with:
- Email: `alumni@test.com`
- Password: `test123`

## 🚀 Next Steps

Now that everything is set up:

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Database configured and initialized
4. ✅ Can register and login users

You can now:
- Test all login flows
- Add more features
- Customize the UI
- Add more API endpoints
- Implement additional features like events, donations, etc.

## 📚 Additional Resources

- **Backend Documentation**: `server/README.md`
- **Detailed Setup**: `server/SETUP.md`
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/

## 💡 Development Tips

1. **Keep both terminals open**: One for backend, one for frontend
2. **Check logs**: Always check server logs for errors
3. **Use Browser DevTools**: F12 to see network requests and errors
4. **Test API first**: Use Postman/cURL before testing in UI
5. **Database changes**: Run `npm run init-db` if you modify database schema

---

**Need Help?** Check the console logs in both frontend and backend for detailed error messages!

Happy coding! 🎉
