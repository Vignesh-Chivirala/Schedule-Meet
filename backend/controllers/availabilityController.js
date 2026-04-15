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