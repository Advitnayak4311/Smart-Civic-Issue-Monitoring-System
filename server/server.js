import dotenv from "dotenv";
import listEndpoints from "express-list-endpoints";
dotenv.config({ path: "./.env" });

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db.js";

import userRouter from "./routes/userRoutes.js";
import complaintRouter from "./routes/complaintRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import serviceConfigRoutes from "./routes/serviceConfigRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import gisRoutes from "./routes/gisRoutes.js";
import transparencyRoutes from "./routes/transparencyRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

const PORT = process.env.PORT || 8000;

// Body parser limits set to 100mb to support high-resolution photo & video evidence uploads
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.137.219:5173",
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/auth", userRouter);
app.use("/api/complaint", complaintRouter);
app.use("/api/admin", adminRouter);
app.use("/api/service-config", serviceConfigRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/gis", gisRoutes);
app.use("/api/transparency", transparencyRoutes);
app.use("/api/ai", aiRoutes);

// Global Error Handler to catch body-parser offset/payload errors gracefully
app.use((err, req, res, next) => {
  if (err) {
    console.error("Express Error Middleware caught:", err.message);
    if (
      err.type === "entity.too.large" ||
      err.message?.includes("offset") ||
      err.message?.includes("out of range") ||
      err.code === "ERR_OUT_OF_RANGE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Media attachment size is too large. Please attach a smaller image or shorter video clip under 12 MB.",
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "An internal server error occurred.",
    });
  }
  next();
});

await connectDB();
console.log(listEndpoints(app));
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});