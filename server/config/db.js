import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import ServiceConfig from "../models/ServiceConfig.js";

import Department from "../models/Department.js";

const seedInitialServiceRules = async () => {
  try {
    // 1. Seed Municipal Departments
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log("Seeding comprehensive municipal departments...");
      await Department.insertMany([
        { name: "Water Supply & Sewerage Board" },
        { name: "Drainage & Stormwater Division" },
        { name: "Roads & Highway Dept" },
        { name: "Public Works Dept (PWD)" },
        { name: "Electrical & Energy Dept" },
        { name: "Power Distribution & Grid Division" },
        { name: "Sanitation & Waste Management" },
        { name: "Public Health & Hygiene Dept" },
        { name: "Enforcement & Anti-Littering Squad" },
        { name: "Animal Husbandry & Veterinary Services" },
        { name: "Emergency Forestry & Pruning Squad" },
        { name: "Parks & Recreation Department" },
        { name: "Town Planning & Building Control" },
        { name: "Traffic Infrastructure & Signals Division" },
        { name: "Public Transit Infrastructure Dept" },
      ]);
      console.log("Municipal departments seeded successfully ✅");
    }

    // 2. Seed Service Rules & Categories
    const count = await ServiceConfig.countDocuments();
    if (count < 15) {
      console.log("Seeding comprehensive production service configuration rules...");
      const rules = [
        // Roads & Infrastructure
        { category: "Roads & Infrastructure", subcategory: "Pothole / Road Damage", department: "Roads & Highway Dept", priority: "High", isActive: true },
        { category: "Roads & Infrastructure", subcategory: "Broken Footpath / Divider", department: "Public Works Dept (PWD)", priority: "Medium", isActive: true },
        { category: "Roads & Infrastructure", subcategory: "Road Marking & Signage Missing", department: "Traffic Infrastructure & Signals Division", priority: "Low", isActive: true },
        { category: "Roads & Infrastructure", subcategory: "Bridge / Culvert Structural Damage", department: "Public Works Dept (PWD)", priority: "Emergency", isActive: true },

        // Sanitation & Waste Management
        { category: "Sanitation & Garbage", subcategory: "Uncollected Street Garbage", department: "Sanitation & Waste Management", priority: "High", isActive: true },
        { category: "Sanitation & Garbage", subcategory: "Overflowing Dustbin / Waste", department: "Sanitation & Waste Management", priority: "Medium", isActive: true },
        { category: "Sanitation & Garbage", subcategory: "Illegal Dumping / Black Spot", department: "Enforcement & Anti-Littering Squad", priority: "High", isActive: true },
        { category: "Sanitation & Garbage", subcategory: "Public Toilet Maintenance & Hygiene", department: "Public Health & Hygiene Dept", priority: "Medium", isActive: true },

        // Water Supply & Sewage
        { category: "Water Supply & Drainage", subcategory: "Water Pipe Burst / Leakage", department: "Water Supply & Sewerage Board", priority: "High", isActive: true },
        { category: "Water Supply & Drainage", subcategory: "Contaminated Drinking Water", department: "Water Supply & Sewerage Board", priority: "Emergency", isActive: true },
        { category: "Water Supply & Drainage", subcategory: "Clogged Storm Drain", department: "Drainage & Stormwater Division", priority: "High", isActive: true },
        { category: "Water Supply & Drainage", subcategory: "Underground Sewage Overflow", department: "Drainage & Stormwater Division", priority: "Emergency", isActive: true },

        // Electrical & Energy
        { category: "Electrical & Lighting", subcategory: "Damaged Electric Pole / Wire", department: "Electrical & Energy Dept", priority: "High", isActive: true },
        { category: "Electrical & Lighting", subcategory: "Streetlight Outage", department: "Electrical & Energy Dept", priority: "Medium", isActive: true },
        { category: "Electrical & Lighting", subcategory: "Transformer Sparking / Hazard", department: "Power Distribution & Grid Division", priority: "Emergency", isActive: true },

        // Public Safety & Animal Control
        { category: "Public Safety & Animal Control", subcategory: "Stray Dog Nuisance & Aggression", department: "Animal Husbandry & Veterinary Services", priority: "Medium", isActive: true },
        { category: "Public Safety & Animal Control", subcategory: "Cattle Blocking Traffic / Stray Animals", department: "Animal Husbandry & Veterinary Services", priority: "Medium", isActive: true },

        // Parks, Trees & Horticulture
        { category: "Parks, Trees & Horticulture", subcategory: "Fallen Tree Blocking Road", department: "Emergency Forestry & Pruning Squad", priority: "High", isActive: true },
        { category: "Parks, Trees & Horticulture", subcategory: "Overhanging Dangerous Tree Branch", department: "Emergency Forestry & Pruning Squad", priority: "Medium", isActive: true },
        { category: "Parks, Trees & Horticulture", subcategory: "Park Maintenance & Broken Equipment", department: "Parks & Recreation Department", priority: "Low", isActive: true },

        // Town Planning & Building Violation
        { category: "Town Planning & Building", subcategory: "Illegal Construction / Violation", department: "Town Planning & Building Control", priority: "High", isActive: true },
        { category: "Town Planning & Building", subcategory: "Footpath Encroachment", department: "Town Planning & Building Control", priority: "High", isActive: true },
      ];

      for (const rule of rules) {
        await ServiceConfig.updateOne(
          { subcategory: rule.subcategory },
          { $set: rule },
          { upsert: true }
        );
      }

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