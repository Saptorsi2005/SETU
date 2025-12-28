# ✅ SETU Backend - Setup Checklist

Use this checklist to ensure your backend is properly configured and working.

## 📋 Pre-Installation Checklist

- [ ] Node.js installed (v16 or later)
  - Check: `node --version`
- [ ] npm installed
  - Check: `npm --version`
- [ ] PostgreSQL downloaded
  - Get from: https://www.postgresql.org/download/

## 🗄️ Database Setup Checklist

- [ ] PostgreSQL installed successfully
- [ ] PostgreSQL service is running
  - Windows: Check Services → postgresql-x64-15
- [ ] Can access PostgreSQL
  - Test: `psql --version`
- [ ] Database `setu_db` created
  - Via pgAdmin OR command line
- [ ] Know your PostgreSQL password
  - You set this during installation

## 🔧 Backend Configuration Checklist

- [ ] Navigated to server folder
  - `cd c:\Users\DELL\Desktop\SETU\server`
- [ ] Dependencies installed
  - Run: `npm install`
  - Should see ~130 packages installed
- [ ] `.env` file exists
  - Should be in `server/.env`
- [ ] Database password updated in `.env`
  - `DB_PASSWORD=your_actual_password`
- [ ] Database initialized
  - Run: `npm run init-db`
  - Should see: ✅ tables created
- [ ] Default admin created
  - Run: `node config/createDefaultAdmin.js`
  - Should get: admin@setu.com credentials

## 🚀 Server Startup Checklist

- [ ] Backend server starts without errors
  - Run: `npm run dev`
  - Should see: 🚀 SETU Server Running
- [ ] Database connection successful
  - Look for: ✅ Connected to PostgreSQL
- [ ] Server responds to requests
  - Test: Open `http://localhost:5000` in browser
  - Should see JSON response

## 💻 Frontend Setup Checklist

- [ ] Navigated to client folder
  - `cd c:\Users\DELL\Desktop\SETU\client`
- [ ] Axios installed
  - Should be in package.json dependencies
  - If not: `npm install axios`
- [ ] Frontend starts without errors
  - Run: `npm run dev`
  - Should see: ➜ Local: http://localhost:5173/
- [ ] Can access frontend
  - Open: `http://localhost:5173`
  - Should see SETU landing page

## 🧪 API Testing Checklist

### Test Health Endpoint
- [ ] Browser test
  - Go to: `http://localhost:5000`
  - See: `{"success": true, "message": "SETU API Server is running!"}`

### Test User Registration
- [ ] Can register a student
  ```powershell
  curl -X POST http://localhost:5000/api/auth/register `
    -H "Content-Type: application/json" `
    -d '{
      "name": "Test Student",
      "email": "student@test.com",
      "password": "test123",
      "role": "student",
      "college": "IIT Bombay"
    }'
  ```
  - Should get: success response with token

- [ ] Can register an alumni
  ```powershell
  curl -X POST http://localhost:5000/api/auth/register `
    -H "Content-Type: application/json" `
    -d '{
      "name": "Test Alumni",
      "email": "alumni@test.com",
      "password": "test123",
      "role": "alumni",
      "college": "IIT Delhi"
    }'
  ```
  - Should get: success response with token

### Test Login
- [ ] Student can login
  ```powershell
  curl -X POST http://localhost:5000/api/auth/login `
    -H "Content-Type: application/json" `
    -d '{"email": "student@test.com", "password": "test123"}'
  ```
  - Should get: user object and token

- [ ] Admin can login
  ```powershell
  curl -X POST http://localhost:5000/api/admin/login `
    -H "Content-Type: application/json" `
    -d '{"email": "admin@setu.com", "password": "admin123"}'
  ```
  - Should get: admin object and token

## 🖥️ Frontend Integration Checklist

- [ ] Can access login landing page
  - URL: `http://localhost:5173`
  - See: Student/Alumni/Admin login options

- [ ] Student login page works
  - Click "Student Login"
  - Form appears with email and password

- [ ] Alumni login page works
  - Click "Alumni Login"  
  - Form appears with email and password

- [ ] Admin login page works
  - Click "Admin Login"
  - Form appears with email and password

## 🔐 Authentication Flow Checklist

### Student Login Flow
- [ ] Open frontend (`http://localhost:5173`)
- [ ] Click "Student Login"
- [ ] Enter: `student@test.com` / `test123`
- [ ] Click "Login"
- [ ] Should redirect to `/home`
- [ ] No console errors
- [ ] Token stored in localStorage
- [ ] User context updated

### Alumni Login Flow
- [ ] Open frontend (`http://localhost:5173`)
- [ ] Click "Alumni Login"
- [ ] Enter: `alumni@test.com` / `test123`
- [ ] Click "Login"
- [ ] Should redirect to `/home`
- [ ] No console errors
- [ ] Token stored in localStorage
- [ ] User context updated

### Admin Login Flow
- [ ] Open frontend (`http://localhost:5173`)
- [ ] Click "Admin Login"
- [ ] Enter: `admin@setu.com` / `admin123`
- [ ] Click "Login"
- [ ] Should redirect to `/directory`
- [ ] No console errors
- [ ] Token stored in localStorage
- [ ] User context updated

## 🗃️ Database Verification Checklist

- [ ] Can access database via pgAdmin
  - Open pgAdmin 4
  - Connect to PostgreSQL server
  - See `setu_db` database

- [ ] Tables exist
  - [ ] users table
  - [ ] admins table
  - [ ] refresh_tokens table

- [ ] Admin user exists
  ```sql
  SELECT * FROM admins WHERE email = 'admin@setu.com';
  ```
  - Should return 1 row

- [ ] Test users exist (if created)
  ```sql
  SELECT id, name, email, role FROM users;
  ```
  - Should see registered users

## 🛠️ Troubleshooting Checklist

If something doesn't work:

### Backend Issues
- [ ] Check server console for errors
- [ ] Verify PostgreSQL is running
- [ ] Check `.env` file has correct password
- [ ] Verify port 5000 is not in use
- [ ] Run `npm install` again

### Database Issues
- [ ] PostgreSQL service is running
- [ ] Database `setu_db` exists
- [ ] Tables are created (`npm run init-db`)
- [ ] Can connect via pgAdmin

### Frontend Issues
- [ ] Check browser console for errors
- [ ] Verify backend is running on port 5000
- [ ] Check network tab for API calls
- [ ] Clear browser cache and localStorage
- [ ] Run `npm install` again

### Login Issues
- [ ] User account exists in database
- [ ] Correct email and password used
- [ ] Backend returns token
- [ ] Token saved in localStorage
- [ ] Check browser console for errors

## 📊 Success Indicators

You know everything is working when:

✅ **Backend:**
- Server starts without errors
- Shows "Connected to PostgreSQL"
- Responds to http://localhost:5000

✅ **Database:**
- Tables visible in pgAdmin
- Admin user exists
- Can query data

✅ **Frontend:**
- Starts without errors
- Login pages load
- API calls in Network tab

✅ **Integration:**
- Can register users
- Can login successfully
- Redirects after login
- No console errors
- User data persists

## 📝 Files to Check

If you have issues, verify these files exist:

### Backend Files
- [ ] `server/package.json`
- [ ] `server/.env`
- [ ] `server/server.js`
- [ ] `server/config/database.js`
- [ ] `server/controllers/authController.js`
- [ ] `server/routes/authRoutes.js`
- [ ] `server/middleware/auth.js`
- [ ] `server/utils/jwt.js`
- [ ] `server/utils/helpers.js`

### Frontend Files
- [ ] `client/src/services/api.js`
- [ ] `client/src/pages/StudentLogin.jsx`
- [ ] `client/src/pages/AlumniLogin.jsx`
- [ ] `client/src/pages/AdminLogin.jsx`
- [ ] `client/src/context/UserContext.jsx`

## 🎯 Final Validation

Run this complete test:

1. [ ] Both servers running (backend + frontend)
2. [ ] Register a new user via API
3. [ ] Login via frontend UI
4. [ ] Check user object in context
5. [ ] Verify token in localStorage
6. [ ] Navigate to protected routes
7. [ ] Logout works
8. [ ] Admin login works
9. [ ] All existing pages still work

If all checkboxes are ✅, your backend is **fully operational!**

## 📞 Getting Help

If you're stuck on a specific step:

1. Check the error message carefully
2. Look at server logs
3. Check browser console
4. Review the specific documentation:
   - Installation issues → `INSTALLATION.md`
   - API issues → `server/SETUP.md`
   - Quick fixes → `QUICKSTART.md`

---

**Last Updated**: After complete backend implementation
**Status**: Ready for production testing

🎉 **Congratulations!** Once all items are checked, your authentication backend is complete and working!
