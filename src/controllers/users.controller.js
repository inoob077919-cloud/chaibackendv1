
import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import ApiResponse from "./../utils/ApiResponse.js";




const accessTokenAndRefreshToken = async (userId) => {
  try {
    //first get user ById
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //after this we must save refresh token save
    user.refreshToken = refreshToken;
    user.save({ validateBefore: false }); //remove all validation and save only refreshtoken
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token.")
  }

}

const registerUser = asyncHandler(
  async (req, res) => {

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

    const userExist = await User.findOne({
      $or: [{ username }, { email }] //this line of code mean check these field in table exist or not
    });

    if (userExist) {
      throw new ApiError(409, "Username ana email already exist !")
    }
    //check for images, check fot avator
    // console.log(req.files);
    const avatorLocalPath = req.files?.avator?.[0]?.path || null;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
    } // we also avator image also check like this

    //avator is requried
    if (!req.files || !avatorLocalPath) {
      throw new ApiError(400, "Avator is required select file");
    }
    //after this upload thesee  files in cloudinary
    //upload take some time so await

    const avator = await uploadOnCloudinary(avatorLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    //cloudinary configration error

    if (!avator) {
      throw new ApiError(400, "Avator is not upload in cloudinary required ");
    }
    //create entry in db
    const user = await User.create({
      fullName,
      avator: avator.url,
      coverImage: coverImage.url || "", // this condition because we can't use required condition its optional
      email,
      password,
      username: username.toLowerCase()
    });
    //  remove password and refreshToekn
    const userCreated = await User.findById(user._id)
      .select("-password -refreshToken"); //select inside - mins mean except fields
    if (!userCreated) {
      throw new ApiError(500, "Something went wrong Register user")
    }
    // response return 

    return res.status(201).json(
      new ApiResponse(200, userCreated, "User Registered successfully")
    );

  }
);

const getAllUsers = asyncHandler(

  async (req, res) => {

    const users = await User.find(); // fetch all documents

    res.status(201).json(
      new ApiResponse(202, users, "Users fetched successfully", { count: users.length })
    );

  }
);
//Login user 
const userLogin = asyncHandler(async (req, res) => {
  /**
   *  1: get email,username and password
   *  2: first check email and username is exist or not 
   *  3: now before checking  password is valid or not. we already methods create IsPasswordCorrect(password) password convert to same login new [password bcrypt]
   *  4: create accessToekn and refreshtoken.
   *  5: send Cookie
   * 
   */
  const { email, username, password } = req.body;
  //email and username is required
  if (!email || !username) {
    throw new ApiError(400, "username and email are required")
  }


  const validUser = await User.findOne({
    $or: [{ username }, { email }] //check both field 
  });
  if (!validUser) {
    throw new ApiError(400, "Username and Email doesn't exist !");
  }
  const validPassword = await validUser.isPasswordCorrect(password); //user this user get database instance get all methods or function defined than access

  if (!validPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }
  //create a token but we wanna to make a method of token where we need so easily access
  const { refreshToken, accessToken } = await accessTokenAndRefreshToken(validUser._id);
  const userLoggedIn = await User.findById(validUser._id);
  //set Cookie
  const options = {
    httpOnly: true,
    secure: true
  }

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(204, {
        user: userLoggedIn, accessToken, refreshToken
      },
        "User loggedIn successfully")
    )



});
const userLogout = asyncHandler(async (req, res) => {
  //before we first create middleware for helping get user data through jwt.verify decode and easily access _id

  await User.findByIdAndUpdate(req.user._id,

    { $set: { refreshToken: undefined } }, // Fields to update
    { new: true } // Options

  )
  const options = {
    httpOnly: true,
    secure: true
  }
  res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(201, {}, "User successfully LoggedOut")
    )
});
export {
  registerUser,
  getAllUsers,
  userLogin,
  userLogout
}
