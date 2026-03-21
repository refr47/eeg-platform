import Eeg from "../models/Eeg";
import EegMembership from "../models/EegMembership";
import EegState from "../models/EegState";
async function createEeg(req, res) {
  const eeg = await Eeg.create(req.body);
  return res.status(201).json(eeg);
}
async function getEegById(req, res) {
  const eeg = await Eeg.findById(req.params.eegId);
  if (!eeg) {
    return res.status(404).json({ message: "Eeg not found" });
  }
  return res.json(eeg);
}
async function createEegMembership(req, res) {
  const membership = await EegMembership.create({
    eegId: req.params.eegId,
    customerAccountId: req.body.customerAccountId,
    role: req.body.role || "member",
    joinedAt: req.body.joinedAt,
    leftAt: req.body.leftAt,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
  });
  await Eeg.findByIdAndUpdate(req.params.eegId, { $inc: { memberCount: 1 } });
  return res.status(201).json(membership);
}
async function listEegMemberships(req, res) {
  const items = await EegMembership.find({ eegId: req.params.eegId }).sort({
    createdAt: -1,
  });
  return res.json(items);
}
async function createEegState(req, res) {
  const state = await EegState.create({
    eegId: req.params.eegId,
    recordedAt: req.body.recordedAt,
    availablePowerKw: req.body.availablePowerKw,
    consumedPowerKw: req.body.consumedPowerKw,
    surplusPowerKw: req.body.surplusPowerKw,
    deficitPowerKw: req.body.deficitPowerKw,
    source: req.body.source || "aggregation",
  });
  return res.status(201).json(state);
}
async function listEegStates(req, res) {
  const items = await EegState.find({ eegId: req.params.eegId })
    .sort({ recordedAt: -1 })
    .limit(100);
  return res.json(items);
}
export { createEeg };
export { getEegById };
export { createEegMembership };
export { listEegMemberships };
export { createEegState };
export { listEegStates };
export default {
  createEeg,
  getEegById,
  createEegMembership,
  listEegMemberships,
  createEegState,
  listEegStates,
};
