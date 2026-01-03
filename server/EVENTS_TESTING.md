# Events Module - Quick Test Guide

## ✅ Verify Setup

### 1. Check Database Tables Exist
```powershell
# Connect to PostgreSQL
psql -U postgres -d setu_db

# List tables
\dt

# Should see: events, event_registrations

# Check events table structure
\d events

# Check registrations table
\d event_registrations

# Exit
\q
```

### 2. Verify Backend Routes

Start the server and visit these URLs in your browser:

**Server Running:**
```
http://localhost:5000
```
Should show API info with `/api/events` endpoint listed.

**Get All Events:**
```
http://localhost:5000/api/events
```
Should return empty events array initially.

### 3. Create Test Event

#### Option A: Using Frontend (Recommended)
1. Login as admin (`admin@setu.com` / `admin123`)
2. Go to Events page
3. Click "ADD EVENT"
4. Fill in:
   - Title: Test Event
   - Date: Tomorrow's date
   - Capacity: 10
   - Description: Testing
5. Submit
6. Event should appear in list

#### Option B: Using API (cURL)

**First, login to get token:**
```powershell
$response = curl -X POST http://localhost:5000/api/admin/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@setu.com\",\"password\":\"admin123\"}' | ConvertFrom-Json

$token = $response.data.token
```

**Then create event:**
```powershell
curl -X POST http://localhost:5000/api/events `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    \"title\":\"Test Event\",
    \"description\":\"This is a test event\",
    \"date\":\"2025-12-31\",
    \"max_capacity\":10,
    \"location\":\"Main Hall\"
  }'
```

### 4. Register Test Student

#### Create Student Account:
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    \"name\":\"Test Student\",
    \"email\":\"teststudent@setu.com\",
    \"password\":\"test123\",
    \"role\":\"student\",
    \"college\":\"IIT Bombay\",
    \"batch_year\":2024,
    \"department\":\"Computer Science\"
  }'
```

#### Login as Student:
```powershell
$studentResponse = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"teststudent@setu.com\",\"password\":\"test123\"}' | ConvertFrom-Json

$studentToken = $studentResponse.data.token
```

#### Register for Event (ID 1):
```powershell
curl -X POST http://localhost:5000/api/events/1/register `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $studentToken" `
  -d '{
    \"name\":\"Test Student\",
    \"department\":\"Computer Science\",
    \"roll_number\":\"CS2024001\",
    \"year\":2
  }'
```

### 5. Verify Registration

**Check event details:**
```powershell
curl http://localhost:5000/api/events/1
```

Should show:
- `current_registrations: 1`
- Registrations array with student details

**Or check in database:**
```sql
SELECT * FROM events WHERE id = 1;
SELECT * FROM event_registrations WHERE event_id = 1;
```

### 6. Test Duplicate Prevention

Try to register same student again:
```powershell
curl -X POST http://localhost:5000/api/events/1/register `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $studentToken" `
  -d '{
    \"name\":\"Test Student\",
    \"department\":\"Computer Science\",
    \"roll_number\":\"CS2024001\",
    \"year\":2
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "message": "You are already registered for this event."
}
```

### 7. Test Capacity Limit

1. Create event with capacity 2
2. Register 2 different students
3. Try to register 3rd student

**Expected:** Error message about event being full

### 8. Frontend Testing Checklist

#### As Admin:
- [ ] Login successful
- [ ] Events page loads
- [ ] "ADD EVENT" button visible
- [ ] Can create event
- [ ] Event appears in list
- [ ] Event details modal works

#### As Student:
- [ ] Login successful
- [ ] Events page loads
- [ ] "ADD EVENT" button NOT visible
- [ ] Can click "Register" button
- [ ] Registration modal appears
- [ ] Can submit registration
- [ ] Success message shows
- [ ] Registration count increases
- [ ] Cannot register twice

## 🔍 Troubleshooting

### "relation does not exist" Error
**Solution:** Run the database initialization
```powershell
cd server
node config/initEventsDatabase.js
```

### "403 Forbidden" When Creating Event
**Cause:** Not logged in as admin or alumni  
**Solution:** 
1. Check you're using correct token
2. Verify user role in database
```sql
SELECT id, email, role FROM users WHERE email = 'your@email.com';
SELECT id, email, role FROM admins WHERE email = 'admin@setu.com';
```

### Registration Not Working
**Checks:**
1. Is user logged in?
2. Is user role = 'student'?
3. Is event in the future?
4. Has capacity not been reached?
5. Is student already registered?

### Event Not Appearing on Frontend
**Checks:**
1. Backend server running?
2. Frontend console for errors?
3. Check Network tab in browser DevTools
4. Verify API response
```powershell
curl http://localhost:5000/api/events
```

## ✅ Success Indicators

You know everything works when:

1. ✅ Events page loads without errors
2. ✅ Can create event as admin
3. ✅ Event appears in list with correct capacity (0/max)
4. ✅ Student can open registration modal
5. ✅ Registration succeeds
6. ✅ Capacity updates (1/max)
7. ✅ Duplicate registration prevented
8. ✅ Full event prevents new registrations
9. ✅ No console errors
10. ✅ Database shows correct data

## 📊 Quick Database Checks

```sql
-- Count events
SELECT COUNT(*) as total_events FROM events;

-- Count registrations
SELECT COUNT(*) as total_registrations FROM event_registrations;

-- Events with capacity info
SELECT 
  title,
  current_registrations || '/' || max_capacity as capacity,
  date
FROM events
ORDER BY date;

-- Most popular events
SELECT 
  e.title,
  COUNT(er.id) as registration_count
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
GROUP BY e.id, e.title
ORDER BY registration_count DESC;
```

## 🎯 Complete Test Sequence

Run these in order for full verification:

1. ✅ Initialize database tables
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Create admin event via UI
5. ✅ Create student account via API
6. ✅ Login as student via UI
7. ✅ Register for event via UI
8. ✅ Verify count updated
9. ✅ Try duplicate registration
10. ✅ Verify error shown

If all steps pass: **🎉 Events module is fully functional!**

---

**Pro Tip:** Use browser DevTools (F12) Network tab to see all API calls and responses.
