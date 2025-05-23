const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/resume-analyzer",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        writeConcern: {
          w: 1,
          j: true,
          wtimeout: 1000,
        },
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
