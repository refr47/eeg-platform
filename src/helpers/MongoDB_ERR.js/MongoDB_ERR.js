import ErrorHandler from "../utils/ErrorHandler.js";
const MongoErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || " internal server Error";
  if (err.name === "CastError") {
    let message = `Resource not found : invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  //  Duplicate Key Error -
  if (err.code === 11000) {
    const message = `this ${Object.keys(err.keyValue)} is Already Exist`;
    err = new ErrorHandler(message, 400);
  }
  res
    .status(err.statusCode)
    .json({ sucess: false, statusCode: err.statusCode, message: err.message });
};
export default MongoErrorHandler;
