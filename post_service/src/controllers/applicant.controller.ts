import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { prisma } from '../libs/prisma';


const NewApplication = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;
    const { motivation, contribution, learningGoals, weeklyCommitmentHours, longTermInterest } = req.body
    if (!motivation || !contribution || !learningGoals || !weeklyCommitmentHours || !longTermInterest) {
        return res.status(400).json(
            new ApiResponse(400, null, "All fields are required")
        );
    }
    try {
        await prisma.applicant.create({
            data: {
                userId,
                postId: Number(postId),
                motivation,
                contribution,
                learningGoals,
                weeklyCommitmentHours,
                longTermInterest
            }
        })
        return res.status(200).json(
            new ApiResponse(200, "Application created successfully")
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }

    }
})

const UpdateApplication = AsyncHandler(async (req, res) => {
    const applicationId = req.params.id;
    const { motivation, contribution, learningGoals, weeklyCommitmentHours, longTermInterest } = req.body

    try {
        // check if application status is pending then only it is updateable 
        const application = await prisma.applicant.findUnique({
            where: {
                id: Number(applicationId),
                applicationStatus: "PENDING"
            }
        });

        if (application) {
            await prisma.applicant.update({
                where: {
                    id: Number(applicationId)
                },
                data: {
                    motivation,
                    contribution,
                    learningGoals,
                    weeklyCommitmentHours,
                    longTermInterest
                }
            })
            return res.status(200).json(
                new ApiResponse(200, "Application updated successfully")
            )
        }


    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }

    }
})

const DeleteApplication = AsyncHandler(async (req, res) => {
    const applicationId = req.params.id;
    try {
        const application = await prisma.applicant.update({
            where: {
                id: Number(applicationId),
                applicationStatus: "PENDING"
            },
            data: {
                isDeleted: true
            }
        })
        return res.status(200).json(
            new ApiResponse(200, "Application deleted successfully")
        )
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
})
// only for author 
const ChangeApplicationStatus = AsyncHandler(async (req, res) => {
    const applicationId = req.params.id;
    const { applicationStatus } = req.body
    try {

        const application = await prisma.applicant.update({
            where: {
                id: Number(applicationId)
            },
            data: {
                applicationStatus
            }
        })
        return res.status(200).json(
            new ApiResponse(200, "Application status updated successfully")
        )
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
})
// based on userId 
const GetAllApplications = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        const applications = await prisma.applicant.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc"
            },
        })
        return res.status(200).json(
            new ApiResponse(200, applications, "Applications fetched successfully")

        )

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
})
// 
const GetApplicationById = AsyncHandler(async (req, res) => {
    const applicationId = req.params.id;
    try {
        const application = await prisma.applicant.findUnique({
            where: {
                id: Number(applicationId)
            }
        })
        return res.status(200).json(
            new ApiResponse(200, application, "Application fetched successfully")
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
})
// only for author 
const GetAllApplicants = AsyncHandler(async (req, res) => {
    const postId = req.params.id;
    const limitParam = req.query.limit;
    const pageParam = req.query.page;
    
    try {
        const limit =
            typeof limitParam === "string" ? parseInt(limitParam) : 10;

        const page =
            typeof pageParam === "string" ? parseInt(pageParam) : 1;

        const skip = (page - 1) * limit;

        const applications = await prisma.applicant.findMany({
            where: {
                postId: Number(postId)
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: limit

        })
        return res.status(200).json(
            new ApiResponse(200, applications, "Applications fetched successfully")
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
    }
})


export {
    NewApplication,
    UpdateApplication,
    DeleteApplication,
    ChangeApplicationStatus,
    GetAllApplications,
    GetApplicationById,
    GetAllApplicants
}



