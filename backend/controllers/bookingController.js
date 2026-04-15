import db from "../config/db.js";

// ✅ CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { event_id, name, email, date, time, custom_answer = null } = req.body;

    // check if slot already booked
    const check = await db.query(
      "SELECT * FROM bookings WHERE event_id=$1 AND date=$2 AND time=$3",
      [event_id, date, time]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // insert booking
    const result = await db.query(
      `
      INSERT INTO bookings (event_id, name, email, date, time, custom_answer)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [event_id, name, email, date, time, custom_answer]
    );

    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ GET ALL BOOKINGS
export const getBookings = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        bookings.*,
        events.title AS event_title,
        events.slug AS event_slug,
        events.duration AS event_duration
      FROM bookings
      LEFT JOIN events ON events.id = bookings.event_id
      ORDER BY bookings.date ASC, bookings.time ASC
    `);

    res.json(result.rows); // 🔥 IMPORTANT
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ UPDATE BOOKING (RESCHEDULE)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    const existing = await db.query(
      "SELECT event_id FROM bookings WHERE id=$1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { event_id } = existing.rows[0];

    const conflict = await db.query(
      "SELECT * FROM bookings WHERE event_id=$1 AND date=$2 AND time=$3 AND id != $4",
      [event_id, date, time, id]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    await db.query(
      "UPDATE bookings SET date=$1, time=$2 WHERE id=$3",
      [date, time, id]
    );

    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ DELETE BOOKING
export const deleteBooking = async (req, res) => {
  try {
    await db.query("DELETE FROM bookings WHERE id=$1", [req.params.id]);
    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(500).json(err);
  }
};