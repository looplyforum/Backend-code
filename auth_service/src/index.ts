import {app} from "./main";
import { connectRedis } from "./libs/redis.client";

const PORT = process.env.PORT || 4000;

connectRedis().then(() => {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
});