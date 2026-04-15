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

    // 👉 Get event
    const eventResult = await db.query(
      "SELECT * FROM events WHERE id=$1",
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = eventResult.rows[0];
    const duration = Number(event.duration) || 30;
    const bufferBefore = Number(event.buffer_before) || 0;
    const bufferAfter = Number(event.buffer_after) || 0;

    // 👉 Get day name
    const day = new Date(date).toLocaleString("en-US", {
      weekday: "long",
    });

    // 👉 Check override
    const overrideResult = await db.query(
      "SELECT * FROM availability_overrides WHERE event_id=$1 AND override_date=$2",
      [event_id, date]
    );

    const override = overrideResult.rows[0];

    if (override?.is_blocked) {
      return res.json([]);
    }

    let start_time, end_time;

    if (override) {
      start_time = override.start_time;
      end_time = override.end_time;
    } else {
      const availabilityResult = await db.query(
        "SELECT * FROM availability WHERE event_id=$1 AND day_of_week=$2",
        [event_id, day]
      );

      if (availabilityResult.rows.length === 0) {
        return res.json([]);
      }

      start_time = availabilityResult.rows[0].start_time;
      end_time = availabilityResult.rows[0].end_time;
    }

    // 👉 Generate slots
    let cursor = new Date(`${date}T${start_time}`);
    const windowEnd = new Date(`${date}T${end_time}`);
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

    // 👉 Get booked slots
    const bookedResult = await db.query(
      "SELECT time FROM bookings WHERE event_id=$1 AND date=$2",
      [event_id, date]
    );

    const booked = bookedResult.rows;

    // 👉 Filter available slots
    const available = slots.filter((slot) => {
      const candidateStart = new Date(`${date}T${slot}`);
      const candidateEnd = new Date(candidateStart);
      candidateEnd.setMinutes(candidateEnd.getMinutes() + duration);

      return !booked.some((b) => {
        const bookedStart = new Date(`${date}T${b.time}`);
        const bookedEnd = new Date(bookedStart);
        bookedEnd.setMinutes(bookedEnd.getMinutes() + duration);

        const blockedStart = new Date(bookedStart);
        blockedStart.setMinutes(blockedStart.getMinutes() - bufferBefore);

        const blockedEnd = new Date(bookedEnd);
        blockedEnd.setMinutes(blockedEnd.getMinutes() + bufferAfter);

        return candidateStart < blockedEnd && candidateEnd > blockedStart;
      });
    });

    res.json(available);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};