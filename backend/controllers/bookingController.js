import db from "../config/db.js";

// CREATE
export const createBooking = (req, res) => {
  const { event_id, name, email, date, time, custom_answer = null } = req.body;

  db.query(
    "SELECT * FROM bookings WHERE event_id=? AND date=? AND time=?",
    [event_id, date, time],
    (err, result) => {
      if (result.length > 0)
        return res.status(400).json({ message: "Slot already booked" });

      db.query(
        `
          INSERT INTO bookings (event_id, name, email, date, time, custom_answer)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [event_id, name, email, date, time, custom_answer],
        (err2, r) => res.json({ id: r.insertId })
      );
    }
  );
};

// GET ALL BOOKINGS
export const getBookings = (req, res) => {
  db.query(
    `
      SELECT
        bookings.*,
        events.title AS event_title,
        events.slug AS event_slug,
        events.duration AS event_duration
      FROM bookings
      LEFT JOIN events ON events.id = bookings.event_id
      ORDER BY bookings.date ASC, bookings.time ASC
    `,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// UPDATE (RESCHEDULE)
export const updateBooking = (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  db.query(
    "SELECT event_id FROM bookings WHERE id=?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const { event_id } = result[0];
      db.query(
        "SELECT * FROM bookings WHERE event_id=? AND date=? AND time=? AND id!=?",
        [event_id, date, time, id],
        (conflictErr, conflicts) => {
          if (conflictErr) return res.status(500).json(conflictErr);
          if (conflicts.length > 0) {
            return res.status(400).json({ message: "Slot already booked" });
          }

          db.query(
            "UPDATE bookings SET date=?, time=? WHERE id=?",
            [date, time, id],
            (updateErr) => {
              if (updateErr) return res.status(500).json(updateErr);
              return res.json({ message: "Updated" });
            }
          );
        }
      );
    }
  );
};

// DELETE (CANCEL)
export const deleteBooking = (req, res) => {
  db.query("DELETE FROM bookings WHERE id=?", [req.params.id], () => {
    res.json({ message: "Cancelled" });
  });
};
