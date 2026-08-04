import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // This ensures the password isn't accidentally sent back in API responses
    },
    role: {
      type: String,
      enum: ['seeker', 'employer', 'admin'],
      default: 'seeker',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt dates
  }
);

// Pre-save hook to encrypt password before saving it to the database
userSchema.pre('save', async function (next) {
  // If the password wasn't changed, skip hashing
  if (!this.isModified('password')) {
    next();
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Custom method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;