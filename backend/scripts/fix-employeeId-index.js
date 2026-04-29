/**
 * Fix script: Drop the non-sparse employeeId_1 index on hrmsDB.users
 * and recreate it as sparse so multiple documents can have null employeeId.
 *
 * Run with:  node scripts/fix-employeeId-index.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/hrmsDB";

async function fixIndex() {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // List current indexes
    const indexes = await collection.indexes();
    console.log("\nCurrent indexes on 'users' collection:");
    indexes.forEach(idx => console.log(" -", JSON.stringify(idx)));

    // Drop the bad index if it exists
    const badIndex = indexes.find(idx => idx.name === "employeeId_1");
    if (badIndex) {
        if (badIndex.sparse) {
            console.log("\n✅ Index 'employeeId_1' already has sparse:true — no fix needed.");
        } else {
            console.log("\n⚠️  Found non-sparse 'employeeId_1' index. Dropping it...");
            await collection.dropIndex("employeeId_1");
            console.log("✅ Dropped old index.");

            // Recreate as sparse + unique
            await collection.createIndex(
                { employeeId: 1 },
                { unique: true, sparse: true, name: "employeeId_1" }
            );
            console.log("✅ Recreated 'employeeId_1' as unique + sparse.");
        }
    } else {
        console.log("\n⚠️  Index 'employeeId_1' not found — Mongoose will create it correctly on next startup.");
    }

    await mongoose.disconnect();
    console.log("\nDone. Restart your backend server.");
}

fixIndex().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
