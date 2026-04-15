import db from "../config/db.js";

export const createEvent = (req, res) => {
  const {
    title,
    description,
    duration,
    slug,
    buffer_before = 0,
    buffer_after = 0,
    custom_question = null,
  } = req.body;

  db.query(
    `
      INSERT INTO events
      (title, description, duration, slug, buffer_before, buffer_after, custom_question)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [title, description, duration, slug, buffer_before, buffer_after, custom_question],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId });
    }
  );
};

export const getEvents = (req, res) => {
  db.query("SELECT * FROM events", (err, results) => {
    res.json(results);
  });
};

export const getEventBySlug = (req, res) => {
  db.query(
    "SELECT * FROM events WHERE slug=?",
    [req.params.slug],
    (err, result) => {
      if (result.length === 0)
        return res.status(404).json({ message: "Not found" });

      res.json(result[0]);
    }
  );
};

export const deleteEvent = (req, res) => {
  db.query("DELETE FROM events WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
};

export const updateEvent = (req, res) => {
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

  db.query(
    `
      UPDATE events
      SET title=?, description=?, duration=?, slug=?, buffer_before=?, buffer_after=?, custom_question=?
      WHERE id=?
    `,
    [title, description, duration, slug, buffer_before, buffer_after, custom_question, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Event updated" });
    }
  );
};
