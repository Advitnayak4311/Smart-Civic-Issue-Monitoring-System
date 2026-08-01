import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import ServiceConfig from "../models/ServiceConfig.js";

const seedInitialServiceRules = async () => {
  try {
    const count = await ServiceConfig.countDocuments();
    if (count === 0) {
      console.log("Seeding initial production service configuration rules...");
      await ServiceConfig.insertMany([
        {
          category: "Roads & Infrastructure",
          subcategory: "Pothole / Road Damage",
          department: "Roads & Highway Dept",
          priority: "High",
          isActive: true,
        },
        {
          category: "Roads & Infrastructure",
          subcategory: "Broken Footpath / Divider",
          department: "Public Works Dept",
          priority: "Medium",
          isActive: true,
        },
        {
          category: "Sanitation & Garbage",
          subcategory: "Overflowing Dustbin / Waste",
          department: "Sanitation & Waste Management",
          priority: "Medium",
          isActive: true,
        },
        {
          category: "Sanitation & Garbage",
          subcategory: "Uncollected Street Garbage",
          department: "Sanitation & Waste Management",
          priority: "High",
          isActive: true,
        },
        {
          category: "Water Supply & Drainage",
          subcategory: "Water Pipe Burst / Leakage",
          department: "Water Supply & Sewerage Board",
          priority: "High",
          isActive: true,
        },
        {
          category: "Water Supply & Drainage",
          subcategory: "Clogged Storm Drain",
          department: "Drainage & Sewerage Dept",
          priority: "High",
          isActive: true,
        },
        {
          category: "Electrical & Lighting",
          subcategory: "Streetlight Outage",
          department: "Electrical & Energy Dept",
          priority: "Medium",
          isActive: true,
        },
        {
          category: "Electrical & Lighting",
          subcategory: "Damaged Electric Pole / Wire",
          department: "Electrical & Energy Dept",
          priority: "High",
          isActive: true,
        },
      ]);
      console.log("Service configuration rules seeded successfully ✅");
    }
  } catch (seedErr) {
    console.log("Seeding note:", seedErr.message);
  }
};

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
      ? `${process.env.MONGODB_URI.replace(/\/$/, "")}/SCMSC`
      : "mongodb://127.0.0.1:27017/SCMSC";

    console.log("Attempting database connection to:", mongoUri);

    mongoose.connection.on("connected", () => {
      console.log("Database Connected Successfully ✅");
      console.log("Database Name:", mongoose.connection.name);
      console.log("Host:", mongoose.connection.host);
      seedInitialServiceRules();
    });

    // Set 3-second timeout for primary connection attempt
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
  } catch (error) {
    console.log("Primary MongoDB Connection failed. Starting embedded in-memory MongoDB server...");
    try {
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: "SCMSC",
        },
      });
      const uri = mongod.getUri();
      console.log("Embedded In-Memory MongoDB Server running at:", uri);
      await mongoose.connect(uri);
      await seedInitialServiceRules();
    } catch (memError) {
      console.error("In-Memory MongoDB start error:", memError);
    }
  }
};