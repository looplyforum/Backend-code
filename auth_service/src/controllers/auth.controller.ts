import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { prisma } from '../libs/prisma';
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";


// logical layer of auth service
const GenerateToken = () => {
    try {

    } catch (error) {

    }
};

const RegisterUser = AsyncHandler(async (req, res) => {
});


const LoginUser = AsyncHandler(async (req, res) => {
});


const LogOutUser = AsyncHandler(async (req, res) => {
});


const UpdateUserProfile = AsyncHandler(async (req, res) => {
});


const ForgotPassword = AsyncHandler(async (req, res) => {
});


const UpdateProfilePicture = AsyncHandler(async (req, res) => {
});


const DeleteUser = AsyncHandler(async (req, res) => {
});


const VerifyUser = AsyncHandler(async (req, res) => {
});


const LoginWithGoogle = AsyncHandler(async (req, res) => {
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
    VerifyUser
};