import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

function loadDotEnvIfPresent() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^"|"$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function run() {
  loadDotEnvIfPresent();

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Set it in .env before running.");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri, { bufferCommands: false });

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 80 },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);

  // Check all users
  console.log("\n=== ALL USERS IN DATABASE ===\n");
  const allUsers = await User.find({});
  console.log(`Total users: ${allUsers.length}\n`);

  for (const user of allUsers) {
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password hash length: ${user.passwordHash.length}`);
    console.log(`Password hash exists: ${!!user.passwordHash}`);
    console.log(`Created: ${user.createdAt}`);
    console.log("---");
  }

  // Look for admin users specifically
  console.log("\n=== ADMIN USERS ===\n");
  const admins = await User.find({ role: "admin" });
  console.log(`Admin users: ${admins.length}`);
  for (const admin of admins) {
    console.log(`  - ${admin.email} (${admin.name})`);
  }

  // Check if any email contains "admin" or "crunchley"
  console.log("\n=== CHECKING FOR LIKELY ADMIN EMAILS ===\n");
  const likelyAdmins = await User.find({
    $or: [
      { email: /admin/i },
      { email: /crunchley/i },
    ]
  });

  console.log(`Emails matching admin patterns: ${likelyAdmins.length}`);
  for (const user of likelyAdmins) {
    console.log(`  - ${user.email} (role: ${user.role})`);
  }

  // Test password verification
  if (admins.length > 0) {
    console.log("\n=== TESTING PASSWORD VERIFICATION ===\n");
    const admin = admins[0];
    console.log(`Testing admin: ${admin.email}`);

    // Try some common passwords
    const testPasswords = [
      "Admin123",
      "admin123",
      "password123",
      "crunchley123",
      "Test@123",
    ];

    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, admin.passwordHash);
      console.log(`  Password "${testPass}": ${isValid ? "✓ VALID" : "✗ invalid"}`);
    }
  }

  await mongoose.disconnect();
  console.log("\nDone!");
}

run().catch(async (error) => {
  console.error("\nError:", error instanceof Error ? error.message : error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
