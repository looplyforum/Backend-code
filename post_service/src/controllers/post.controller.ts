import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { prisma } from '../libs/prisma';


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
        const slug = Slugify(title, Number(userId));
        await prisma.post.create({
            data: {
                title,
                content,
                authorId: Number(userId),
                slug, // unique name for every post with user id to make it unique and searchable
                isPublished: false,
                fieldofInterest: fieldOfInterest
            }
        });

        // TODO: push to queue

        return res.status(201).json(
            new ApiResponse(201, "Post created successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
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
        const post = await prisma.post.update({
            where: {
                id: Number(postId)
            },
            data: {
                title,
                content,
                fieldofInterest: fieldOfInterest
            }
        })
        return res.status(200).json(
            new ApiResponse(200, post, "Post updated successfully")
        )
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }

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
        })
        return res.status(200).json(
            new ApiResponse(200, post)
        )

    } catch (error) {

    }
});

const GetAllPosts = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: Number(userId),
                isDeleted: false
            }
        })
        return res.status(200).json(
            new ApiResponse(200, posts)
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
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
        })
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
        return res.status(200).json(posts);

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
});

export {
    CreatePost,
    UpdatePost,
    DeletePost,
    GetPostById,
    GetAllPosts,
    PublishPost,
    GetPosts
}