import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function restoreOriginalAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const originalEmail = 'rajpratikrrp@gmail.com';
    const tempEmail = 'admin@crunchley.com';
    const newPassword = 'Pratik@9546';

    console.log('\n📋 Current Database State:\n');

    // Check original account
    const originalAccount = await User.findOne({ email: originalEmail });
    if (originalAccount) {
      console.log(`✓ Original account found: ${originalEmail}`);
      console.log(`  - Name: ${originalAccount.name}`);
      console.log(`  - Role: ${originalAccount.role}`);
      console.log(`  - Active: ${originalAccount.isActive}`);
      console.log(`  - Created: ${originalAccount.createdAt}`);
    } else {
      console.log(`✗ Original account NOT found: ${originalEmail}`);
    }

    // Check temporary account
    const tempAccount = await User.findOne({ email: tempEmail });
    if (tempAccount) {
      console.log(`\n✓ Temporary account found: ${tempEmail}`);
      console.log(`  - Name: ${tempAccount.name}`);
      console.log(`  - Role: ${tempAccount.role}`);
      console.log(`  - Active: ${tempAccount.isActive}`);
      console.log(`  - Created: ${tempAccount.createdAt}`);
    } else {
      console.log(`\n✗ Temporary account NOT found: ${tempEmail}`);
    }

    console.log('\n🔄 Starting restoration process...\n');

    // Step 1: Ensure original account exists (if not, create it)
    let original = originalAccount;
    if (!original) {
      console.log('⚠️  Creating original account (it did not exist)...');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      original = await User.create({
        name: 'Rajpratik',
        email: originalEmail,
        passwordHash,
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Original account created');
    } else {
      // Step 2: Update original account to ensure admin role and active status
      console.log('Updating original account...');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await User.updateOne(
        { email: originalEmail },
        {
          $set: {
            passwordHash,
            role: 'admin',
            isActive: true,
          },
        }
      );
      console.log('✅ Original account updated:');
      console.log('  - Password hash updated');
      console.log('  - Role set to: admin');
      console.log('  - Active status: true');
    }

    // Step 3: Delete temporary account
    if (tempAccount) {
      console.log(`\nDeleting temporary account: ${tempEmail}...`);
      const deleteResult = await User.deleteOne({ email: tempEmail });
      if (deleteResult.deletedCount > 0) {
        console.log('✅ Temporary account deleted');
      } else {
        console.log('✗ Failed to delete temporary account');
      }
    } else {
      console.log(`\n✓ Temporary account already removed`);
    }

    console.log('\n📋 Final Database State:\n');

    // Verify final state
    const finalOriginal = await User.findOne({ email: originalEmail });
    if (finalOriginal) {
      console.log(`✓ Original account: ${originalEmail}`);
      console.log(`  - Name: ${finalOriginal.name}`);
      console.log(`  - Role: ${finalOriginal.role}`);
      console.log(`  - Active: ${finalOriginal.isActive}`);
      console.log(`  - Password hash: ${finalOriginal.passwordHash.substring(0, 20)}...`);
    }

    const finalTemp = await User.findOne({ email: tempEmail });
    if (!finalTemp) {
      console.log(`✓ Temporary account removed: ${tempEmail}`);
    } else {
      console.log(`✗ Temporary account still exists: ${tempEmail}`);
    }

    // Count total admins
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`\n📊 Total admin accounts: ${adminCount}`);

    console.log('\n✅ Restoration complete!\n');
    console.log('🔐 Original account credentials:');
    console.log(`  Email:    ${originalEmail}`);
    console.log(`  Password: ${newPassword}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

restoreOriginalAdmin();
