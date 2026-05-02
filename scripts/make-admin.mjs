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

function parseArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function printUsage() {
  console.log("Usage:");
  console.log("  npm run make-admin -- --email=admin@example.com --name='Admin User' --password='StrongPass123'");
  console.log("  npm run make-admin -- --email=existing@example.com --promote-only");
}

async function run() {
  loadDotEnvIfPresent();

  // Safety: never allow this script to run in production
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run make-admin in production environment. Aborting.")
    process.exit(1)
  }

  // Require a secret to be supplied for extra safety. This must be set in .env as MAKE_ADMIN_SECRET
  const expectedSecret = process.env.MAKE_ADMIN_SECRET || ""
  const providedSecret = parseArg("secret") || process.env.MAKE_ADMIN_SECRET_CLI || ""

  if (!expectedSecret) {
    console.error(
      "MAKE_ADMIN_SECRET is not configured. Set MAKE_ADMIN_SECRET in your environment (e.g., in .env) to run this script."
    )
    process.exit(1)
  }

  if (providedSecret !== expectedSecret) {
    console.error(
      "Invalid or missing secret. Usage: MAKE_ADMIN_SECRET=<secret> npm run make-admin -- --email=admin@example.com --password=pass --secret=<secret>"
    )
    process.exit(1)
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Set it in .env before running make-admin.");
  }

  const emailInput = parseArg("email").trim().toLowerCase();
  const nameInput = parseArg("name").trim();
  const passwordInput = parseArg("password");
  const promoteOnly = hasFlag("promote-only");

  if (!emailInput) {
    printUsage();
    throw new Error("--email is required.");
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

  const existing = await User.findOne({ email: emailInput });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`Promoted existing user to admin: ${emailInput}`);
    } else {
      console.log(`User is already admin: ${emailInput}`);
    }

    await mongoose.disconnect();
    return;
  }

  if (promoteOnly) {
    await mongoose.disconnect();
    throw new Error("User not found to promote. Remove --promote-only and provide --password to create a new admin.");
  }

  if (!passwordInput || passwordInput.length < 8) {
    await mongoose.disconnect();
    throw new Error("--password is required for new admin and must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(passwordInput, 12);

  await User.create({
    name: nameInput || "Admin",
    email: emailInput,
    passwordHash,
    role: "admin",
  });

  console.log(`Created admin user: ${emailInput}`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
