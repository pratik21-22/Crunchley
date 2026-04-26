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

  console.log("=== PRODUCTION ADMIN LOGIN DIAGNOSTIC ===\n");

  // Check environment variables
  console.log("1. ENVIRONMENT VARIABLES:");
  const mongoUri = process.env.MONGO_URI;
  const authSecret = process.env.AUTH_SECRET;
  const authUrl = process.env.AUTH_URL;

  console.log(`   MONGO_URI: ${mongoUri ? "✓ SET" : "✗ MISSING"}`);
  console.log(`   AUTH_SECRET: ${authSecret ? "✓ SET" : "✗ MISSING"}`);
  console.log(`   AUTH_URL: ${authUrl ? "✓ SET" : "✗ MISSING"}`);

  if (!mongoUri) {
    console.log("\n❌ MONGO_URI is missing. Cannot connect to database.");
    process.exit(1);
  }

  if (!authSecret) {
    console.log("\n❌ AUTH_SECRET is missing. Authentication will fail.");
    process.exit(1);
  }

  // Test database connection
  console.log("\n2. DATABASE CONNECTION:");
  try {
    console.log("   Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { bufferCommands: false });
    console.log("   ✓ Connected successfully");
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  // Check admin account
  console.log("\n3. ADMIN ACCOUNT VERIFICATION:");
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

  const adminEmail = "admin@crunchley.com";
  const adminPassword = "Crunchley@Admin123";

  try {
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log(`   ❌ Admin account '${adminEmail}' not found in database`);
      console.log("   This suggests the deployed app is using a different database.");
      process.exit(1);
    }

    console.log(`   ✓ Admin account found: ${admin.email}`);
    console.log(`   ✓ Name: ${admin.name}`);
    console.log(`   ✓ Role: ${admin.role}`);
    console.log(`   ✓ Password hash exists: ${!!admin.passwordHash}`);
    console.log(`   ✓ Created: ${admin.createdAt}`);

    // Test password verification
    console.log("\n4. PASSWORD VERIFICATION:");
    const isValid = await bcrypt.compare(adminPassword, admin.passwordHash);
    console.log(`   Testing password: "${adminPassword}"`);
    console.log(`   Result: ${isValid ? "✓ VALID" : "❌ INVALID"}`);

    if (!isValid) {
      console.log("   ❌ Password hash doesn't match - this should not happen!");
      console.log("   Possible causes:");
      console.log("   - bcrypt version mismatch between local and production");
      console.log("   - Password hash corruption during deployment");
      console.log("   - Environment-specific bcrypt behavior");
      process.exit(1);
    }

    console.log("\n5. SIMULATING LOGIN API:");
    // Simulate the exact login API logic
    const query = { email: adminEmail.toLowerCase() };
    const user = await User.findOne(query);

    if (!user) {
      console.log("   ❌ User lookup failed (this shouldn't happen)");
      process.exit(1);
    }

    const passwordValid = await bcrypt.compare(adminPassword, user.passwordHash);
    if (!passwordValid) {
      console.log("   ❌ Password validation failed");
      process.exit(1);
    }

    console.log("   ✓ User lookup successful");
    console.log("   ✓ Password validation successful");
    console.log("   ✓ Login should work in production");

  } catch (error) {
    console.log(`   ❌ Database error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  await mongoose.disconnect();

  console.log("\n=== DIAGNOSTIC COMPLETE ===");
  console.log("✓ All checks passed - admin login should work on production");
  console.log("If login still fails, check:");
  console.log("1. Vercel environment variables are set correctly");
  console.log("2. Latest deployment includes this database change");
  console.log("3. Vercel function logs for any runtime errors");
  console.log("4. Network connectivity from Vercel to MongoDB Atlas");
}

run().catch(async (error) => {
  console.error("\nUnexpected error:", error instanceof Error ? error.message : error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
