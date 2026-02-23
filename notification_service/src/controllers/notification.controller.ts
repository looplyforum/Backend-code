import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { resend } from '../libs/resend';



const verificationEmail = AsyncHandler(async (req, res) => {
    try {
        const {link, email} = req.body;
    } catch (error) {
        
    }
})

const logInAlert = AsyncHandler(async (req, res) => {
    
})



export {
    verificationEmail,
    logInAlert
}