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
import adminRouter from "./routes/adminRoutes.js"; // <-- NEW
import serviceConfigRoutes from "./routes/serviceConfigRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
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
app.use("/api/admin", adminRouter); // <-- NEW
app.use("/api/service-config", serviceConfigRoutes);
app.use("/api/departments", departmentRoutes);

await connectDB();
console.log(listEndpoints(app));
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});