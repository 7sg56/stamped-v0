#!/usr/bin/env node

/**
 * Validation script to verify project foundation setup
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating project foundation setup...\n');

// Check required files
const requiredFiles = [
  'package.json',
  'server.js',
  'config/db.js',
  'config/middleware.js',
  'models/index.js',
  'routes/index.js'
];

// Check .env file in root directory
const envPath = path.join(__dirname, '../../.env');

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allFilesExist = false;
  }
});

// Check .env file separately
if (fs.existsSync(envPath)) {
  console.log(`✅ .env - exists (in root directory)`);
} else {
  console.log(`❌ .env - missing`);
  allFilesExist = false;
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = require('../package.json');
const requiredDeps = [
  'express',
  'mongoose',
  'dotenv',
  'cors',
  'bcryptjs',
  'jsonwebtoken',
  'qrcode',
  'nodemailer',
  'exceljs'
];

let allDepsInstalled = true;

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - v${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - missing`);
    allDepsInstalled = false;
  }
});

// Check environment variables
console.log('\n🔧 Checking environment configuration...');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

let allEnvVarsSet = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - configured`);
  } else {
    console.log(`❌ ${envVar} - missing`);
    allEnvVarsSet = false;
  }
});

// Final validation
console.log('\n' + '='.repeat(50));
if (allFilesExist && allDepsInstalled && allEnvVarsSet) {
  console.log('🎉 Project foundation setup is complete and valid!');
  console.log('✅ All required files exist');
  console.log('✅ All dependencies are installed');
  console.log('✅ All environment variables are configured');
  process.exit(0);
} else {
  console.log('❌ Project foundation setup has issues:');
  if (!allFilesExist) console.log('   - Some required files are missing');
  if (!allDepsInstalled) console.log('   - Some dependencies are missing');
  if (!allEnvVarsSet) console.log('   - Some environment variables are missing');
  process.exit(1);
}