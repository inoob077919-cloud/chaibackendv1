import { ApiError } from "../utils/ApiError.js";

const validateFields = (fields = []) => {
  return (req, res, next) => {
    try {
      console.log("REQ.BODY:", req.body);

      // If body is missing or empty
      if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Request body is empty"));
      }

      // Check each required field
      for (let field of fields) {
        if (!req.body[field]) {
          return next(new ApiError(400, `${field} is required`));
        }
      }

      next(); // ✅ validation passed
    } catch (err) {
      next(err); // pass actual error forward
    }
  };
};

export { validateFields };
