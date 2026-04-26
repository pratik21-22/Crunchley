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
    throw new Error("MONGO_URI is missing.");
  }

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

  console.log("\n=== TESTING ADMIN LOGIN ===\n");

  const admin = await User.findOne({ email: "admin@crunchley.com" });
  if (!admin) {
    console.log("ERROR: admin@crunchley.com not found!");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`✓ Admin account found: ${admin.email}`);
  console.log(`✓ Name: ${admin.name}`);
  console.log(`✓ Role: ${admin.role}`);
  console.log(`✓ Password hash exists: ${!!admin.passwordHash}`);

  // Test the known password
  const testPassword = "Crunchley@Admin123";
  const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
  
  console.log(`\nPassword Test:`);
  console.log(`  Password: "${testPassword}"`);
  console.log(`  Result: ${isValid ? "✓ VALID - LOGIN WILL WORK" : "✗ INVALID"}`);

  if (!isValid) {
    console.log("\nERROR: Password hash doesn't match!");
    process.exit(1);
  }

  console.log("\n✓ Admin login should work on production!");

  await mongoose.disconnect();
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
