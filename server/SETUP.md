# SETU Backend Setup Guide

## Prerequisites

### 1. Install PostgreSQL

#### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (recommended version: PostgreSQL 15 or later)
3. During installation:
   - Set a password for the postgres user (remember this!)
   - Default port: 5432
   - Install pgAdmin 4 (GUI tool)
4. After installation, add PostgreSQL to PATH:
   - Default location: `C:\Program Files\PostgreSQL\15\bin`

#### Verify Installation:
```powershell
psql --version
```

### 2. Create Database

After installing PostgreSQL, create the database:

#### Option 1: Using pgAdmin
1. Open pgAdmin 4
2. Connect to PostgreSQL server (localhost)
3. Right-click "Databases" → Create → Database
4. Name: `setu_db`
5. Click Save

#### Option 2: Using Command Line
```powershell
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE setu_db;

# Exit
\q
```

### 3. Update Environment Variables

Edit `server/.env` file with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=setu_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
```

### 4. Initialize Database Tables

From the server directory, run:

```powershell
cd server
npm run init-db
```

This will create all necessary tables (users, admins, refresh_tokens).

### 5. Create Default Admin User (Optional)

You can create a default admin user by running:

```powershell
node config/createDefaultAdmin.js
```

Or manually using pgAdmin/psql:

```sql
-- Using bcrypt hash for password "admin123"
INSERT INTO admins (name, email, password, is_super_admin) 
VALUES (
  'Super Admin', 
  'admin@setu.com', 
  '$2a$10$XjKW6qKwqX8p3QjF5H4QueN.2bD8vxKX1M8UH2aG9h4qW3xVJ2KFi', 
  true
);
```

## Running the Server

### Development Mode
```powershell
cd server
npm run dev
```

### Production Mode
```powershell
cd server
npm start
```

The server will run on: http://localhost:5000

## API Endpoints

### Authentication (Students & Alumni)

#### Register
- **POST** `/api/auth/register`
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "college": "IIT Bombay",
  "batch_year": 2024,
  "department": "Computer Science"
}
```

#### Login
- **POST** `/api/auth/login`
- Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
- **GET** `/api/auth/profile`
- Headers: `Authorization: Bearer <token>`

#### Update Profile
- **PUT** `/api/auth/profile`
- Headers: `Authorization: Bearer <token>`
- Body: (any profile fields to update)

#### Logout
- **POST** `/api/auth/logout`
- Headers: `Authorization: Bearer <token>`

### Admin Routes

#### Admin Login
- **POST** `/api/admin/login`
- Body:
```json
{
  "email": "admin@setu.com",
  "password": "admin123"
}
```

#### Get All Users
- **GET** `/api/admin/users?role=student&page=1&limit=20`
- Headers: `Authorization: Bearer <admin_token>`

#### Create New Admin
- **POST** `/api/admin/create`
- Headers: `Authorization: Bearer <admin_token>`
- Body:
```json
{
  "name": "New Admin",
  "email": "newadmin@setu.com",
  "password": "password123",
  "is_super_admin": false
}
```

## Testing the API

You can test the API using:
1. **Postman** - Import the collection
2. **Thunder Client** (VS Code extension)
3. **cURL** commands

Example cURL:
```powershell
# Register a student
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test Student\",\"email\":\"student@test.com\",\"password\":\"test123\",\"role\":\"student\",\"college\":\"IIT Bombay\"}'

# Login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"student@test.com\",\"password\":\"test123\"}'
```

## Database Schema

### Users Table (Students & Alumni)
- id (primary key)
- name, email, password
- role (student/alumni)
- college, batch_year, department
- phone, bio, profile_image
- linkedin_url, github_url
- current_company, current_position
- location, skills, interests
- is_verified, is_active
- created_at, updated_at

### Admins Table
- id (primary key)
- name, email, password
- role (admin)
- is_super_admin, is_active
- created_at, updated_at

### Refresh Tokens Table
- id (primary key)
- user_id, admin_id
- token, expires_at
- created_at

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running:
   ```powershell
   # Check if service is running
   Get-Service postgresql*
   ```

2. Test database connection:
   ```powershell
   psql -U postgres -d setu_db
   ```

3. Check firewall settings (port 5432)

### Common Errors

#### "password authentication failed"
- Check DB_PASSWORD in `.env` file
- Verify PostgreSQL user credentials

#### "database does not exist"
- Create the database: `CREATE DATABASE setu_db;`

#### "relation does not exist"
- Run database initialization: `npm run init-db`

## Next Steps

1. Install and configure PostgreSQL
2. Create the database
3. Initialize tables
4. Start the server
5. Test authentication endpoints
6. Integrate with frontend

## Production Deployment

For production:
1. Use strong JWT_SECRET
2. Set NODE_ENV=production
3. Use HTTPS
4. Set up proper database backups
5. Use environment-specific `.env` files
6. Enable database SSL connections
7. Set up monitoring and logging
