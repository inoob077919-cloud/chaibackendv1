import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,  // ensures each username is unique in DB
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,  // ensures each email is unique in DB
      lowercase: true,
      trim: true,

    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avator: {
      type: String, //cloudinary url save there
      required: true,
    },
    coverImage: {
      type: String, //Cloudinary url

    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true //createdAt, updatedAt
  }
);

userSchema.pre("save", async function (next) { //this is middleware for before save password encrypt
  if (!this.isModified("password")) return next(); //only new password only work this below code
  this.password = await bcrypt.hash(this.password, 10); //10 round hash but something wrong bcz everytime encrypt everytime so use condition when new password 
  next();
});

//next mongoose methods. use isPasswordCorrect 
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); //its return only true or false
}

///Generate Access Token 
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    // eslint-disable-next-line no-undef
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
}
///Generate Refresh Token 
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    // eslint-disable-next-line no-undef
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
}
export default mongoose.model("User", userSchema);
