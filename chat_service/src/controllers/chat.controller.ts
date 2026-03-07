import { Request, Response } from "express";
import AsyncHandler from "../utils/AsyncHandler";
import { prisma } from "../libs/prisma";

export const createRoom = AsyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user?.id;
  const { name, type, receiverId, postId } = req.body; // receiverId used for P2P

  if (!ownerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsedOwnerId = Number(ownerId);

  // Handle P2P room creation/retrieval
  if (type === "P2P") {
    if (!receiverId) {
      return res
        .status(400)
        .json({ message: "Receiver ID is required for P2P chat" });
    }
    const parsedReceiverId = Number(receiverId);

    // Check if P2P room exists
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        type: "P2P",
        members: {
          every: {
            userId: { in: [parsedOwnerId, parsedReceiverId] },
          },
        },
      },
      include: { members: true },
    });

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          ownerId: parsedOwnerId,
          type: "P2P",
          members: {
            create: [{ userId: parsedOwnerId }, { userId: parsedReceiverId }],
          },
        },
        include: { members: true },
      });
    }

    return res.status(200).json({ message: "P2P room retrieved", chatRoom });
  }

  // Handle Group Room (PUBLIC/PRIVATE)
  const chatRoom = await prisma.chatRoom.create({
    data: {
      name,
      ownerId: parsedOwnerId,
      postId: postId ? Number(postId) : null,
      type: type || "PUBLIC",
      members: {
        create: [{ userId: parsedOwnerId }],
      },
    },
    include: { members: true },
  });

  return res
    .status(201)
    .json({ message: "Room created successfully", chatRoom });
});

export const joinRoom = AsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { roomId } = req.params;

  if (!userId || !roomId) {
    return res
      .status(400)
      .json({ message: "User ID and Room ID are required" });
  }

  const parsedUserId = Number(userId);

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId as string },
  });

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  if (room.type === "PRIVATE") {
    return res
      .status(403)
      .json({ message: "Cannot join private room without invitation" });
  }

  const membership = await prisma.roomMember.upsert({
    where: {
      userId_roomId: {
        userId: parsedUserId,
        roomId: roomId as string,
      },
    },
    update: {},
    create: {
      userId: parsedUserId,
      roomId: roomId as string,
    },
  });

  return res
    .status(200)
    .json({ message: "Joined room successfully", membership });
});

export const getUserChatRooms = AsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const parsedUserId = Number(userId);

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId: parsedUserId },
        },
      },
      include: {
        members: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "User chat rooms retrieved successfully",
      chatRooms,
    });
  },
);

export const addMemberToRoomByPost = AsyncHandler(
  async (req: Request, res: Response) => {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required" });
    }

    const parsedUserId = Number(userId);
    const parsedPostId = Number(postId);

    // Find the room for this post
    const room = await prisma.chatRoom.findUnique({
      where: { postId: parsedPostId },
    });

    if (!room) {
      return res
        .status(404)
        .json({ message: "Chat room for this post not found" });
    }

    const membership = await prisma.roomMember.upsert({
      where: {
        userId_roomId: {
          userId: parsedUserId,
          roomId: room.id as string,
        },
      },
      update: {},
      create: {
        userId: parsedUserId,
        roomId: room.id as string,
      },
    });

    return res
      .status(200)
      .json({ message: "Member added successfully", membership });
  },
);
