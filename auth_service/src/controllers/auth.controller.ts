import { Request, Response } from "express";
import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { prisma } from '../libs/prisma';
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { ForgotPasswordSchema, LoginSchema, RegisterSchema, UpdateProfileSchema } from "../libs/zodClient"

import emailQueue from "../libs/email.queue"
import { redisClient } from '../libs/redis.client';

// logical layer of auth service
const GenerateToken = async (UserId: number) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: UserId
            }
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = JWT.sign(
            { id: user.id },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "1d" }
        );
        const refreshToken = JWT.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken
            }
        });

        return { accessToken, refreshToken };

    } catch (error) {
        throw error
    }
};

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,

};

const GenerateVerificationLink = (id: number) => {
    const verificationToken = JWT.sign(
        { userId: id },
        process.env.VERIFICATION_TOKEN_SECRET as string,
        { expiresIn: "1d" }
    );
    return `${process.env.BASE_URL}/auth/verify-user?token=${verificationToken}`;
};

const RegisterUser = AsyncHandler(async (req, res) => {
    try {
        console.log("Registration attempt:", req.body);
        const { email, phone, password, dateOfBirth } = req.body;

        if (!email || !phone || !password || !dateOfBirth) {
            throw new ApiError(400, "Required fields: email, phone, password, dateOfBirth");
        }
        const { error, data } = RegisterSchema.safeParse(req.body)
        if (error) {
            console.log("Registration validation error:", error.format());
            throw new ApiError(400, error.issues[0].message);
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: data.email?.toLowerCase() }, { phone: data.phone }],
                isDeleted: false,
            },
        });

        // if user exist but isDeleted is true then we can allow user to register with same email or phone number
        if (existingUser) {
            throw new ApiError(409, "User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                dateOfBirth: new Date(data.dateOfBirth),
                fieldOfInterest: data.fieldOfInterest,
                fieldOfStudy: data.fieldOfStudy,
                email: data.email?.toLowerCase(),
                phone: data.phone,
                password: hashedPassword,
                isVerified:true
            },
        });
        // send email to verify user through email link
        const link = GenerateVerificationLink(user.id);

        // issue while sending emailq
        const job = await emailQueue.add("verification-email", {
            link,
            email: data.email?.toLowerCase()
        },
            {
                jobId: `verification-email-${user.id}`,
                attempts: 5,
                backoff: {
                    type: "exponential",
                    delay: 2000
                }
            }
        )

        console.log("Email job added:", job.id);
        res.status(201).json(
            new ApiResponse(201, { id: user.id }, "User registered successfully")
        );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
        return res.status(500).json(
            new ApiResponse(500, null, "Something went wrong")
        );
    }
});

const LoginUser = AsyncHandler(async (req, res) => {

    try {
        const { email, phone, password } = req.body;


        if (!email && !phone) {
            return res.status(400).json(new ApiResponse(400, null, "Email or phone number is required"));
        }

        if (!password) {
            return res.status(400).json(new ApiResponse(400, null, "Password is required"));
        }
        const { error, data } = LoginSchema.safeParse(req.body)
        if (error) {
            return res.status(400).json(new ApiResponse(400, null, error.message));
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(data.email ? [{ email: data.email }] : []),
                    ...(data.phone ? [{ phone: data.phone }] : []),

                ].filter(Boolean),
                isDeleted: false,
            },
        });

        if (!user) {
            return res.status(404).json(new ApiResponse(404, null, "User not found"));
        }
        // TODO: After email verification only 
        if (!user.isVerified) {
            throw new ApiError(403, "Please verify your email first");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in Redis with 5 min expiry
        await redisClient.set(`otp:${user.id}`, otp, {
            EX: 300 // 5 minutes
        });

        // Queue OTP email
        await emailQueue.add("login-alert", {
            otp,
            email: user.email
        });

        return res.status(200).json(
            new ApiResponse(200, { userId: user.id }, "OTP sent to your email. Please verify.")
        );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    }
});

const VerifyUser = AsyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({
            message: "Verification token is required",
        });
    }
    try {
        const decoded = JWT.verify(
            token as string,
            process.env.VERIFICATION_TOKEN_SECRET as string
        ) as { userId: number };

        await prisma.user.update({
            where: { id: decoded.userId },
            data: { isVerified: true },
        });

        return res.status(200).json({
            message: "Email verified successfully",
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const LogOutUser = AsyncHandler(async (req, res) => {
    try {

        await prisma.user.update({
            where: { id: req.user.id },
            data: { refreshToken: null }
        });

        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);

        return res.status(200).json(
            new ApiResponse(200, {}, "Logged out successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const UpdateUserProfile = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        const { error, data } = UpdateProfileSchema.safeParse(req.body)
        if (error) {
            throw new ApiError(400, error.message);
        }
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
            }
        });
        return res.status(200).json(
            new ApiResponse(200, user, "User profile updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const ForgotPassword = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        const { error, data } = ForgotPasswordSchema.safeParse(req.body)
        if (error) {
            throw new ApiError(400, error.message);
        }
        // TODO

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const UpdateProfilePicture = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const profilePicture = req.file;

    try {
        if (!profilePicture) {
            return res.status(400).json(
                new ApiResponse(400, null, "Profile picture is required")
            );
        }

        const imageUrl = profilePicture.path;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { profilePicture: imageUrl }
        });
        return res.status(200).json(
            new ApiResponse(200, user.profilePicture, "Profile picture updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            )
        }
    }
});

const DeleteUser = AsyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.user.update({
            where: { id: userId },
            data: { isDeleted: true }
        });

        return res.status(200).json(
            new ApiResponse(200, {}, "Your account has been deleted")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const GetUser = AsyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findFirst({
            where: { id: Number(userId) }
        });
        return res.status(200).json(new ApiResponse(200, user, "User Fetched Successfully"))

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    }
});

const GetUserById = AsyncHandler(async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const user = await prisma.user.findUnique({
            where: { id: Number(targetUserId) }
        });
        if (!user) {
             return res.status(404).json(new ApiResponse(404, null, "User Not Found"));
        }
        return res.status(200).json(new ApiResponse(200, user, "User Fetched Successfully"))
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    }
});

const GetUsersByInterests = AsyncHandler(async (req, res) => {
    try {
        const { interests } = req.query;
        if (!interests) {
            return res.status(400).json(new ApiResponse(400, null, "Interests are required"));
        }
        const interestArray = (interests as string).split(",");
        const users = await prisma.user.findMany({
            where: {
                fieldOfInterest: {
                    hasSome: interestArray
                },
                isDeleted: false
            },
            select: {
                id: true,
                email: true
            }
        });
        return res.status(200).json(new ApiResponse(200, users, "Users Fetched Successfully"))
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    }
});

const LoginWithGoogle = AsyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, "Login With Google Is Under Development"))

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const VerifyOTP = AsyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
    try {
        if (!userId || !otp) {
            throw new ApiError(400, "User ID and OTP are required");
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!user) {
            throw new ApiError(404, "User Not Found");
        }

        const storedOtp = await redisClient.get(`otp:${userId}`);

        if (!storedOtp) {
            throw new ApiError(400, "OTP expired or not found");
        }

        if (storedOtp !== otp) {
            throw new ApiError(400, "Invalid OTP");
        }

        // OTP is valid, delete it from Redis
        await redisClient.del(`otp:${userId}`);

        const { accessToken, refreshToken } = await GenerateToken(user.id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken }, "OTP verified successfully")
            );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
        return res.status(500).json(
            new ApiResponse(500, null, "Something went wrong during OTP verification")
        );
    }
});



export {
    RegisterUser,
    LoginUser,
    VerifyOTP,
    LogOutUser,
    UpdateUserProfile,
    ForgotPassword,
    UpdateProfilePicture,
    DeleteUser,
    LoginWithGoogle,
    VerifyUser,
    GetUser,
    GetUserById,
    GetUsersByInterests,
};
