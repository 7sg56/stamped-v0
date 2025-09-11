const { Admin } = require('../models');

/**
 * Configuration for seeding based on environment
 */
const getSeedConfig = () => {
  const config = {
    // Environment-based seeding configuration
    shouldSeed: process.env.NODE_ENV !== 'production' || process.env.FORCE_SEED === 'true',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    // Additional admin accounts for different environments
    additionalAdmins: []
  };

  // Add development-specific admin accounts
  if (process.env.NODE_ENV === 'development') {
    config.additionalAdmins.push({
      username: 'dev-admin',
      password: 'dev123'
    });
  }

  // Add test-specific admin accounts
  if (process.env.NODE_ENV === 'test') {
    config.additionalAdmins.push({
      username: 'test-admin',
      password: 'test123'
    });
  }

  return config;
};

/**
 * Create a single admin user with proper error handling
 */
const createAdminUser = async (username, password) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    
    if (existingAdmin) {
      console.log(`ℹ️  Admin user '${username}' already exists, skipping...`);
      return existingAdmin;
    }

    // Validate username and password
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Create new admin with proper password hashing
    const admin = new Admin({
      username: username.trim(),
      passwordHash: password // Will be hashed by the pre-save middleware
    });

    await admin.save();
    
    console.log(`✅ Admin user '${username}' created successfully`);
    return admin;
    
  } catch (error) {
    console.error(`❌ Error creating admin user '${username}':`, error.message);
    throw error;
  }
};

/**
 * Seed the database with default admin user(s)
 */
const seedAdmin = async () => {
  try {
    const config = getSeedConfig();
    
    if (!config.shouldSeed) {
      console.log('🚫 Seeding disabled for production environment (set FORCE_SEED=true to override)');
      return;
    }

    console.log('🌱 Starting admin user seeding...');
    
    // Create primary admin user
    await createAdminUser(config.adminUsername, config.adminPassword);
    
    // Create additional environment-specific admin users
    for (const additionalAdmin of config.additionalAdmins) {
      await createAdminUser(additionalAdmin.username, additionalAdmin.password);
    }
    
    // Display seeded accounts summary
    const totalAdmins = await Admin.countDocuments();
    console.log(`📊 Total admin accounts in database: ${totalAdmins}`);
    
  } catch (error) {
    console.error('❌ Error during admin seeding:', error.message);
    // Don't throw the error to prevent server startup failure
    // Just log it and continue
  }
};

/**
 * Seed additional data (placeholder for future expansion)
 */
const seedOtherData = async () => {
  try {
    // Placeholder for seeding other data like sample events, etc.
    // This can be expanded in the future
    console.log('ℹ️  No additional data seeding configured');
  } catch (error) {
    console.error('❌ Error seeding additional data:', error.message);
  }
};

/**
 * Run all seed functions
 */
const runSeeds = async () => {
  try {
    console.log('\n🌱 Database Seeding Started');
    console.log('='.repeat(40));
    
    await seedAdmin();
    await seedOtherData();
    
    console.log('='.repeat(40));
    console.log('✅ Database seeding completed successfully\n');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    console.error('='.repeat(40));
    console.error('⚠️  Server will continue to start, but some functionality may be limited\n');
  }
};

/**
 * Standalone script execution (for manual seeding)
 */
const runSeedsStandalone = async () => {
  // Load environment variables if running as standalone script
  if (require.main === module) {
    require('dotenv').config({ path: '../.env' });
    
    // Connect to database
    const mongoose = require('mongoose');
    
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('📊 Connected to database for seeding');
      
      await runSeeds();
      
      await mongoose.connection.close();
      console.log('📊 Database connection closed');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }
};

// Run standalone if this file is executed directly
runSeedsStandalone();

module.exports = {
  seedAdmin,
  seedOtherData,
  runSeeds,
  createAdminUser,
  getSeedConfig
};
