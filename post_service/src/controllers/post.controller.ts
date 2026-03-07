import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { prisma } from '../libs/prisma';
import { NotificationEventQueue } from "../libs/queue";
import axios from "axios";

const Slugify = (str: string, id: number) => {
    return str
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
        .concat(`-${id}`);
}

const CreatePost = AsyncHandler(async (req, res) => {

    const { title, content, fieldOfInterest } = req.body;
    const userId = req.user.id;
    console.log(userId);

    if (!title || !content) {
        return res.status(400).json(
            new ApiResponse(400, null, "Title and content are required")
        );
    }
    if (!userId) {
        return res.status(401).json(
            new ApiResponse(401, null, "Unauthorized")
        );
    }
    try {
        const fieldofInterestArray = Array.isArray(fieldOfInterest) 
            ? fieldOfInterest 
            : fieldOfInterest 
                ? [fieldOfInterest] 
                : [];

        const slug = Slugify(title, Number(userId));
        await prisma.post.create({
            data: {
                title,
                content,
                authorId: Number(userId),
                slug, // unique name for every post with user id to make it unique and searchable
                isPublished: false,
                fieldofInterest: fieldofInterestArray
            }
        });

        return res.status(201).json(
            new ApiResponse(201, "Post created successfully")
        );
    } catch (error) {
        console.error("Error creating post:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
        return res.status(500).json(
            new ApiResponse(500, null, "Post creation failed")
        );
    }
});

const UpdatePost = AsyncHandler(async (req, res) => {

    const { title, content, fieldOfInterest } = req.body;
    const postId = req.params.id;
    console.log(postId);


    if (!title || !content) {
        return res.status(400).json(
            new ApiResponse(400, null, "Title and content are required")
        );
    }

    try {
        const fieldofInterestArray = Array.isArray(fieldOfInterest)
            ? fieldOfInterest
            : fieldOfInterest
                ? [fieldOfInterest]
                : undefined;

        const post = await prisma.post.update({
            where: {
                id: Number(postId)
            },
            data: {
                title,
                content,
                fieldofInterest: fieldofInterestArray
            }
        })
        return res.status(200).json(
            new ApiResponse(200, post, "Post updated successfully")
        )
    } catch (error) {
        console.error("Error updating post:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
        return res.status(500).json(
            new ApiResponse(500, null, "Post update failed")
        );
    }
});

// if post get deleted then application also get deleted 
const DeletePost = AsyncHandler(async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await prisma.post.update({
            where: {
                id: Number(postId)
            },
            data: {
                isDeleted: true
            }
        })
        // delete application related to this post
        return res.status(200).json(
            new ApiResponse(200, "Post deleted successfully")
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }

    }
});

const GetPostById = AsyncHandler(async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: Number(postId)
            }
        });

        if (!post) {
            return res.status(404).json(
                new ApiResponse(404, null, "Post not found")
            );
        }

        // Increment views
        const updatedPost = await prisma.post.update({
            where: { id: Number(postId) },
            data: { views: { increment: 1 } }
        });

        return res.status(200).json(
            new ApiResponse(200, updatedPost)
        );

    } catch (error) {

    }
});

const PublishPost = AsyncHandler(async (req, res) => {
    const postId = req.params.id;

    try {

        const post = await prisma.post.update({
            where: {
                id: Number(postId)
            },
            data: {
                isPublished: true
            }
        });

        // Create a private chat room for this post in chat_service
        try {
            await axios.post("http://chat:4000/", {
                name: `Discussion: ${post.title}`,
                type: "PRIVATE",
                postId: post.id
            }, {
                // We need to pass the user's auth token or some system identifier
                // For simplicity in this demo, we assume the chat service allows this internal call
                // Normally we'd use a shared secret or pass the req.header("Authorization")
                headers: {
                    Authorization: req.headers.authorization
                }
            });
        } catch (error) {
            console.error("Failed to create chat room for post:", error);
            // We don't want to fail the publish if chat room creation fails, but it's not ideal
        }

        const job = await NotificationEventQueue.add("POST_PUBLISHED", {
            postId: post.id,
            authorId: post.authorId,
            fieldOfInterest: post.fieldofInterest
        },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000, // 5 seconds
                },
            }
        )
        return res.status(200).json(
            new ApiResponse(200, "Post published successfully")
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
});

// error while fetching posts with field of interest 
// get posts where field of interest matches 
const GetPosts = AsyncHandler(async (req, res) => {
    const interestsParam = req.query.interests;
    const limitParam = req.query.limit;
    const pageParam = req.query.page;

    if (!interestsParam || typeof interestsParam !== "string") {
        return res.status(400).json({ message: "Interests required" });
    }
    try {
        const interestArray = interestsParam.split(",");

        // Default values
        const limit =
            typeof limitParam === "string" ? parseInt(limitParam) : 10;

        const page =
            typeof pageParam === "string" ? parseInt(pageParam) : 1;

        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
            where: {
                fieldofInterest: {
                    hasSome: interestArray,
                },
                isDeleted: false,
                isPublished: true,
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                authorId: true,
                slug: true,
                fieldofInterest: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
            skip: skip,
        });
        // fetch user details along with posts
        return res.status(200).json(posts);

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
});

// error while fetching posts with field of interest
const GetAllPosts = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    console.log(userId);
    if (!userId) {
        return res.status(400).json(
            new ApiResponse(400, null, "User ID is required")
        );
    }

    try {

        const posts = await prisma.post.findMany({
            where: {
                authorId: Number(userId),
                isDeleted: false
            }
        });

        return res.status(200).json(
            new ApiResponse(200, posts, "Posts retrieved successfully")
        );

    } catch (error) {
        console.error("Error retrieving posts:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Post retrieval failed")
        );
    }
});


const SearchPosts = AsyncHandler(async (req, res) => {
    const slug = req.query.slug;
    try {


    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }

    }
})


const CreateComment = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;
    const { content } = req.body;
    if (!content) {
        return res.status(400).json(
            new ApiResponse(400, null, "Content is required")
        );
    }
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(postId) }
        });

        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        const comment = await prisma.comments.create({
            data: {
                content,
                postId: Number(postId),
                userId: Number(userId)
            }
        });

        await prisma.post.update({
            where: { id: Number(postId) },
            data: {
                comments: {
                    push: comment.id
                }
            }
        });

        await NotificationEventQueue.add("POST_COMMENTED", {
            postId: Number(postId),
            actorId: Number(userId),
            authorId: post.authorId,
            content: content
        }, {
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 }
        });

        return res.status(201).json(
            new ApiResponse(201, comment, "Comment created successfully")
        );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
        return res.status(500).json(new ApiResponse(500, null, "Something went wrong"));
    }
});

const UpdateComment = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.commentId;
    const { content } = req.body;
    if (!content) {
        return res.status(400).json(
            new ApiResponse(400, null, "Content is required")
        );
    }
    try {
        const comment = await prisma.comments.update({
            where: { id: Number(commentId), userId: Number(userId) },
            data: { content }
        });
        return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
        return res.status(500).json(new ApiResponse(500, null, "Something went wrong"));
    }
});

const DeleteComment = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const commentId = req.params.commentId;
    try {
        await prisma.comments.update({
            where: { id: Number(commentId), userId: Number(userId) },
            data: { isDeleted: true }
        });
        return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
        return res.status(500).json(new ApiResponse(500, null, "Something went wrong"));
    }
});

const likePost = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { postId } = req.params;

    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(postId) }
        });
        if (!post) {
            return res.status(404).json(
                new ApiResponse(404, null, "Post not found")
            )
        }

        const existingLike = await prisma.likes.findFirst({
            where: {
                postId: Number(postId),
                userId: Number(userId),
                isDeleted: false
            }
        });

        if (existingLike) {
            return res.status(400).json(new ApiResponse(400, null, "Already liked"));
        }

        const like = await prisma.likes.create({
            data: {
                postId: Number(postId),
                userId: Number(userId)
            }
        });

        await prisma.post.update({
            where: { id: Number(postId) },
            data: {
                likes: {
                    push: like.id
                }
            }
        });

        await NotificationEventQueue.add("POST_LIKED", {
            postId: Number(postId),
            actorId: Number(userId),
            authorId: post.authorId
        }, {
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 }
        });

        return res.status(200).json(
            new ApiResponse(200, like, "Post liked successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
        return res.status(500).json(new ApiResponse(500, null, "Something went wrong"));
    }
});



export {
    CreatePost,
    UpdatePost,
    DeletePost,
    GetPostById,
    GetAllPosts,
    PublishPost,
    GetPosts,
    SearchPosts,
    CreateComment,
    UpdateComment,
    DeleteComment,
    likePost
}