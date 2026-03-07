import { Worker } from "bullmq";
import { transporter } from "../libs/nodemailer.js";
import { connection } from "../utils/connection.js";

const EmailWorker = new Worker(
  "email-queue",
  async job => {
    switch (job.name) {
      case "verification-email":
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: job.data.email,
          subject: "Verification Email",
          html: `<a href="${job.data.link}">Click here to verify your email</a>`,
          text: "Verification Email From Looply",
        });
        break;

      case "login-alert":
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: job.data.email,
          subject: "Login Alert",
          html: `<p>OTP: ${job.data.otp}</p>`,
          text: "Login Alert From Looply",
        });
        break;

      case "POST_COMMENTED":
        try {
          const { authorId, postId, content } = job.data;
          // Fetch user info from auth_service
          const response = await fetch(`http://auth:4000/users/${authorId}`);
          const result = await response.json();
          if (result.success && result.data.email) {
            await transporter.sendMail({
              from: process.env.EMAIL,
              to: result.data.email,
              subject: "New Comment on your Post",
              html: `<p>Someone commented on your post: "${content}"</p><p>View it here: [link]</p>`,
              text: `New comment on your post: ${content}`,
            });
          }
        } catch (error) {
          console.error("Failed to send comment email:", error);
        }
        break;

      default:
        throw new Error("Unknown job type");
    }
  },
  {
    connection: connection,
  }
);


EmailWorker.on("completed", job => {
  console.log(`Email job ${job.id} completed`);
});

EmailWorker.on("failed", (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
});

