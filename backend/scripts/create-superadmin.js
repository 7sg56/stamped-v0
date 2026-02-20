const mongoose = require('mongoose');
const path = require('path');
const readline = require('readline');

// Load environment variables
// Try to find .env file in parent directory or current directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');
const connectDB = require('../config/db');

// Check if running directly
if (require.main === module) {
  run();
}

async function run() {
  try {
    // Check if required env vars are present
    if (!process.env.MONGODB_URI) {
       console.error('❌ MONGODB_URI is not defined in environment variables.');
       process.exit(1);
    }

    // Connect to database
    await connectDB();

    const username = process.env.SUPERADMIN_USERNAME;
    let password = process.env.SUPERADMIN_PASSWORD;

    if (!username) {
      console.error('❌ SUPERADMIN_USERNAME environment variable is required.');
      process.exit(1);
    }

    // Check if superadmin exists
    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      console.log(`⚠️  Superadmin '${username}' already exists.`);

      // If password provided in env, we might want to update it silently or ask?
      // Logic: If password in env, update it? Or just leave it?
      // The original vulnerability was automatic reset.
      // So if password is in env, we can update it if the user wants.
      // But if running manually, we can be more interactive.

      if (password) {
          console.log("Password provided in environment variable.");
          // We can just update it if provided, or ask confirmation.
          // Since this is a manual script now, let's ask or just do it if env is explicit.
          // But to be safe and avoid accidental resets, let's prompt even if env has it, unless a flag is passed?
          // For simplicity: If password is in env, update it. If not, prompt.
          // Wait, if I want to "fix" automatic reset, I should not automatically reset even if env is set, UNLESS this script is run.
          // Since this script is run MANUALLY, implies intent. So if I run `SUPERADMIN_PASSWORD=newpass node script.js`, I intend to update it.

          const salt = await bcrypt.genSalt(12);
          existingAdmin.passwordHash = await bcrypt.hash(password, salt);
          await existingAdmin.save();
          console.log(`✅ Superadmin '${username}' password updated from environment variable.`);
      } else {
          const answer = await promptQuestion('Do you want to update the password? (y/N): ');
          if (answer.toLowerCase() === 'y') {
            password = await promptPassword('Enter new superadmin password: ');
            if (password) {
                const salt = await bcrypt.genSalt(12);
                existingAdmin.passwordHash = await bcrypt.hash(password, salt);
                await existingAdmin.save();
                console.log(`✅ Superadmin '${username}' password updated.`);
            } else {
                console.log('Password update cancelled.');
            }
          } else {
            console.log('Existing superadmin unchanged.');
          }
      }

    } else {
      console.log(`Creating new superadmin '${username}'...`);

      if (!password) {
        password = await promptPassword('Enter superadmin password: ');
      }

      if (!password) {
         console.error('❌ Password is required.');
         process.exit(1);
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const admin = new Admin({
        username: username,
        passwordHash: hashedPassword,
        role: 'superadmin'
      });
      await admin.save();
      console.log(`✅ Superadmin '${username}' created successfully.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    // console.error(error.stack);
  } finally {
    // Close readline interface if open (handled in promptQuestion but good practice)
    await mongoose.connection.close(); // Use connection.close() instead of disconnect() for clarity
    console.log('👋 Database disconnected');
    process.exit(0);
  }
}

function promptQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

function promptPassword(query) {
    return promptQuestion(query);
}
