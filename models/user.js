const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    required: true,
    default: "voter",
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function(next) {
  const person = this;

  //Hash the password only if it has been modified (or is new)
  if (!person.isModified("password")) return next();

  try {
    // hash password generation
    const salt = await bcrypt.genSalt(10);

    //hash password
    const hashedPassword = await bcrypt.hash(person.password, salt);

    person.password = hashedPassword;

    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    return isMatch;
  } catch (error) {
    return error;
  }
};
const User = mongoose.model("User", userSchema);
module.exports = User;
