
import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "./../utils/cloudinary.js";
import ApiResponse from "./../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



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
  if (!(email || username)) {
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

//RefreshToken generate
const newRefreshToken = asyncHandler(async (req, res) => {


  // console.log(req.cookies);
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Refresh Token ");
  }
  // res.send("New Refresh Token");
  try {
    //verify token
    const decodeToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodeToken) {
      throw new ApiError(401, "Refresh Token Unauthorized")
    }
    //get UserId decode
    const getUserByIdData = await User.findById(decodeToken._id);
    if (!getUserByIdData) {
      throw new ApiError(404, "User not found")
    }

    //compare both token 
    if (incomingRefreshToken != getUserByIdData?.refreshToken) {
      throw new ApiError(401, "Token Refresh Expired or Used")
    }
    //generate token
    const { accessToken, newRefreshToken } = await accessTokenAndRefreshToken(getUserByIdData._id);

    const options = {
      httpOnly: true,
      secure: true
    }

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(201, {
          accessToken, refreshToken: newRefreshToken
        },
          "Access Token Refreshedd")
      );
  } catch (error) {
    throw new ApiError(401, "Something went wront in token check")

  }
});
//Change Password
const changeUserPassword = asyncHandler(
  async (req, res) => {
    //incoming fields data oldPassword , newPassword
    const { oldPassword, newPassword } = req.body;
    //get userdata by Id

    if (!req.user) {
      throw new ApiError(400, "User not loggedIn please loggedIn First");
    }
    const user = await User.findById(req.user?._id);
    //compare oldPassword to db table

    const passwordCorrect = await user.isPasswordCorrect(oldPassword); //if missing await its promise <awaiting>

    if (!passwordCorrect) {
      throw new ApiError(400, "Incorrect old password");
    }

    //update a password
    user.password = newPassword;
    await user.save({ validateBefore: false });

    return res
      .status(200)
      .json(
        new ApiResponse(201, {}, "User Password Change successfully")
      )
  }
);

const getCurrentUser = asyncHandler(
  async (req, res) => {
    const user = await User.findById(req.user?._id)
      .select("-password -refreshToken");
    return res.status(200)
      .json(
        new ApiResponse(202, user, "Current User LoggedIn")
      )
  }
);

const updateAccountDetails = asyncHandler(
  async (req, res) => {
    const { email, fullName } = req.body || {}; //username is not update its one time create for channel its never change
    //no req.body check becz we use validateFeild middleware in route
    const user = await User.findByIdAndUpdate(
      req.user?._id,              // get ID from auth middleware
      { $set: { email, fullName: fullName } },       // only update given fields
      { new: true }
    ).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(400, "Data is not updated please check")
    }
    res.status(200)
      .json(
        new ApiResponse(201, user, "Account Updated successfully")
      )
  }
);

const updateAvatorFile = asyncHandler(async (req, res) => {
  // multer.single("avator") → file is in req.file
  const localPathAvator = req.file?.path;

  if (!localPathAvator) {
    throw new ApiError(400, "Avator Path is invalid");
  }

  // upload to cloudinary (example)
  const uploadedAvator = await uploadOnCloudinary(localPathAvator);

  if (!uploadedAvator?.url) {
    throw new ApiError(500, "Avator upload failed");
  }

  // update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: uploadedAvator.url },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json({
    success: true,
    message: "Avator updated successfully",
    user: updatedUser,
  });
});

const updateCoverImage = asyncHandler(async (req, res) => {
  // multer.single("coverImage") → file is in req.file
  const localPathCoverImage = req.file?.path;

  if (!localPathCoverImage) {
    throw new ApiError(400, "Cover Image Path is invalid");
  }

  // upload to cloudinary (example)
  const uploadedCoverImage = await uploadOnCloudinary(localPathCoverImage);

  if (!uploadedCoverImage?.url) {
    throw new ApiError(500, "Avator upload failed");
  }

  // update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { coverImage: uploadedCoverImage.url },
    { new: true }
  ).select("-password -refreshToken");

  res.status(200).json({
    success: true,
    message: "CoverImage updated successfully",
    user: updatedUser,
  });
});

const getUserChannalProfile = asyncHandler(
  async (req, res) => {
    //get first username of user bcz channel name must in username so if click in channel url ?username=askdjashdkjas
    //like this so we get username in parameters
    const username = req.params?.username;
    //get user details 

    /**
     * User.findOne(username) but we cannot use this query because we need a user data 
     * username,email,fullName,subscriber,channal also these three fields get in users collection
     * but subscriber and channal in subscriptions collection.
     * how to count subscriber and channal in user .
     * we get proper data and relize send data.
     * thats area use aggregate piplines
     * get user collection match username
     **/
    const pipeline = [
      {
        $match: {  //this match Filters  stage 
          username: username
        }
      },
      {
        $lookup: {
          from: "subscriptions",  //put collection u got a data
          localField: "_id", //this collection mean users
          foreignField: "channal",
          as: "subscribers"
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo"
        }
      },
      {
        $addFields: {
          subscriberCount: {
            $size: "$subscribers"
          },
          channalSubscribedCountTo: {
            $size: "$subscribedTo"
          }

        }
      }
      ,
      {
        $project: {
          username: 1, email: 1, fullName: 1,
          subscriberCount: 1, channalSubscribedCountTo: 1
        }
      }

    ];

    const channal = await User.aggregate(pipeline);
    //check records empty or not 
    if (!channal?.length) {
      throw new ApiError(404, "Channal does not exist !");
    }
    res.status(200)
      .json(
        //aggregate return in array so we send object data
        new ApiResponse(200, channal[0], "channal data fetch  successfully")
      );

  }
);
export {
  registerUser,
  getAllUsers,
  userLogin,
  userLogout,
  newRefreshToken,
  changeUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatorFile,
  updateCoverImage,
  getUserChannalProfile
}
