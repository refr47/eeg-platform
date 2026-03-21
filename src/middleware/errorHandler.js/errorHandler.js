function notFoundHandler(req, res) {
  return res.status(404).json({ message: "Route not found" });
}
function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      details: Object.values(err.errors).map((item) => item.message),
    });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id format" });
  }
  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate key error",
      keyValue: err.keyValue,
    });
  }
  return res.status(500).json({ message: "Internal server error" });
}
export { notFoundHandler };
export { errorHandler };
export default {
  notFoundHandler,
  errorHandler,
};
