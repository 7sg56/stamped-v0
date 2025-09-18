const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    validate: [
      {
        validator: function(value) {
          return value && value.length > 0;
        },
        message: 'Username cannot be empty'
      },
      {
        validator: function(value) {
          return !value || (value.length >= 3 && value.length <= 50);
        },
        message: 'Username must be between 3 and 50 characters'
      },
      {
        validator: function(value) {
          const usernameRegex = /^[a-zA-Z0-9_-]+$/;
          return !value || usernameRegex.test(value);
        },
        message: 'Username can only contain letters, numbers, underscores, and hyphens'
      }
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function(value) {
        return value && value.length > 0;
      },
      message: 'Password cannot be empty'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    console.log('🔍 Hashing password for user:', this.username);
    console.log('🔍 Password is already hashed:', this.passwordHash.match(/^\$2[aby]\$/) ? 'YES' : 'NO');
    
    // Only hash if it's not already hashed (for new passwords)
    // Check if it's already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!this.passwordHash.match(/^\$2[aby]\$/)) {
      console.log('🔍 Hashing new password...');
      const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
      console.log('🔍 Password hashed successfully');
    } else {
      console.log('🔍 Password already hashed, skipping...');
    }
    next();
  } catch (error) {
    console.error('🔍 Error hashing password:', error);
    next(error);
  }
});

// Prevent role escalation - only allow superadmin role through hardcoded method
adminSchema.pre('save', async function(next) {
  // If this is a new document and role is being set to superadmin
  if (this.isNew && this.role === 'superadmin') {
    // Check if this is the hardcoded superadmin username from environment
    const superAdminUsername = process.env.SUPERADMIN_USERNAME;
    if (this.username !== superAdminUsername) {
      return next(new Error('Superadmin role can only be assigned to the hardcoded superadmin username'));
    }
  }
  
  // If this is an existing document and role is being changed to superadmin
  if (!this.isNew && this.isModified('role') && this.role === 'superadmin') {
    const superAdminUsername = process.env.SUPERADMIN_USERNAME;
    if (this.username !== superAdminUsername) {
      return next(new Error('Superadmin role can only be assigned to the hardcoded superadmin username'));
    }
  }
  
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔍 Comparing passwords:');
    console.log('🔍 Candidate password:', candidatePassword);
    console.log('🔍 Stored hash starts with:', this.passwordHash.substring(0, 10) + '...');
    console.log('🔍 Hash length:', this.passwordHash.length);
    
    const result = await bcrypt.compare(candidatePassword, this.passwordHash);
    console.log('🔍 Bcrypt comparison result:', result);
    return result;
  } catch (error) {
    console.error('🔍 Error in password comparison:', error);
    return false;
  }
};

// Check if admin is superadmin
adminSchema.methods.isSuperAdmin = function() {
  console.log('🔍 isSuperAdmin check - Role:', this.role);
  const result = this.role === 'superadmin';
  console.log('🔍 isSuperAdmin result:', result);
  return result;
};

// Remove password from JSON output
adminSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.passwordHash;
  return adminObject;
};

// Static method to create hardcoded superadmin user from environment variables
// This is the ONLY way to create superadmin users - no registration allowed
adminSchema.statics.createSuperAdmin = async function() {
  const superAdminUsername = process.env.SUPERADMIN_USERNAME;
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

  console.log('🔍 Checking environment variables:');
  console.log('SUPERADMIN_USERNAME:', superAdminUsername ? 'SET' : 'NOT SET');
  console.log('SUPERADMIN_PASSWORD:', superAdminPassword ? 'SET' : 'NOT SET');

  // Only create superadmin if environment variables are set
  if (!superAdminUsername || !superAdminPassword) {
    console.log('⚠️  SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD not set in environment variables');
    console.log('Please add these to your .env file:');
    console.log('SUPERADMIN_USERNAME=superadmin');
    console.log('SUPERADMIN_PASSWORD=SuperAdmin123!');
    return;
  }

  const existingAdmin = await this.findOne({ username: superAdminUsername });
  console.log('🔍 Existing admin found:', existingAdmin ? 'YES' : 'NO');
  
  if (!existingAdmin) {
    console.log('🔍 Creating new superadmin...');
    const admin = new this({
      username: superAdminUsername,
      password: superAdminPassword,
      role: 'superadmin'
    });
    await admin.save();
    console.log(`✅ Created hardcoded superadmin: ${superAdminUsername}`);
  } else {
    console.log('🔍 Existing admin found, updating password...');
    console.log('🔍 Current role:', existingAdmin.role);
    
    // Force update the password to ensure it matches the environment variable
    existingAdmin.passwordHash = superAdminPassword; // This will trigger the pre-save hash
    existingAdmin.role = 'superadmin';
    await existingAdmin.save();
    console.log(`✅ Updated superadmin password and role: ${superAdminUsername}`);
  }
};

// Index for performance
adminSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);