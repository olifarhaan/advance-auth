import express from "express";
import {
  createPostController,
  getAllPostsController,
  getPostByIdController,
  likePostController,
  unlikePostController,
  updatePostController,
  deletePostController,
  getLikedPostsController,
} from "../controllers/postController";
import { isAuthenticated } from "../middlewares/auth";

const router = express.Router();

// Public routes
router.get("/", getAllPostsController);
router.get("/:id", getPostByIdController);

// Protected routes
router.use(isAuthenticated); 

router.post("/", createPostController);
router.get("/liked-posts", getLikedPostsController)
router.put("/:id", updatePostController);
router.delete("/:id", deletePostController);
router.post("/:id/like", likePostController);
router.post("/:id/unlike", unlikePostController);

export default router;
