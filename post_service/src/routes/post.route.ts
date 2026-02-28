import express from "express";
import {
  CreatePost,
  DeletePost,
  GetAllPosts,
  GetPostById,
  UpdatePost,
  GetPosts,
  PublishPost,
} from "../controllers/post.controller";

const router = express.Router();


router.get('/health' , (_, res) => {
    res.status(200).json({ message: "Post service is running" });
})

router.get('/',GetPosts);

router.get("/:id", GetPostById);

router.get("/my-posts", GetAllPosts);




router.post("/create", CreatePost);

router.post("/update/:id", UpdatePost);

router.post("/delete/:id", DeletePost);

router.post("/publish/:id", PublishPost);

export default router;