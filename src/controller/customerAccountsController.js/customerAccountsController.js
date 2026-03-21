import CustomerAccount from "../models/CustomerAccount";
async function createCustomerAccount(req, res) {
  const payload = { ...req.body };
  if (!payload.userId) {
    payload.userId = req.auth.userId;
  }
  const account = await CustomerAccount.create(payload);
  return res.status(201).json(account);
}
async function getCustomerAccountById(req, res) {
  const account = await CustomerAccount.findById(req.params.customerAccountId);
  if (!account) {
    return res.status(404).json({ message: "Customer account not found" });
  }
  return res.json(account);
}
async function listCustomerAccounts(req, res) {
  const filter = {};
  if (!req.auth.roles.includes("admin")) {
    filter.userId = req.auth.userId;
  }
  const items = await CustomerAccount.find(filter).sort({ createdAt: -1 });
  return res.json(items);
}
async function updateCustomerAccount(req, res) {
  const account = await CustomerAccount.findById(req.params.customerAccountId);
  if (!account) {
    return res.status(404).json({ message: "Customer account not found" });
  }
  if (
    !req.auth.roles.includes("admin") &&
    account.userId.toString() !== req.auth.userId
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }
  Object.assign(account, req.body);
  await account.save();
  return res.json(account);
}
export { createCustomerAccount };
export { getCustomerAccountById };
export { listCustomerAccounts };
export { updateCustomerAccount };
export default {
  createCustomerAccount,
  getCustomerAccountById,
  listCustomerAccounts,
  updateCustomerAccount,
};
