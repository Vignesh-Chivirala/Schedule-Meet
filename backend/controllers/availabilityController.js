import db from "../config/db.js";

export const saveAvailability = (req, res) => {
  const { event_id, days, start_time, end_time, timezone } = req.body;

  if (!event_id) {
    return res.status(400).json({ message: "event_id is required" });
  }

  db.query("DELETE FROM availability WHERE event_id=?", [event_id], (deleteErr) => {
    if (deleteErr) {
      return res.status(500).json({ message: "Failed to reset availability" });
    }

    if (!Array.isArray(days) || days.length === 0) {
      return res.json({ message: "Saved" });
    }

    const values = days.map((day) => [
      event_id,
      day,
      start_time,
      end_time,
      timezone,
    ]);

    db.query(
      "INSERT INTO availability (event_id, day_of_week, start_time, end_time, timezone) VALUES ?",
      [values],
      (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Failed to save availability" });
        }

        return res.json({ message: "Saved" });
      }
    );
  });
};

export const getAvailability = (req, res) => {
  db.query(
    "SELECT * FROM availability WHERE event_id=?",
    [req.params.event_id],
    (err, result) => res.json(result)
  );
};

export const getOverrides = (req, res) => {
  db.query(
    "SELECT * FROM availability_overrides WHERE event_id=? ORDER BY override_date ASC",
    [req.params.event_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

export const saveOverride = (req, res) => {
  const { event_id, override_date, start_time, end_time, is_blocked = false } = req.body;

  if (!event_id || !override_date) {
    return res.status(400).json({ message: "event_id and override_date are required" });
  }

  db.query(
    `
      INSERT INTO availability_overrides (event_id, override_date, start_time, end_time, is_blocked)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      start_time = VALUES(start_time),
      end_time = VALUES(end_time),
      is_blocked = VALUES(is_blocked)
    `,
    [event_id, override_date, start_time || null, end_time || null, Boolean(is_blocked)],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Override saved" });
    }
  );
};

export const deleteOverride = (req, res) => {
  db.query(
    "DELETE FROM availability_overrides WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Override deleted" });
    }
  );
};

export const generateSlots = (req, res) => {
  const { event_id, date } = req.query;

  const day = new Date(date).toLocaleString("en-US", {
    weekday: "long",
  });

  db.query(
    "SELECT * FROM events WHERE id=?",
    [event_id],
    (eventErr, eventResult) => {
      if (eventErr) return res.status(500).json(eventErr);
      if (eventResult.length === 0) return res.status(404).json({ message: "Event not found" });

      const event = eventResult[0];
      const duration = Number(event.duration) || 30;
      const bufferBefore = Number(event.buffer_before) || 0;
      const bufferAfter = Number(event.buffer_after) || 0;

      db.query(
        "SELECT * FROM availability_overrides WHERE event_id=? AND override_date=? LIMIT 1",
        [event_id, date],
        (overrideErr, overrideResult) => {
          if (overrideErr) return res.status(500).json(overrideErr);

          const override = overrideResult[0];

          const resolveWindow = (fallbackStart, fallbackEnd) => {
            const startTime = override ? override.start_time : fallbackStart;
            const endTime = override ? override.end_time : fallbackEnd;

            if (!startTime || !endTime) {
              return res.json([]);
            }

            let cursor = new Date(`${date}T${startTime}`);
            const windowEnd = new Date(`${date}T${endTime}`);
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

            db.query(
              "SELECT time FROM bookings WHERE event_id=? AND date=?",
              [event_id, date],
              (bookedErr, booked) => {
                if (bookedErr) return res.status(500).json(bookedErr);

                const available = slots.filter((slot) => {
                  const candidateStart = new Date(`${date}T${slot}`);
                  const candidateEnd = new Date(candidateStart);
                  candidateEnd.setMinutes(candidateEnd.getMinutes() + duration);

                  return !booked.some((booking) => {
                    const bookedStart = new Date(`${date}T${booking.time}`);
                    const bookedEnd = new Date(bookedStart);
                    bookedEnd.setMinutes(bookedEnd.getMinutes() + duration);

                    const blockedStart = new Date(bookedStart);
                    blockedStart.setMinutes(blockedStart.getMinutes() - bufferBefore);

                    const blockedEnd = new Date(bookedEnd);
                    blockedEnd.setMinutes(blockedEnd.getMinutes() + bufferAfter);

                    return candidateStart < blockedEnd && candidateEnd > blockedStart;
                  });
                });

                return res.json(available);
              }
            );
          };

          if (override?.is_blocked) {
            return res.json([]);
          }

          if (override) {
            return resolveWindow(null, null);
          }

          db.query(
            "SELECT * FROM availability WHERE event_id=? AND day_of_week=?",
            [event_id, day],
            (availabilityErr, availabilityResult) => {
              if (availabilityErr) return res.status(500).json(availabilityErr);
              if (availabilityResult.length === 0) return res.json([]);

              const { start_time, end_time } = availabilityResult[0];
              return resolveWindow(start_time, end_time);
            }
          );
        }
      );
    }
  );
};
