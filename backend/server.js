import express from "express";
import cors from "cors";

import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";


const app = express();

app.use(cors({
  origin: true, 
  credentials: true,
}));
app.use(express.json());



app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);

app.get("/", (req, res) => {
  res.send(" API is running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});