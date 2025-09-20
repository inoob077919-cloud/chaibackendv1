
import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import ApiResponse from "./../utils/ApiResponse.js";
const registerUser = asyncHandler(
  async (req, res) => {

    console.log(req)
    /**
     * steps fot logics
     * 1: get user details from frontend
     * 2: validation - not empty
     * 3: check if user already exists: username and email
     * 4: check for images, check fot avator
     * 5: upload them to cloudinary ,avator
     * 6: create user object - create entry in db
     * 7: remove password and refresh token field from response
     * 8: check for user creation
     * 9: return response
    */
    const { fullName, username, email, password } = req.body;

    // 2:validation
    if (
      [fullName, username, email, password].some((field) =>
        field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required")
    }
    // Email validated
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new ApiError(400, "A valid email is required.")

    }

    //check user exist

    const userExist = User.findOne({
      $or: [{ username }, { email }] //this line of code mean check these field in table exist or not
    });
    if (userExist) {
      throw new ApiError(409, "Username ana email already exist !")
    }
    //check for images, check fot avator

    const avatorLocalPath = req.files?.avator[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //avator is requried
    if (!avatorLocalPath) {
      throw new ApiError(400, "Avator is required ");
    }
    //after this upload thesee  files in cloudinary
    //upload take some time so await
    const avator = await uploadOnCloudinary(avatorLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avator) {
      throw new ApiError(400, "Avator is required ");
    }
    //create entry in db
    const user = await User.create({
      fullName,
      avator: avator.url,
      coverImage: coverImage.url || "", // this condition because we can't use required condition its optional
      email,
      password,
      username: username.toLowserCase()
    });
    //  remove password and refreshToekn
    const userCreated = User.findById(user._id)
      .selec("-password -refreshToken"); //select inside - mins mean except fields
    if (!userCreated) {
      throw new ApiError(500, "Something went wrong Register user")
    }
    // response return 

    return res.status(201).json(
      new ApiResponse(200, userCreated, "User Registered successfully")
    );

  }
);

export { registerUser }
