import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { transporter } from '../libs/nodemailer';


const verificationEmail = AsyncHandler(async (req, res) => {
  const { link, email } = req.body;

  const info = await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Verification Email",
    html: `<a href="${link}">Click here to verify your email</a>`,
    text: "Verification Email From Looply",
  });

  return res.status(200).json(
    new ApiResponse(200, info, "Email sent successfully")
  );
});


const logInAlert = AsyncHandler(async (req, res) => {
    const {otp, email} = req.body;
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Login Alert",
            html: `<p>OTP: ${otp}</p>`,
            text: "Login Alert From Looply",
        })
        return new ApiResponse(200, info, "Email sent successfully")
        
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    } 
    
})



export {
    verificationEmail,
    logInAlert
}