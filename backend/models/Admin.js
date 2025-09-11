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
    // Only hash if it's not already hashed (for new passwords)
    // Check if it's already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!this.passwordHash.match(/^\$2[aby]\$/)) {
      const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    return false;
  }
};

// Remove password from JSON output
adminSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.passwordHash;
  return adminObject;
};

// Index for performance
adminSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('Admin', adminSchema);
