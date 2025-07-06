import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.set("debug", true);
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
