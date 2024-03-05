import mongoose from "mongoose";
import dotenv from "dotenv/config";
require("dotenv").config();


const MONGODB_URI = process.env.MONGODB_URI as string;

const connectDB = async () => {
  try {    
    const data = await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected with", data.connection.host);
  } catch (error:any) {
    console.log(error);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
