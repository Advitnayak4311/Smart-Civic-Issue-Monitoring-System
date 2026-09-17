import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes strictly (No auto-created fallback users)
export const protectRoute = async (req, res, next) => {
  try {
    let token = req.headers.token || req.headers.authorization || req.cookies?.token || req.cookies?.jwt;

    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in or register a citizen account.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret_key_12345");
      const user = await User.findById(decoded.userId || decoded.id).select("-password");
      if (user) {
        req.user = user;
        return next();
      }
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again to access your citizen profile.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "User account not found. Please register a citizen profile.",
    });
  } catch (error) {
    console.log("ProtectRoute Auth Error:", error.message);
    return res.status(500).json({ success: false, message: "Authentication server error." });
  }
};