import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    console.log("Connecting to:", `${process.env.MONGODB_URI}/SCMSC`);

    mongoose.connection.on("connected", () => {
      console.log("Database Connected");
      console.log("Database Name:", mongoose.connection.name);
      console.log("Host:", mongoose.connection.host);
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/SCMSC`);
  } catch (error) {
    console.log(error);
  }
};