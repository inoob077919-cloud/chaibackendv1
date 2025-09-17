import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //Cloudinary url
      required: [true, "Vidoe file must required"]
    },
    thumbnail: {
      type: String,  //Cloudinary url
      required: [true, "Thumbnail is required"]
    },
    title: {
      type: String,
      required: [true, "Thumbnail is required"],
      trim: true
    },
    description: {
      type: String,
      required: true

    },
    duration: {
      type: Number,
      required: true
    },
    view: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true //createdAt and updatedAt
  }
);
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);