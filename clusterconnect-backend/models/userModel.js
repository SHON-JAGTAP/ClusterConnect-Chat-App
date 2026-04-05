const { mongoose } = require("../config/db");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "offline",
      enum: ["online", "offline", "away"],
    },
  },
  { timestamps: true }
);

// Hash password before saving if it's new or modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);

async function findUserByEmail(email) {
  // .lean() returns a plain JS object — password becomes a raw string,
  // not a Mongoose field object that breaks bcrypt.compare()
  return await User.findOne({ email }).lean();
}

async function createUser(email, name, password = null) {
  const user = await User.create({ email, name, password });
  return user.toObject();
}

async function getUserById(id) {
  return await User.findById(id).select("_id email name createdAt").lean();
}

async function getAllUsers() {
  return await User.find().select("_id email name createdAt").lean();
}

async function verifyPassword(plainPassword, hashedPassword) {
  // Guard: Google OAuth users have no password set
  if (!hashedPassword || typeof hashedPassword !== "string") {
    return false;
  }
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { User, findUserByEmail, createUser, getUserById, getAllUsers, verifyPassword };
