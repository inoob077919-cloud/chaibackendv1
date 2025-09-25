
import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import ApiResponse from "./../utils/ApiResponse.js";

const subscriptionUser = asyncHandler(async (req, res) => {
  req.user?._id
});

export {
  subscriptionUser
}