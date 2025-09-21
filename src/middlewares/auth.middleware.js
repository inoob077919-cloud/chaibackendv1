import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from '../utils/ApiError.js';

const jwtverify = async (req, res, next) => {
  try {
    //get first accesstoken
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized Access Token ");
    }
    //verrify this token
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodeToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid Access Token for User")
    }
    req.user = user; //assign all user data to req.user easily get (req.user)
    next();

  } catch (error) {
    throw new ApiError(401, "Unauthorized token");
  }
}
export default jwtverify;