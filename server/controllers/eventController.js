import pool from '../config/database.js';

/* =========================
   CREATE EVENT
   ========================= */
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, image_url, max_capacity, location } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!title || !date || !max_capacity) {
      return res.status(400).json({ success: false, message: 'Please provide title, date, and max_capacity.' });
    }

    if (max_capacity <= 0) {
      return res.status(400).json({ success: false, message: 'Max capacity must be greater than 0.' });
    }

    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (eventDate < today) {
      return res.status(400).json({ success: false, message: 'Event date must be in the future.' });
    }

    let query, values;

    if (userRole === 'admin') {
      query = `
        INSERT INTO events (title, description, date, image_url, organizer_admin_id, max_capacity, location)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `;
      values = [title, description || null, date, image_url || null, userId, max_capacity, location || null];
    }

    else if (userRole === 'alumni') {
      query = `
        INSERT INTO events (title, description, date, image_url, organizer_user_id, max_capacity, location)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `;
      values = [title, description || null, date, image_url || null, userId, max_capacity, location || null];
    }

    else {
      return res.status(403).json({ success: false, message: 'Only admins or alumni can create events.' });
    }

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: { event: result.rows[0] }
    });

  } catch (err) { next(err); }
};



/* =========================
   GET ALL EVENTS
   ========================= */
export const getAllEvents = async (req, res, next) => {
  try {
    const { upcoming, past, limit = 50, page = 1 } = req.query;

    let query = `
      SELECT e.*,
      CASE WHEN e.organizer_user_id IS NOT NULL THEN u.name
           WHEN e.organizer_admin_id IS NOT NULL THEN a.name
      END AS organizer_name,
      CASE WHEN e.organizer_user_id IS NOT NULL THEN 'alumni'
           WHEN e.organizer_admin_id IS NOT NULL THEN 'admin'
      END AS organizer_role
      FROM events e
      LEFT JOIN users u ON e.organizer_user_id = u.id
      LEFT JOIN admins a ON e.organizer_admin_id = a.id
      WHERE 1=1
    `;

    const values = [];
    let p = 1;
    const today = new Date().toISOString().split('T')[0];

    if (upcoming === 'true') {
      query += ` AND e.date >= $${p++}`; values.push(today);
    }
    else if (past === 'true') {
      query += ` AND e.date < $${p++}`; values.push(today);
    }

    query += ` ORDER BY e.date ASC LIMIT $${p++} OFFSET $${p++}`;
    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    const total = await pool.query(`SELECT COUNT(*) FROM events`);

    res.status(200).json({
      success: true,
      data: {
        events: result.rows,
        pagination: {
          total: parseInt(total.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });

  } catch (err) { next(err); }
};



/* =========================
   GET EVENT BY ID
   ========================= */
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*,
      CASE WHEN e.organizer_user_id IS NOT NULL THEN u.name
           WHEN e.organizer_admin_id IS NOT NULL THEN a.name
      END AS organizer_name,
      CASE WHEN e.organizer_user_id IS NOT NULL THEN 'alumni'
           WHEN e.organizer_admin_id IS NOT NULL THEN 'admin'
      END AS organizer_role
      FROM events e
      LEFT JOIN users u ON e.organizer_user_id = u.id
      LEFT JOIN admins a ON e.organizer_admin_id = a.id
      WHERE e.id=$1`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ success:false, message:'Event not found' });

    const registrations = await pool.query(
      `SELECT er.*, u.email AS student_email
       FROM event_registrations er
       JOIN users u ON er.student_id = u.id
       WHERE er.event_id=$1`,
      [id]
    );

    const event = result.rows[0];
    event.registrations = registrations.rows;

    res.status(200).json({ success:true, data:{ event } });

  } catch (err) { next(err); }
};



/* =========================
   REGISTER FOR EVENT
   RULES:
   - Admin event → Students + Alumni can register
   - Alumni event → Students only
   ========================= */
export const registerForEvent = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, department, roll_number, year } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!name || !department || !roll_number || !year)
      return res.status(400).json({ success:false, message:'All fields are required' });

    await client.query('BEGIN');

    const eventResult = await client.query(`SELECT * FROM events WHERE id=$1 FOR UPDATE`, [id]);

    if (!eventResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success:false, message:'Event not found' });
    }

    const event = eventResult.rows[0];

    // ⚖ RULE CHECK
    if (event.organizer_admin_id) {
      if (userRole !== 'student' && userRole !== 'alumni') {
        await client.query('ROLLBACK');
        return res.status(403).json({ success:false, message:'Only students & alumni can register for admin events' });
      }
    }

    if (event.organizer_user_id) {
      if (userRole !== 'student') {
        await client.query('ROLLBACK');
        return res.status(403).json({ success:false, message:'Only students can register for alumni events' });
      }
    }

    // Prevent duplicate
    const exists = await client.query(
      `SELECT 1 FROM event_registrations WHERE event_id=$1 AND student_id=$2`,
      [id, userId]
    );
    if (exists.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success:false, message:'Already registered' });
    }

    // Capacity check
    if (event.current_registrations >= event.max_capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success:false, message:'Event is full' });
    }

    await client.query(
      `INSERT INTO event_registrations (event_id, student_id, name, department, roll_number, year)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, userId, name, department, roll_number, year]
    );

    await client.query(
      `UPDATE events SET current_registrations = current_registrations + 1 WHERE id=$1`,
      [id]
    );

    await client.query('COMMIT');

    res.status(201).json({ success:true, message:'Registered successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// Get logged-in student's event registrations
export const getMyRegistrations = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const result = await pool.query(
      `SELECT 
        er.*,
        e.title AS event_title,
        e.date AS event_date,
        e.location AS event_location,
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



/* =========================
   UPDATE EVENT
   ========================= */
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, image_url, max_capacity, location } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const eventRes = await pool.query(`SELECT * FROM events WHERE id=$1`, [id]);
    if (!eventRes.rows.length)
      return res.status(404).json({ success:false, message:'Event not found' });

    const event = eventRes.rows[0];

    const isOrganizer =
      (userRole === 'admin' && event.organizer_admin_id === userId) ||
      (userRole === 'alumni' && event.organizer_user_id === userId);

    if (!isOrganizer)
      return res.status(403).json({ success:false, message:'Only the creator can update this event' });

    if (max_capacity && max_capacity < event.current_registrations)
      return res.status(400).json({ success:false, message:'Capacity cannot be less than current registrations' });

    const updates = [];
    const values = [];
    let i = 1;

    if (title) updates.push(`title=$${i++}`), values.push(title);
    if (description !== undefined) updates.push(`description=$${i++}`), values.push(description);
    if (date) updates.push(`date=$${i++}`), values.push(date);
    if (image_url !== undefined) updates.push(`image_url=$${i++}`), values.push(image_url);
    if (max_capacity) updates.push(`max_capacity=$${i++}`), values.push(max_capacity);
    if (location !== undefined) updates.push(`location=$${i++}`), values.push(location);

    updates.push(`updated_at=CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE events SET ${updates.join(', ')} WHERE id=$${i} RETURNING *`;

    const result = await pool.query(query, values);

    res.status(200).json({ success:true, data:{ event: result.rows[0] } });

  } catch (err) { next(err); }
};



/* =========================
   DELETE EVENT
   ========================= */
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const eventRes = await pool.query(`SELECT * FROM events WHERE id=$1`, [id]);
    if (!eventRes.rows.length)
      return res.status(404).json({ success:false, message:'Event not found' });

    const event = eventRes.rows[0];

    const isOrganizer =
      (userRole === 'admin' && event.organizer_admin_id === userId) ||
      (userRole === 'alumni' && event.organizer_user_id === userId);

    if (!isOrganizer)
      return res.status(403).json({ success:false, message:'Only the creator can delete this event' });

    await pool.query(`DELETE FROM events WHERE id=$1`, [id]);

    res.status(200).json({ success:true, message:'Event deleted successfully' });

  } catch (err) { next(err); }
};
