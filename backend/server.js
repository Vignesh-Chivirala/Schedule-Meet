import express from "express";
import cors from "cors";

import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);

app.get("/seed", (req, res) => {
  db.query(`
    INSERT INTO events (title, description, duration, slug)
    VALUES 
    ('Intro Call', 'Quick intro meeting', 30, 'intro-call'),
    ('Consultation', 'Detailed discussion', 60, 'consultation'),
    ('Quick Chat', 'Short call', 15, 'quick-chat')
  `, (err) => {
    if (err) {
      console.error(err);
      return res.send("Error inserting");
    }
    res.send("✅ Data Inserted");
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});