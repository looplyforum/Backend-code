import jwt from "jsonwebtoken";
import AsyncHandler from "./AsyncHandler";





const verifyToken = AsyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  
  if (!accessToken) {
    return res.status(401).json({ message: "Access token not found" });
  }

  try {
    // Try verifying access token
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string,
    )

    req.user = decoded;
    return next();

  } catch (error: any) {

    // If access token expired → try refresh
    if (error.name !== "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      );
      if (!(decoded as any).id) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

   
      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: (decoded as any).id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1d" },
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      });
      req.user = decoded;
      return next();

    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  }
});

export { verifyToken };