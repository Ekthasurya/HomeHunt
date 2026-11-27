
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    role: {
      type: String,
      enum: ["buyer", "agent", "admin"],
      default: "buyer"
    },

    avatar: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // Soft deletion timestamp
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (
  enteredPassword
) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
