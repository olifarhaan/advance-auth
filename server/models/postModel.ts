import { Document, Model, Schema, Types, model } from "mongoose";
import { IUser } from "./userModel";
import { IComment } from "./commentModel";

interface IPost extends Document {
  title: string;
  content: string;
  author: Types.ObjectId | IUser;
  likes: Array<Types.ObjectId | IUser>;
  comments: Array<Types.ObjectId | IComment>;
}

const postSchema: Schema<IPost> = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the post"],
    },
    content: {
      type: String,
      required: [true, "Please provide content for the post"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const PostModel: Model<IPost> = model<IPost>("Post", postSchema);
export default PostModel;

export { IPost };
