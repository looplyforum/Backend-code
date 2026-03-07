import { Request, Response } from "express";
import AsyncHandler from "../utils/AsyncHandler";
import { prisma } from "../libs/prisma";
import { emitToUser } from "../utils/socket";

export const sendMessage = AsyncHandler(async (req: Request, res: Response) => {
  const senderId = req.user?.id;
  const { roomId, content } = req.body;

  if (!senderId || !roomId || !content) {
    return res
      .status(400)
      .json({ message: "Sender ID, Room ID, and Content are required" });
  }

  const parsedSenderId = Number(senderId);

  // Verify membership
  const membership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: parsedSenderId,
        roomId: roomId as string,
      },
    },
  });

  if (!membership) {
    return res
      .status(403)
      .json({ message: "You are not a member of this room" });
  }

  // Save the message to DB
  const newMessage = await prisma.chatMessage.create({
    data: {
      senderId: parsedSenderId,
      roomId: roomId as string,
      content,
    },
  });

  // Emit the message to the room in real time
  // room name in socket.io will be the roomId
  emitToUser(roomId, "receive_message", newMessage);

  return res.status(201).json({
    message: "Message sent successfully",
    chatMessage: newMessage,
  });
});

export const getChatHistory = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { roomId } = req.params;

    if (!userId || !roomId) {
      return res
        .status(400)
        .json({ message: "User ID and Room ID are required" });
    }

    const parsedUserId = Number(userId);

    // Verify membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId: parsedUserId,
          roomId: roomId as string,
        },
      },
    });

    if (!membership) {
      return res
        .status(403)
        .json({ message: "You are not a member of this room" });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId: roomId as string,
      },
      orderBy: {
        createdAt: "asc", // Oldest to newest
      },
    });

    return res.status(200).json({
      message: "Chat history retrieved successfully",
      messages,
    });
  },
);
