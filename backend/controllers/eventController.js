import db from "../config/db.js";

//  CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      slug,
      buffer_before = 0,
      buffer_after = 0,
      custom_question = null,
    } = req.body;

    //  insert event
    const result = await db.query(
      `
      INSERT INTO events
      (title, description, duration, slug, buffer_before, buffer_after, custom_question)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [title, description, duration, slug, buffer_before, buffer_after, custom_question]
    );

    const eventId = result.rows[0].id;

    //  ADD THIS PART (AUTO AVAILABILITY)
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    for (let day of days) {
      await db.query(
        `
        INSERT INTO availability (event_id, day_of_week, start_time, end_time, timezone)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [eventId, day, "09:00", "17:00", "Asia/Kolkata"]
      );
    }

    //  response
    res.json({ id: eventId });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

//  GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM events");
    res.json(result.rows); // 🔥 IMPORTANT FIX
  } catch (err) {
    res.status(500).json(err);
  }
};

//  GET EVENT BY SLUG
export const getEventBySlug = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM events WHERE slug = $1",
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
};

//  DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    await db.query("DELETE FROM events WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

//  UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      slug,
      buffer_before = 0,
      buffer_after = 0,
      custom_question = null,
    } = req.body;

    const { id } = req.params;

    await db.query(
      `
      UPDATE events
      SET title=$1, description=$2, duration=$3, slug=$4,
          buffer_before=$5, buffer_after=$6, custom_question=$7
      WHERE id=$8
      `,
      [title, description, duration, slug, buffer_before, buffer_after, custom_question, id]
    );

    res.json({ message: "Event updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};