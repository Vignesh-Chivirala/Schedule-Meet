import db from "../config/db.js";

// ✅ SAVE AVAILABILITY
export const saveAvailability = async (req, res) => {
  try {
    const { event_id, days, start_time, end_time, timezone } = req.body;

    if (!event_id) {
      return res.status(400).json({ message: "event_id is required" });
    }

    // delete old
    await db.query("DELETE FROM availability WHERE event_id=$1", [event_id]);

    if (!Array.isArray(days) || days.length === 0) {
      return res.json({ message: "Saved" });
    }

    // insert one by one (Postgres doesn't support VALUES ?)
    for (let day of days) {
      await db.query(
        `INSERT INTO availability (event_id, day_of_week, start_time, end_time, timezone)
         VALUES ($1, $2, $3, $4, $5)`,
        [event_id, day, start_time, end_time, timezone]
      );
    }

    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ GET AVAILABILITY
export const getAvailability = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM availability WHERE event_id=$1",
      [req.params.event_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ GET OVERRIDES
export const getOverrides = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM availability_overrides WHERE event_id=$1 ORDER BY override_date ASC",
      [req.params.event_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ SAVE OVERRIDE (Postgres UPSERT)
export const saveOverride = async (req, res) => {
  try {
    const { event_id, override_date, start_time, end_time, is_blocked = false } = req.body;

    await db.query(
      `
      INSERT INTO availability_overrides (event_id, override_date, start_time, end_time, is_blocked)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (event_id, override_date)
      DO UPDATE SET
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        is_blocked = EXCLUDED.is_blocked
      `,
      [event_id, override_date, start_time, end_time, is_blocked]
    );

    res.json({ message: "Override saved" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ✅ DELETE OVERRIDE
export const deleteOverride = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM availability_overrides WHERE id=$1",
      [req.params.id]
    );
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const generateSlots = async (req, res) => {
  try {
    const { event_id, date } = req.query;

    if (!event_id || !date) {
      return res.status(400).json({ message: "Missing params" });
    }

    // ✅ get event
    const eventRes = await db.query(
      "SELECT * FROM events WHERE id=$1",
      [event_id]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = eventRes.rows[0];
    const duration = Number(event.duration) || 30;

    // ✅ get day
    const day = new Date(date).toLocaleString("en-US", {
      weekday: "long",
    });

    // ✅ get availability
    const availRes = await db.query(
      "SELECT * FROM availability WHERE event_id=$1 AND day_of_week=$2",
      [event_id, day]
    );

    if (availRes.rows.length === 0) {
      return res.json([]); // no availability
    }

    let start = availRes.rows[0].start_time;
    let end = availRes.rows[0].end_time;

    // ⚠️ FIX TIME FORMAT (IMPORTANT)
    start = start.toString().slice(0, 5);
    end = end.toString().slice(0, 5);

    // ✅ generate slots
    let cursor = new Date(`${date}T${start}:00`);
    const windowEnd = new Date(`${date}T${end}:00`);
    const slots = [];

    while (cursor < windowEnd) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      if (slotEnd <= windowEnd) {
        slots.push(slotStart.toTimeString().slice(0, 5));
      }

      cursor.setMinutes(cursor.getMinutes() + 30);
    }

    // ✅ remove booked
    const bookedRes = await db.query(
      "SELECT time FROM bookings WHERE event_id=$1 AND date=$2",
      [event_id, date]
    );

    const bookedTimes = bookedRes.rows.map((b) =>
      b.time.toString().slice(0, 5)
    );

    const available = slots.filter((s) => !bookedTimes.includes(s));

    res.json(available);
  } catch (err) {
    console.error("SLOT ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({ error: "Slot generation failed" });
  }
};