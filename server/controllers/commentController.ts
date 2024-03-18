import { Request, Response, NextFunction } from "express";
import Comment from "../models/commentModel";
import { CustomErrorHandler } from "../utils/CustomErrorHandler";
import Post from "../models/postModel";

export const createCommentController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { postId } = req.params;
      const userId = req.user._id;
      const { content } = req.body;
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.jsonResponse(false, 404, "Post not found");
      }
  
      const comment = await Comment.create({ content, author: userId });
      post.comments.push(comment._id);
      await post.save();
  
      res.jsonResponse(true, 201, "Comment added successfully", { comment });
    } catch (error: any) {
      next(new CustomErrorHandler(500, "Internal Server Error"));
    }
  };
  
  export const getCommentByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.jsonResponse(false, 404, "Comment not found");
      }
      res.jsonResponse(true, 200, "Comment fetched successfully", { comment });
    } catch (error: any) {
      next(new CustomErrorHandler(500, "Internal Server Error"));
    }
  };

export const updateCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.jsonResponse(false, 404, "Comment not found");
    }

    // Check if the user is the owner of the comment
    if (comment.author.toString() !== userId.toString()) {
      return res.jsonResponse(false, 403, "You are not authorized to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );

    res.jsonResponse(true, 200, "Comment updated successfully", { comment: updatedComment });
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};

export const deleteCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.jsonResponse(false, 404, "Comment not found");
    }

    // Check if the user is the owner of the comment
    if (comment.author.toString() !== userId.toString()) {
      return res.jsonResponse(false, 403, "You are not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    res.jsonResponse(true, 200, "Comment deleted successfully");
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};
