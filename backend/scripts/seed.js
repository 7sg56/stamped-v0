#!/usr/bin/env node

/**
 * Standalone database seeding script
 * 
 * Usage:
 *   npm run seed              - Run all seeds
 *   node scripts/seed.js      - Run all seeds
 *   npm run seed:admin        - Run admin seeding only
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { runSeeds, seedAdmin } = require('../seed/adminSeeder');

/**
 * Main seeding function
 */
const main = async () => {
  try {
    console.log('🚀 Standalone Database Seeding Script');
    console.log('='.repeat(50));
    
    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    // Connect to database
    console.log('📊 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully');
    
    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'admin':
        console.log('🔧 Running admin seeding only...');
        await seedAdmin();
        break;
      default:
        console.log('🔧 Running all seeds...');
        await runSeeds();
        break;
    }
    
    console.log('='.repeat(50));
    console.log('🎉 Seeding completed successfully');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('='.repeat(50));
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📊 Database connection closed');
    }
    process.exit(0);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Run the main function
main();