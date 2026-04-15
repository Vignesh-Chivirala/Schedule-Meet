import express from "express";
import {
  saveAvailability,
  getAvailability,
  getOverrides,
  saveOverride,
  deleteOverride,
} from "../controllers/availabilityController.js";

const router = express.Router();

router.post("/", saveAvailability);
router.post("/overrides", saveOverride);
router.delete("/overrides/:id", deleteOverride);



router.get("/overrides/:event_id", getOverrides);


router.get("/:event_id", getAvailability);

export default router;
