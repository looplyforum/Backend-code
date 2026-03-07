import { Worker } from "bullmq";
import { connection } from "../utils/connection.js";
import { prisma } from "../libs/prisma";

const InAppWorker = new Worker(
  "notification-events",
  async job => {
    const { postId, actorId, authorId, type } = job.data;
    
    switch (job.name) {
      case "POST_LIKED":
        await prisma.notification.create({
          data: {
            userId: authorId,
            actorId: actorId,
            type: "POST_LIKED",
            postId: postId,
            message: `Someone liked your post`
          }
        });
        break;

      case "POST_COMMENTED":
        await prisma.notification.create({
          data: {
            userId: authorId,
            actorId: actorId,
            type: "POST_COMMENTED",
            postId: postId,
            message: `Someone commented on your post: ${job.data.content}`
          }
        });
        break;

      case "NEW_APPLICANT":
        await prisma.notification.create({
          data: {
            userId: authorId,
            actorId: job.data.applicantId,
            type: "NEW_APPLICANT",
            postId: postId,
            applicantId: job.data.applicationId,
            message: `New applicant for your post`
          }
        });
        break;

      case "APPLICATION_STATUS_CHANGED":
        await prisma.notification.create({
          data: {
            userId: job.data.userId,
            actorId: authorId,
            type: "APPLICATION_STATUS_CHANGED",
            postId: postId,
            message: `Your application status has been updated to ${job.data.status}`
          }
        });
        break;

      case "POST_PUBLISHED":
        try {
            const { postId, fieldOfInterest, authorId } = job.data;
            const interests = fieldOfInterest.join(",");
            const response = await fetch(`http://auth:4000/users-by-interests?interests=${interests}`);
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                const notificationsData = result.data
                    .filter((u: any) => u.id !== authorId) // Don't notify the author
                    .map((u: any) => ({
                        userId: u.id,
                        actorId: authorId,
                        type: "POST_PUBLISHED" as any,
                        postId: postId,
                        message: `New post published in your interest area: ${fieldOfInterest.join(", ")}`
                    }));
                
                if (notificationsData.length > 0) {
                    await prisma.notification.createMany({
                        data: notificationsData
                    });
                }
            }
        } catch (error) {
            console.error("Failed to process POST_PUBLISHED notification:", error);
        }
        break;
    }
  },
  { connection }
);


InAppWorker.on("completed", job => {
  console.log(`InApp job ${job.id} completed`);
});

InAppWorker.on("failed", (job, err) => {
  console.error(`InApp job ${job?.id} failed:`, err);
});
