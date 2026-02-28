import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { prisma } from '../libs/prisma';
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import axios from "axios";


// logical layer of auth service
const GenerateToken = (userId: number) => {
    try {
<<<<<<< HEAD
        return JWT.sign(
            { id: userId },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );
=======
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
>>>>>>> 7a3bf30 (WIP: saving changes in auth serivce)
    } catch (error) {
        throw new ApiError(500, "Error generating token");
    }
};

const RegisterUser = AsyncHandler(async (req, res, next) => {
    try {
        const { firstName, email, phone, password } = req.body;
        if (!firstName || !email || !phone || !password) {
            throw new ApiError(400, "Required fields are missing");
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }]
            }
        });
        if (existingUser) { //check for user deleted or not
            throw new ApiError(400, "User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                firstName,
                email,
                phone,
                password: hashedPassword
            }
        });
        const token = GenerateToken(user.id);
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json(
            new ApiResponse(201, { user: { id: user.id, email: user.email, firstName: user.firstName } }, "User registered successfully")
        );
    } catch (error) {
        next(error);
    }
});

const LoginUser = AsyncHandler(async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;

        if (!(email || phone) || !password) {
            throw new ApiError(400, "Email or Phone and password are required");
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || undefined },
                    { phone: phone || undefined }
                ]
            }
        });
        if (!user) {
            throw new ApiError(400, "Invalid credentials");
        }
        if (user.isDeleted) {
            throw new ApiError(400, "Account does not exist");
        }
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );
        if (!isPasswordValid) {
            throw new ApiError(400, "Invalid credentials");
        }
        const token = GenerateToken(user.id);
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json(
            new ApiResponse(200, { user: { id: user.id, email: user.email, firstName: user.firstName } }, "Login Successful")
        );
    } catch (error) {
        next(error);
    }
});

const LoginUser = AsyncHandler(async (req, res) => {
    try {
        const { email, phone, password } = req.body;


const LogOutUser = AsyncHandler(async (req, res, next) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax"
        });
        return res.status(200).json(
            new ApiResponse(200, null, "Logged out successfully")
        );
    } catch (error) {
        next(error);
    }
});

const VerifyUser = AsyncHandler(async (req, res) => {
    try {
        const { token } = req.query;
        const userId = req.user.id;
        console.log(token);

const UpdateUserProfile = AsyncHandler(async (req, res) => {
    //User can update their profile information like name, email, phone number and set profile picture once they are logged in.
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

const DeleteUser = AsyncHandler(async (req, res) => {
    //Is this going to be permanent delete or soft delete?
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