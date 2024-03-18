import { Document, Model, Schema, Types, model } from "mongoose";
import { IUser } from "./userModel";

interface IComment extends Document {
  content: string;
  author: Types.ObjectId | IUser;
}

const commentSchema: Schema<IComment> = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Please provide content for the comment"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const CommentModel: Model<IComment> = model<IComment>("Comment", commentSchema);
export default CommentModel;

export { IComment };
