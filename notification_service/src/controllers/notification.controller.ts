import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { EmailQueue } from "../libs/queue";
import { prisma } from "../libs/prisma";

const getNotifications = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: "desc" }
        });
        return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
    } catch (error) {
        if (error instanceof ApiError) {
             return res.status(error.statusCode).json(error);
        }
    }
});

const markAsRead = AsyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const notification = await prisma.notification.update({
            where: { id: String(id), userId: Number(userId) },
            data: { isRead: true }
        });
        return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
    } catch (error) {
        if (error instanceof ApiError) {
             return res.status(error.statusCode).json(error);
        }
    }
});

const verificationEmail = AsyncHandler(async (req, res) => {
  const { link, email } = req.body;
    
    await EmailQueue.add("verification-email", {
        link,
        email
    },
{
    attempts: 5,
    backoff: {
        type: "exponential",
        delay: 2000
    }
});

  return res.status(200).json(
    new ApiResponse(200, "Email sent successfully")
  );
});

const logInAlert = AsyncHandler(async (req, res) => {
    const {otp, email} = req.body;
    try {
        await EmailQueue.add("login-alert", {
            otp,
            email
        },
    {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 2000
        }
    });
      return res.status(200).json(
        new ApiResponse(200, "Login alert sent successfully")
      );

    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }
    } 
    
})

export {
    verificationEmail,
    logInAlert,
    getNotifications,
    markAsRead
}
