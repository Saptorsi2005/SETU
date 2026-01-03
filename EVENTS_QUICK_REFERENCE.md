# Events Module - Quick Reference Card

## 🚀 Quick Start

### 1. Initialize (One Time Only)
```powershell
cd server
node config/initEventsDatabase.js
```

### 2. Run Servers
```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 3. Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/events

## 📋 User Roles & Permissions

| Action | Admin | Alumni | Student |
|--------|-------|--------|---------|
| View Events | ✅ | ✅ | ✅ |
| Create Event | ✅ | ✅ | ❌ |
| Update Own Event | ✅ | ✅ | ❌ |
| Delete Own Event | ✅ | ✅ | ❌ |
| Register for Event | ❌ | ❌ | ✅ |
| View Registrations | ✅ | ✅ | Own Only |

## 🎯 API Endpoints Cheat Sheet

### Get Events
```
GET /api/events
Query: ?upcoming=true&page=1&limit=20
Auth: Not required
```

### Create Event
```
POST /api/events
Auth: Required (admin/alumni)
Body: {title, description, date, max_capacity, location}
```

### Register for Event
```
POST /api/events/:id/register
Auth: Required (student)
Body: {name, department, roll_number, year}
```

### Get Event Details
```
GET /api/events/:id
Auth: Not required
```

## 🧪 Quick Test Commands

### Create Event (as Admin)
```powershell
# 1. Get token
$r = curl -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d '{\"email\":\"admin@setu.com\",\"password\":\"admin123\"}' | ConvertFrom-Json
$token = $r.data.token

# 2. Create event
curl -X POST http://localhost:5000/api/events `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"title\":\"Test Event\",\"date\":\"2025-12-31\",\"max_capacity\":10}'
```

### Register Student
```powershell
# 1. Register student account
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test\",\"email\":\"test@s.com\",\"password\":\"test123\",\"role\":\"student\",\"college\":\"IIT\"}'

# 2. Login
$s = curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@s.com\",\"password\":\"test123\"}' | ConvertFrom-Json
$stoken = $s.data.token

# 3. Register for event (ID 1)
curl -X POST http://localhost:5000/api/events/1/register `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $stoken" `
  -d '{\"name\":\"Test\",\"department\":\"CS\",\"roll_number\":\"001\",\"year\":2}'
```

## 🗃️ Database Quick Checks

```sql
-- View all events
SELECT id, title, date, current_registrations, max_capacity FROM events;

-- View registrations for event 1
SELECT * FROM event_registrations WHERE event_id = 1;

-- Check capacity status
SELECT 
  title,
  current_registrations || '/' || max_capacity as capacity,
  CASE 
    WHEN current_registrations >= max_capacity THEN 'FULL'
    ELSE 'Available'
  END as status
FROM events;
```

## ⚠️ Common Issues & Solutions

### Issue: "relation does not exist"
**Fix:** `node config/initEventsDatabase.js`

### Issue: 403 Forbidden when creating event
**Fix:** Check you're logged in as admin or alumni

### Issue: Can't register for event
**Checks:**
- Logged in as student? ✅
- Event not full? ✅
- Not already registered? ✅
- Event in future? ✅

### Issue: Event count not updating
**Fix:** Refresh page after registration

## 📊 Success Indicators

✅ Backend starts on port 5000  
✅ Frontend starts on port 5173  
✅ Can create event as admin  
✅ Event appears in list  
✅ Can register as student  
✅ Count updates from 0/10 to 1/10  
✅ Cannot register twice  
✅ Full event blocks registration  

## 🔍 Debug Tips

### Check Server Logs
```powershell
# Look for these messages
✅ Connected to PostgreSQL database
✅ SETU Server Running
🔴 Any error messages
```

### Check Browser Console (F12)
```javascript
// Should see successful API calls
✅ POST /api/events → 201 Created
✅ GET /api/events → 200 OK
✅ POST /api/events/1/register → 201 Created
```

### Verify Database
```sql
-- Should have tables
\dt

-- Should show: events, event_registrations
```

## 📱 Frontend Features

### Admin/Alumni Users See:
- ✅ "ADD EVENT" button
- ✅ Event creation modal
- ✅ All events list
- ✅ Event details

### Student Users See:
- ✅ All events list
- ✅ "Register" button
- ✅ Registration modal
- ✅ Event details
- ❌ "ADD EVENT" button (hidden)

## 💾 Backup Commands

### Backup Events
```sql
COPY events TO 'C:\temp\events_backup.csv' CSV HEADER;
```

### Backup Registrations
```sql
COPY event_registrations TO 'C:\temp\registrations_backup.csv' CSV HEADER;
```

## 🎯 Quick Validation

**5-Minute Test:**
1. Login as admin
2. Create event
3. Logout
4. Register student account
5. Login as student
6. Register for event
7. Verify count increased

**All steps work?** ✅ Everything is working!

---

**Keep this card handy for quick reference!**
