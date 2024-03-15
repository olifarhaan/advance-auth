import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "../utils/CustomErrorHandler";
import Post from "../models/postModel";
import User from "../models/userModel";

// Create Post
export const createPostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content } = req.body;
    const author = req.user._id;
    const post = await Post.create({ title, content, author });

    await User.findByIdAndUpdate(author, { $push: { posts: post._id } });
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};

// Get All Posts
export const getAllPostsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await Post.find();
    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};

// Get Post by ID
export const getPostByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      post,
    });
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};

// Like Post
// export const likePostController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id: postId } = req.params;
//     const userId= req.user._id;
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       });
//     }

//     // Check if the user has already liked the post
//     if (post.likes.includes(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already liked this post",
//       });
//     }

//     post.likes.push(userId);
//     await post.save();

//     res.status(200).json({
//       success: true,
//       message: "Post liked successfully",
//       post,
//     });
//   } catch (error: any) {
//     next(new CustomErrorHandler(500, "Internal Server Error"));
//   }
// };

export const likePostController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: postId } = req.params;
      const userId = req.user._id;
  
      // Find the post
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      // Check if the user has already liked the post
      if (post.likes.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "You have already liked this post",
        });
      }
  
      // Update the Post model
      post.likes.push(userId);
      await post.save();
  
      // Update the User model
      await User.findByIdAndUpdate(userId, {
        $push: { postsLiked: postId },
      });
  
      res.status(200).json({
        success: true,
        message: "Post liked successfully",
        post,
      });
    } catch (error: any) {
      next(new CustomErrorHandler(500, "Internal Server Error"));
    }
  };


// Unlike Post
export const unlikePostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: postId } = req.params;
    const userId= req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user has liked the post
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      return res.status(400).json({
        success: false,
        message: "You have not liked this post",
      });
    }

    post.likes.splice(index, 1);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      post,
    });
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};

// Update Post
export const updatePostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;
    const post = await Post.findByIdAndUpdate(
      postId,
      { title, content },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};

// Delete Post
export const deletePostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id;
    const author = req.user._id;
    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    await User.findByIdAndUpdate(author, { $pull: { posts: postId } });

    res.status(204).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    next(new CustomErrorHandler(500, "Internal Server Error"));
  }
};

//get all the liked posts by a user
export const getLikedPostsController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user._id;
  
      // Find the user by ID and populate the liked posts
      const user = await User.findById(userId).populate("postsLiked");
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Liked posts fetched successfully",
        likedPosts: user.postsLiked,
      });
    } catch (error: any) {
      next(new CustomErrorHandler(500, "Internal Server Error"));
    }
  };
