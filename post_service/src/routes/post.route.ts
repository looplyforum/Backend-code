import express from "express";
import {
  CreatePost,
  DeletePost,
  GetAllPosts,
  GetPostById,
  UpdatePost,
  GetPosts,
  PublishPost,
  CreateComment,
  DeleteComment,
  SearchPosts,
  UpdateComment,
  likePost
} from "../controllers/post.controller";

const router = express.Router();


router.get('/health', (_, res) => {
  res.status(200).json({ message: "Post service is running" });
})

router.get("/my-posts", GetAllPosts);

router.get('/', GetPosts);

router.get("/:id", GetPostById);


router.post("/create", CreatePost);

router.post("/update/:id", UpdatePost);

router.post("/delete/:id", DeletePost);

router.post("/publish/:id", PublishPost);

router.post("/search", SearchPosts);

router.post("/comment/:id", CreateComment);

router.post("/update-comment/:id", UpdateComment);

router.post("/delete-comment/:id", DeleteComment);

router.post("/like/:id", likePost);

export default router;