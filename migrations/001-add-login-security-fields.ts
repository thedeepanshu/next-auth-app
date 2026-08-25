import dotenv from "dotenv";  
import mongoose from "mongoose";

dotenv.config({
  path: ".env.local"
})

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
}

async function migrate() {
    await mongoose.connect(MONGODB_URI!);

    console.log("MONGODB Connected Successfully");

    const result = await mongoose.connection
    .collection("users")
    .updateMany(
      {
        $or: [
          { failedLoginAttempts: { $exists: false } },
          { lockedUntil: { $exists: false } },
        ],
      },
      {
        $set: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }
    );

    console.log(`Matched documents: ${result.matchedCount}`);
    console.log(`Modified documents: ${result.modifiedCount}`);

    await mongoose.disconnect();

    console.log("Migration completed");
}

migrate().catch(async (error) => {
    console.error("Migration failed:", error);

    await mongoose.disconnect();

    process.exit(1);
})