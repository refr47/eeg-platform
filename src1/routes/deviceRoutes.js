const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireRole } = require("../middlewares/auth");
const {
  createDevice,
  getDeviceById,
  listDevices,
  createMeterReading,
  listMeterReadings,
  createDeviceCommand,
  listDeviceCommands,
} = require("../controllers/devicesController");
const {
  createBattery,
  getBatteryById,
  listBatteries,
  createBatteryState,
  listBatteryStates,
  createEnergyPolicy,
  listEnergyPolicies,
} = require("../controllers/batteriesController");

const router = express.Router();

router.get("/devices", requireAuth, asyncHandler(listDevices));
router.post(
  "/devices",
  requireAuth,
  requireRole("admin", "operator"),
  asyncHandler(createDevice),
);
router.get("/devices/:deviceId", requireAuth, asyncHandler(getDeviceById));

router.post(
  "/devices/:deviceId/meter-readings",
  requireAuth,
  requireRole("admin", "operator", "device"),
  asyncHandler(createMeterReading),
);

router.get(
  "/devices/:deviceId/meter-readings",
  requireAuth,
  asyncHandler(listMeterReadings),
);

router.post(
  "/devices/:deviceId/commands",
  requireAuth,
  requireRole("admin", "operator"),
  asyncHandler(createDeviceCommand),
);

router.get(
  "/devices/:deviceId/commands",
  requireAuth,
  asyncHandler(listDeviceCommands),
);

router.get("/batteries", requireAuth, asyncHandler(listBatteries));
router.post(
  "/batteries",
  requireAuth,
  requireRole("admin", "operator"),
  asyncHandler(createBattery),
);
router.get("/batteries/:batteryId", requireAuth, asyncHandler(getBatteryById));

router.post(
  "/batteries/:batteryId/states",
  requireAuth,
  requireRole("admin", "operator", "device"),
  asyncHandler(createBatteryState),
);

router.get(
  "/batteries/:batteryId/states",
  requireAuth,
  asyncHandler(listBatteryStates),
);

router.post(
  "/batteries/:batteryId/energy-policies",
  requireAuth,
  requireRole("admin", "operator"),
  asyncHandler(createEnergyPolicy),
);

router.get(
  "/batteries/:batteryId/energy-policies",
  requireAuth,
  asyncHandler(listEnergyPolicies),
);

module.exports = router;
