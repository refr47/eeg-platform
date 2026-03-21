import * as express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import auth from "../middlewares/auth";
import eegsController from "../controllers/eegsController";
const { requireAuth, requireRole } = auth;
const {
  createEeg,
  getEegById,
  createEegMembership,
  listEegMemberships,
  createEegState,
  listEegStates,
} = eegsController;
const router = express.Router();
router.post(
  "/",
  requireAuth,
  requireRole("admin", "eegAdmin"),
  asyncHandler(createEeg),
);
router.get("/:eegId", requireAuth, asyncHandler(getEegById));
router.post(
  "/:eegId/memberships",
  requireAuth,
  requireRole("admin", "eegAdmin"),
  asyncHandler(createEegMembership),
);
router.get(
  "/:eegId/memberships",
  requireAuth,
  asyncHandler(listEegMemberships),
);
router.post(
  "/:eegId/states",
  requireAuth,
  requireRole("admin", "eegAdmin"),
  asyncHandler(createEegState),
);
router.get("/:eegId/states", requireAuth, asyncHandler(listEegStates));
export default router;
