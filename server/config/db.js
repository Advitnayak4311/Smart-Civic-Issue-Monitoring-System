import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import ServiceConfig from "../models/ServiceConfig.js";
import Department from "../models/Department.js";
import Complaint from "../models/Complaint.js";

const seedInitialServiceRules = async () => {
  try {
    // Sanitize any existing pending complaints so they do not hold premature ratings
    await Complaint.updateMany(
      { citizenVerified: "Pending" },
      { $set: { citizenRating: null, citizenComment: "" } }
    );

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

    // 2. Seed Master Service Rules matching frontend intake categories
    console.log("Seeding comprehensive production service configuration rules...");
    const rules = [
      // Roads & Infrastructure
      { category: "Roads & Infrastructure", subcategory: "Pothole / Road Damage", department: "Roads & Highway Dept", priority: "High", slaHours: 24, isActive: true },
      { category: "Roads & Infrastructure", subcategory: "Broken Footpath / Divider", department: "Public Works Dept (PWD)", priority: "Medium", slaHours: 48, isActive: true },
      { category: "Roads & Infrastructure", subcategory: "Damaged Asphalt / Cracks", department: "Roads & Highway Dept", priority: "Medium", slaHours: 48, isActive: true },
      { category: "Roads & Infrastructure", subcategory: "Missing / Open Manhole Cover", department: "Public Works Dept (PWD)", priority: "High", slaHours: 12, isActive: true },
      { category: "Roads & Infrastructure", subcategory: "Hazardous Speed Breaker", department: "Traffic Infrastructure & Signals Division", priority: "Low", slaHours: 72, isActive: true },
      { category: "Roads & Infrastructure", subcategory: "Other Roads & Infrastructure Issue", department: "Roads & Highway Dept", priority: "Medium", slaHours: 48, isActive: true },

      // Water & Pipeline
      { category: "Water & Pipeline", subcategory: "Water Pipe Burst / Leakage", department: "Water Supply & Sewerage Board", priority: "High", slaHours: 12, isActive: true },
      { category: "Water & Pipeline", subcategory: "Low Water Pressure", department: "Water Supply & Sewerage Board", priority: "Medium", slaHours: 48, isActive: true },
      { category: "Water & Pipeline", subcategory: "Contaminated Water Supply", department: "Water Supply & Sewerage Board", priority: "High", slaHours: 12, isActive: true },
      { category: "Water & Pipeline", subcategory: "No Water Supply in Area", department: "Water Supply & Sewerage Board", priority: "High", slaHours: 24, isActive: true },
      { category: "Water & Pipeline", subcategory: "Sewer Line Overflow", department: "Water Supply & Sewerage Board", priority: "High", slaHours: 24, isActive: true },
      { category: "Water & Pipeline", subcategory: "Other Water & Pipeline Issue", department: "Water Supply & Sewerage Board", priority: "Medium", slaHours: 48, isActive: true },

      // Street Light & Electrical
      { category: "Street Light & Electrical", subcategory: "Streetlight Non-Functional / Outage", department: "Electrical & Energy Dept", priority: "Medium", slaHours: 24, isActive: true },
      { category: "Street Light & Electrical", subcategory: "Damaged Electric Pole", department: "Electrical & Energy Dept", priority: "High", slaHours: 12, isActive: true },
      { category: "Street Light & Electrical", subcategory: "Hanging / Loose Electric Wires", department: "Electrical & Energy Dept", priority: "High", slaHours: 6, isActive: true },
      { category: "Street Light & Electrical", subcategory: "Transformer Sparking / Leakage", department: "Power Distribution & Grid Division", priority: "High", slaHours: 4, isActive: true },
      { category: "Street Light & Electrical", subcategory: "Dark Alley Safety Hazard", department: "Electrical & Energy Dept", priority: "Medium", slaHours: 36, isActive: true },
      { category: "Street Light & Electrical", subcategory: "Other Street Light & Electrical Issue", department: "Electrical & Energy Dept", priority: "Medium", slaHours: 48, isActive: true },

      // Sanitation & Garbage
      { category: "Sanitation & Garbage", subcategory: "Overflowing Dustbin / Dump", department: "Sanitation & Waste Management", priority: "Medium", slaHours: 24, isActive: true },
      { category: "Sanitation & Garbage", subcategory: "Uncollected Street Garbage", department: "Sanitation & Waste Management", priority: "High", slaHours: 18, isActive: true },
      { category: "Sanitation & Garbage", subcategory: "Irregular Door-to-Door Collection", department: "Sanitation & Waste Management", priority: "Medium", slaHours: 48, isActive: true },
      { category: "Sanitation & Garbage", subcategory: "Public Area Street Sweeping", department: "Sanitation & Waste Management", priority: "Low", slaHours: 48, isActive: true },
      { category: "Sanitation & Garbage", subcategory: "Dead Animal Disposal", department: "Sanitation & Waste Management", priority: "High", slaHours: 8, isActive: true },
      { category: "Sanitation & Garbage", subcategory: "Other Sanitation & Garbage Issue", department: "Sanitation & Waste Management", priority: "Medium", slaHours: 48, isActive: true },

      // Drainage & Sewerage
      { category: "Drainage & Sewerage", subcategory: "Clogged Stormwater Drain", department: "Drainage & Stormwater Division", priority: "High", slaHours: 24, isActive: true },
      { category: "Drainage & Sewerage", subcategory: "Rainwater Drainage Overflow", department: "Drainage & Stormwater Division", priority: "High", slaHours: 18, isActive: true },
      { category: "Drainage & Sewerage", subcategory: "Open Sewage Drain Hazard", department: "Drainage & Stormwater Division", priority: "High", slaHours: 12, isActive: true },
      { category: "Drainage & Sewerage", subcategory: "Culvert Blockage", department: "Drainage & Stormwater Division", priority: "High", slaHours: 24, isActive: true },
      { category: "Drainage & Sewerage", subcategory: "Other Drainage & Sewerage Issue", department: "Drainage & Stormwater Division", priority: "Medium", slaHours: 48, isActive: true },

      // Public Health & Hygiene
      { category: "Public Health & Hygiene", subcategory: "Unhygienic Street Food Vendor", department: "Public Health & Hygiene Dept", priority: "Medium", slaHours: 48, isActive: true },
      { category: "Public Health & Hygiene", subcategory: "Stagnant Water Breeding Site", department: "Public Health & Hygiene Dept", priority: "High", slaHours: 24, isActive: true },
      { category: "Public Health & Hygiene", subcategory: "Illegal Commercial Waste Disposal", department: "Enforcement & Anti-Littering Squad", priority: "High", slaHours: 24, isActive: true },
      { category: "Public Health & Hygiene", subcategory: "Other Public Health & Hygiene Issue", department: "Public Health & Hygiene Dept", priority: "Medium", slaHours: 48, isActive: true },

      // Other Civic Grievances
      { category: "Other Civic Grievances", subcategory: "Stray Dog / Cattle Nuisance", department: "Animal Husbandry & Veterinary Services", priority: "Medium", slaHours: 48, isActive: true },
      { category: "Other Civic Grievances", subcategory: "Park Maintenance & Broken Bench", department: "Parks & Recreation Department", priority: "Low", slaHours: 72, isActive: true },
      { category: "Other Civic Grievances", subcategory: "Tree Fall / Hazardous Branch", department: "Emergency Forestry & Pruning Squad", priority: "High", slaHours: 12, isActive: true },
      { category: "Other Civic Grievances", subcategory: "Footpath Encroachment / Illegal Construction", department: "Town Planning & Building Control", priority: "High", slaHours: 36, isActive: true },
      { category: "Other Civic Grievances", subcategory: "General Civic Complaint", department: "General Department", priority: "Low", slaHours: 72, isActive: true },
    ];

    for (const rule of rules) {
      await ServiceConfig.updateOne(
        { subcategory: rule.subcategory },
        { $set: rule },
        { upsert: true }
      );
    }

    console.log("Service configuration rules seeded successfully ✅");
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

    mongoose.connection.once("connected", () => {
      console.log("Database Connected Successfully ✅");
      console.log("Database Name:", mongoose.connection.name);
      console.log("Host:", mongoose.connection.host);
      seedInitialServiceRules();
    });

    // Set 2-second timeout for primary connection attempt
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
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
    } catch (memError) {
      console.error("In-Memory MongoDB start error:", memError);
    }
  }
};