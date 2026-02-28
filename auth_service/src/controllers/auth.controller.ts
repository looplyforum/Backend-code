import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { prisma } from '../libs/prisma';
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import axios from "axios";

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
        throw error;
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
        const { email, phone, password, fieldOfStudy, fieldOfInterest, dateOfBirth } = req.body;

        if (!email || !phone || !password || !fieldOfInterest || !fieldOfStudy || !dateOfBirth) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }],
                isDeleted: false,
            },
        });

        if (existingUser) {
            throw new ApiError(409, "User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                dateOfBirth,
                fieldOfInterest,
                fieldOfStudy,
                email,
                phone,
                password: hashedPassword,
                isVerified: true // change it after email service impliments 
            },
        });
        // send email to verify user through email link
        const link = GenerateVerificationLink(user.id);

        // issue while sending emailq
        const verificationEmail = await axios.post(
            "http://notification:4000/verification-email",
            { link, email }
        ).catch(error => {
            console.error("Email service error:", error);
        });

        res.status(201).json(
            new ApiResponse(201, { id: user.id }, "User registered successfully")
        );

    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error, "Something went wrong While Registering User"));

    }
});

const LoginUser = AsyncHandler(async (req, res) => {
    try {
        const { email, phone, password } = req.body;


        if (!email && !phone) {
            throw new ApiError(400, "Email or phone number is required");
        }

        if (!password) {
            throw new ApiError(400, "Password is required");
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    ...(email ? [{ email }] : []),
                    ...(phone ? [{ phone }] : []),

                ].filter(Boolean),
                isDeleted: false,
            },
        });

        if (!user) {
            throw new ApiError(401, "Invalid credentials");
        }
        // TODO: After email verification only 
        // if (!user.isVerified) {
        //     throw new ApiError(403, "Please verify your email first");
        // }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            throw new ApiError(401, "Invalid credentials");
        }
        // TODO: send otp to verify user 

        const { accessToken, refreshToken } = await GenerateToken(user.id);

        res.cookie("accessToken", accessToken, {
            ...options,
            maxAge: 15 * 60 * 1000, // 15 min
        });

        res.cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json(
            new ApiResponse(200, userWithoutPassword, "User logged in successfully")
        );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    }
});

const VerifyUser = AsyncHandler(async (req, res) => {
    try {
        const { token } = req.query;
        const userId = req.user.id;
        console.log(token);

        if (!token) {
            throw new ApiError(400, "Token is required");
        }

        await prisma.user.update({
            where: { id: userId },
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

        const userId = req;
        console.log(userId);

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
    const data = req.body;
    const userId = req.user.id;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data
        });
        return res.status(200).json(
            new ApiResponse(200, user, "User updated successfully")
        );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const ForgotPassword = AsyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        // send email with otp 
        // then change password

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

const UpdateProfilePicture = AsyncHandler(async (req, res) => {
    try {
        const profilePicture = req.file;
        console.log(profilePicture);
        // store locally and update in db

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
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
        console.log(req);

        const user = await prisma.user.findFirst({
            where: { id: Number(userId) },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true,
                collegeName: true,
                yearOfJoining: true,
                yearOfPassing: true,
                dateOfBirth: true,
                fieldOfInterest: true,
                fieldOfStudy: true,
                username: true,
                studentId: true,
                phone: true
            }
        });
        return res.status(200).json(new ApiResponse(200, user, "User Fetched Successfully"))

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    }
});

// TODO 
const LoginWithGoogle = AsyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, "Login With Google Is Under Development"))

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error)
        }
    }
});

export {
    RegisterUser,
    LoginUser,
    LogOutUser,
    UpdateUserProfile,
    ForgotPassword,
    UpdateProfilePicture,
    DeleteUser,
    LoginWithGoogle,
    VerifyUser,
    GetUser,
};