import pool from '../config/database.js';

// Create a new event (admin or alumni only)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, image_url, max_capacity, location } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate required fields
    if (!title || !date || !max_capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, date, and max_capacity.',
      });
    }

    // Validate max_capacity is a positive number
    if (max_capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Max capacity must be greater than 0.',
      });
    }

    // Validate date is in the future
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future.',
      });
    }

    // Determine organizer field based on role
    let query, values;
    
    if (userRole === 'admin') {
      query = `
        INSERT INTO events (title, description, date, image_url, organizer_admin_id, max_capacity, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      values = [title, description || null, date, image_url || null, userId, max_capacity, location || null];
    } else if (userRole === 'alumni') {
      query = `
        INSERT INTO events (title, description, date, image_url, organizer_user_id, max_capacity, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      values = [title, description || null, date, image_url || null, userId, max_capacity, location || null];
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only admins and alumni can create events.',
      });
    }

    const result = await pool.query(query, values);
    const event = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: {
        event,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all events
export const getAllEvents = async (req, res, next) => {
  try {
    const { upcoming, past, limit = 50, page = 1 } = req.query;
    
    let query = `
      SELECT 
        e.*,
        CASE 
          WHEN e.organizer_user_id IS NOT NULL THEN u.name
          WHEN e.organizer_admin_id IS NOT NULL THEN a.name
        END as organizer_name,
        CASE 
          WHEN e.organizer_user_id IS NOT NULL THEN 'alumni'
          WHEN e.organizer_admin_id IS NOT NULL THEN 'admin'
        END as organizer_role
      FROM events e
      LEFT JOIN users u ON e.organizer_user_id = u.id
      LEFT JOIN admins a ON e.organizer_admin_id = a.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    // Filter by upcoming or past
    const today = new Date().toISOString().split('T')[0];
    if (upcoming === 'true') {
      query += ` AND e.date >= $${paramCount++}`;
      values.push(today);
    } else if (past === 'true') {
      query += ` AND e.date < $${paramCount++}`;
      values.push(today);
    }

    query += ' ORDER BY e.date ASC';

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM events WHERE 1=1';
    const countValues = [];
    if (upcoming === 'true') {
      countQuery += ' AND date >= $1';
      countValues.push(today);
    } else if (past === 'true') {
      countQuery += ' AND date < $1';
      countValues.push(today);
    }
    
    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        events: result.rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get event by ID
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        e.*,
        CASE 
          WHEN e.organizer_user_id IS NOT NULL THEN u.name
          WHEN e.organizer_admin_id IS NOT NULL THEN a.name
        END as organizer_name,
        CASE 
          WHEN e.organizer_user_id IS NOT NULL THEN u.email
          WHEN e.organizer_admin_id IS NOT NULL THEN a.email
        END as organizer_email,
        CASE 
          WHEN e.organizer_user_id IS NOT NULL THEN 'alumni'
          WHEN e.organizer_admin_id IS NOT NULL THEN 'admin'
        END as organizer_role
      FROM events e
      LEFT JOIN users u ON e.organizer_user_id = u.id
      LEFT JOIN admins a ON e.organizer_admin_id = a.id
      WHERE e.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Get registrations count and list
    const registrationsResult = await pool.query(
      `SELECT 
        er.*,
        u.email as student_email
      FROM event_registrations er
      JOIN users u ON er.student_id = u.id
      WHERE er.event_id = $1
      ORDER BY er.registered_at DESC`,
      [id]
    );

    const event = result.rows[0];
    event.registrations = registrationsResult.rows;

    res.status(200).json({
      success: true,
      data: {
        event,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register for an event (students only)
export const registerForEvent = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { name, department, roll_number, year } = req.body;
    const studentId = req.user.id;
    const userRole = req.user.role;

    // Only students can register
    if (userRole !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can register for events.',
      });
    }

    // Validate required fields
    if (!name || !department || !roll_number || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, department, roll_number, and year.',
      });
    }

    // Start transaction
    await client.query('BEGIN');

    // Get event and lock row for update
    const eventResult = await client.query(
      'SELECT * FROM events WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const event = eventResult.rows[0];

    // Check if event date has passed
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events.',
      });
    }

    // Check if already registered
    const existingRegistration = await client.query(
      'SELECT * FROM event_registrations WHERE event_id = $1 AND student_id = $2',
      [id, studentId]
    );

    if (existingRegistration.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }

    // Check capacity
    if (event.current_registrations >= event.max_capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Event is full. Registration capacity reached.',
      });
    }

    // Create registration
    const registrationResult = await client.query(
      `INSERT INTO event_registrations (event_id, student_id, name, department, roll_number, year)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, studentId, name, department, roll_number, year]
    );

    // Update event current_registrations
    await client.query(
      'UPDATE events SET current_registrations = current_registrations + 1 WHERE id = $1',
      [id]
    );

    // Commit transaction
    await client.query('COMMIT');

    const registration = registrationResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event!',
      data: {
        registration,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    
    // Handle duplicate registration error
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }
    
    next(error);
  } finally {
    client.release();
  }
};

// Get user's event registrations
export const getMyRegistrations = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `SELECT 
        er.*,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location,
        e.max_capacity,
        e.current_registrations
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.student_id = $1
      ORDER BY er.registered_at DESC`,
      [studentId]
    );

    res.status(200).json({
      success: true,
      data: {
        registrations: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update event (organizer only)
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, image_url, max_capacity, location } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get event to check ownership
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const event = eventResult.rows[0];

    // Check if user is the organizer
    const isOrganizer = 
      (userRole === 'admin' && event.organizer_admin_id === userId) ||
      (userRole === 'alumni' && event.organizer_user_id === userId);

    if (!isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'You can only update events you created.',
      });
    }

    // Cannot reduce capacity below current registrations
    if (max_capacity && max_capacity < event.current_registrations) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below current registrations (${event.current_registrations}).`,
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (date) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    if (max_capacity) {
      updates.push(`max_capacity = $${paramCount++}`);
      values.push(max_capacity);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (values.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.',
      });
    }

    values.push(id);

    const query = `
      UPDATE events 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: {
        event: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete event (organizer only)
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get event to check ownership
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const event = eventResult.rows[0];

    // Check if user is the organizer
    const isOrganizer = 
      (userRole === 'admin' && event.organizer_admin_id === userId) ||
      (userRole === 'alumni' && event.organizer_user_id === userId);

    if (!isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete events you created.',
      });
    }

    await pool.query('DELETE FROM events WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};
