import {Server} from "socket.io";
import { Express } from "express";
import http from "http";



const userSocketMap: Record<string, string> = {};

export const addUserSocket = (userId: string, socketId: string) => {
  userSocketMap[userId] = socketId;
}

let io: Server;

export const initializeSocket = (app: Express) => {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId as string] = socket.id;
      // Also join a private room for the user themselves for 1-on-1 notifications if needed
      socket.join(userId.toString());
    }
    console.log(`A user connected with ID: ${userId}, Socket ID: ${socket.id}`);

    // Allow user to join specific chat rooms
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
    });

    // Allow user to leave specific chat rooms
    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${userId} left room: ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`A user disconnected with ID: ${userId}`);
      if (userId) delete userSocketMap[userId as string];
    });
  });

  return server;
};

export const emitToUser = (id: string, event: string, data: any) => {
  if (io) {
    // If id is a roomId, it will emit to all in room. 
    // If id is a userId, it will emit to that user (since they joined their own userId room).
    io.to(id).emit(event, data);
  }
};


