# Events Module - Complete Implementation

## 🎯 Overview

Complete Events management system for SETU Alumni Network with role-based access control, event registration, and capacity management.

## ✅ Features Implemented

### 1. **Database Schema**

#### Events Table
```sql
- id (Primary Key)
- title (VARCHAR 255) - Event name
- description (TEXT) - Event details
- date (DATE) - Event date
- image_url (VARCHAR 500) - Event image path
- organizer_user_id (FK to users) - For alumni organizers
- organizer_admin_id (FK to admins) - For admin organizers
- max_capacity (INTEGER) - Maximum attendees
- current_registrations (INTEGER) - Current registrations count
- location (VARCHAR 255) - Event location
- created_at, updated_at (TIMESTAMP)
```

#### Event Registrations Table
```sql
- id (Primary Key)
- event_id (FK to events)
- student_id (FK to users)
- name (VARCHAR 255) - Student name
- department (VARCHAR 255) - Student department
- roll_number (VARCHAR 100) - Student roll number
- year (INTEGER) - Academic year
- registered_at (TIMESTAMP)
- UNIQUE constraint on (event_id, student_id)
```

### 2. **Role-Based Access Control**

#### Admin
✅ Can create events  
✅ Can update their own events  
✅ Can delete their own events  
✅ Can view all events  
❌ Cannot register for events  

#### Alumni
✅ Can create events  
✅ Can update their own events  
✅ Can delete their own events  
✅ Can view all events  
❌ Cannot register for events  

#### Students
✅ Can view all events  
✅ Can register for events  
✅ Can view their registrations  
❌ Cannot create events  
❌ Cannot update events  
❌ Cannot delete events  

### 3. **API Endpoints**

#### GET /api/events
- **Access**: Public
- **Description**: Get all events
- **Query Params**:
  - `upcoming=true` - Only future events
  - `past=true` - Only past events
  - `page=1` - Page number
  - `limit=50` - Items per page
- **Response**:
```json
{
  "success": true,
  "data": {
    "events": [...],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

#### POST /api/events
- **Access**: Admin and Alumni only
- **Description**: Create a new event
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "Tech Symposium 2025",
  "description": "Annual tech event",
  "date": "2025-12-20",
  "max_capacity": 200,
  "location": "Main Auditorium",
  "image_url": "/events/tech-symposium.jpg"
}
```

#### GET /api/events/:id
- **Access**: Public
- **Description**: Get event details with registrations
- **Response**:
```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "title": "Tech Symposium",
      "organizer_name": "John Doe",
      "organizer_role": "admin",
      "registrations": [...]
    }
  }
}
```

#### POST /api/events/:id/register
- **Access**: Students only
- **Description**: Register for an event
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Jane Smith",
  "department": "Computer Science",
  "roll_number": "CS2024001",
  "year": 2
}
```

#### PUT /api/events/:id
- **Access**: Event organizer only
- **Description**: Update event details
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Any event fields to update

#### DELETE /api/events/:id
- **Access**: Event organizer only
- **Description**: Delete an event
- **Headers**: `Authorization: Bearer <token>`

#### GET /api/events/my/registrations
- **Access**: Students only
- **Description**: Get all registrations for logged-in student
- **Headers**: `Authorization: Bearer <token>`

### 4. **Business Logic**

#### Event Creation
✅ Only admin and alumni can create  
✅ Date must be in the future  
✅ Capacity must be positive  
✅ Stores organizer reference  

#### Event Registration
✅ Only students can register  
✅ No duplicate registrations  
✅ Capacity enforcement (atomic)  
✅ Cannot register for past events  
✅ Uses database transactions  
✅ Auto-updates registration count  

#### Capacity Management
✅ Atomic increment on registration  
✅ Prevents over-booking  
✅ Cannot reduce capacity below current registrations  
✅ Real-time count updates  

### 5. **Frontend Integration**

#### Events.jsx Updates
✅ Fetches events from backend on mount  
✅ Displays loading and error states  
✅ Shows "Add Event" button only for admin/alumni  
✅ Registration modal for students  
✅ Real-time capacity updates  
✅ All existing UI preserved  
✅ Event details modal unchanged  
✅ Calendar functionality preserved  

#### New Features Added
- Student registration form modal
- API integration for CRUD operations
- Error handling and user feedback
- Conditional button rendering based on user role
- Auto-refresh after registration

### 6. **Security Features**

✅ JWT authentication required  
✅ Role-based middleware  
✅ Owner-only updates/deletes  
✅ Input validation  
✅ SQL injection prevention  
✅ Transaction-based registration  
✅ Duplicate prevention (DB constraint)  
✅ Capacity overflow prevention  

## 📁 Files Created/Modified

### Backend
- ✅ `server/config/initEventsDatabase.js` - Database schema
- ✅ `server/controllers/eventController.js` - Business logic
- ✅ `server/routes/eventRoutes.js` - API routes
- ✅ `server/server.js` - Added event routes

### Frontend
- ✅ `client/src/services/api.js` - Added eventsAPI
- ✅ `client/src/pages/Events.jsx` - Backend integration

## 🚀 Setup Instructions

### 1. Initialize Database
```powershell
cd server
node config/initEventsDatabase.js
```

### 2. Start Backend
```powershell
cd server
npm run dev
```

### 3. Start Frontend
```powershell
cd client
npm run dev
```

## 🧪 Testing Guide

### Test 1: Create Event as Admin
```powershell
curl -X POST http://localhost:5000/api/events `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <admin_token>" `
  -d '{
    "title": "Tech Symposium 2025",
    "description": "Annual technology event",
    "date": "2025-12-20",
    "max_capacity": 150,
    "location": "Main Auditorium"
  }'
```

### Test 2: Create Event as Alumni
```powershell
curl -X POST http://localhost:5000/api/events `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <alumni_token>" `
  -d '{
    "title": "Alumni Meetup",
    "description": "Networking event",
    "date": "2025-11-15",
    "max_capacity": 100
  }'
```

### Test 3: Try to Create Event as Student (Should Fail)
```powershell
curl -X POST http://localhost:5000/api/events `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <student_token>" `
  -d '{
    "title": "Student Event",
    "date": "2025-12-01",
    "max_capacity": 50
  }'
```

Expected: `403 Forbidden - Only admins and alumni can create events`

### Test 4: Get All Events
```powershell
curl http://localhost:5000/api/events?upcoming=true
```

### Test 5: Register as Student
```powershell
curl -X POST http://localhost:5000/api/events/1/register `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <student_token>" `
  -d '{
    "name": "Jane Doe",
    "department": "Computer Science",
    "roll_number": "CS2024001",
    "year": 2
  }'
```

### Test 6: Try Duplicate Registration (Should Fail)
```powershell
# Same request as Test 5
```

Expected: `400 Bad Request - You are already registered for this event`

### Test 7: Try to Exceed Capacity
1. Create event with capacity 2
2. Register 2 students
3. Try to register a 3rd student

Expected: `400 Bad Request - Event is full. Registration capacity reached`

## 📊 Database Verification

### View All Events
```sql
SELECT 
  e.id,
  e.title,
  e.date,
  e.current_registrations,
  e.max_capacity,
  CASE 
    WHEN e.organizer_user_id IS NOT NULL THEN u.name
    WHEN e.organizer_admin_id IS NOT NULL THEN a.name
  END as organizer
FROM events e
LEFT JOIN users u ON e.organizer_user_id = u.id
LEFT JOIN admins a ON e.organizer_admin_id = a.id
ORDER BY e.date;
```

### View All Registrations
```sql
SELECT 
  er.id,
  e.title as event_name,
  er.name as student_name,
  er.department,
  er.roll_number,
  er.registered_at
FROM event_registrations er
JOIN events e ON er.event_id = e.id
ORDER BY er.registered_at DESC;
```

### Check Event Capacity
```sql
SELECT 
  e.title,
  e.current_registrations,
  e.max_capacity,
  (e.max_capacity - e.current_registrations) as available_seats
FROM events e;
```

## 🎨 Frontend Testing

### Test as Admin/Alumni:
1. Login as admin or alumni
2. Go to Events page
3. Click "ADD EVENT" button (should be visible)
4. Fill in event details
5. Submit
6. Verify event appears in list

### Test as Student:
1. Login as student
2. Go to Events page
3. "ADD EVENT" button should NOT be visible
4. Click "Register" on any event
5. Fill in registration form:
   - Name
   - Department
   - Roll Number
   - Year
6. Submit
7. Should show success message
8. Registration count should increase

### Test Duplicate Prevention:
1. Try to register for same event again
2. Should show error message

### Test Capacity Limit:
1. Create event with max_capacity = 2
2. Register 2 students
3. Try to register 3rd student
4. Should show "Event is full" error

## ⚠️ Important Notes

1. **Database Transactions**: Registration uses transactions to prevent race conditions
2. **Unique Constraint**: Database prevents duplicate registrations
3. **Atomic Updates**: Registration count updates atomically
4. **Role Checks**: Enforced at both middleware and controller levels
5. **Date Validation**: Events must be in the future
6. **Capacity Validation**: Cannot reduce below current registrations

## 🔒 Security Considerations

- ✅ All write operations require authentication
- ✅ Role-based access control enforced
- ✅ Owner-only update/delete checks
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation on all fields
- ✅ Transaction isolation for registrations

## 📈 Performance Features

- ✅ Database indexes on foreign keys
- ✅ Index on event date for filtering
- ✅ Pagination support
- ✅ Efficient JOIN queries
- ✅ Optimistic locking for registrations

## 🎯 Success Metrics

✅ **All requirements met**:
- Role-based event creation (admin/alumni)
- Student registration with form
- Capacity enforcement
- Duplicate prevention
- All existing UI preserved
- Full CRUD operations
- Transaction safety

## 🚀 Next Steps

Optional enhancements:
- [ ] Event categories/tags
- [ ] Event search functionality
- [ ] Email notifications
- [ ] Event reminders
- [ ] Attendance tracking
- [ ] Event feedback/ratings
- [ ] Image upload for events
- [ ] Export attendee list
- [ ] Calendar integration
- [ ] Event cancellation with refunds

---

**Status**: ✅ **Fully Implemented and Ready for Use!**

**No Breaking Changes**: All existing frontend features preserved exactly as they were.
