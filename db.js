const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
// const mongooseURL = process.env.MONGODB_URL;
const mongooseURL = process.env.MONGODB_URL_LOCAL;
mongoose.connect(mongooseURL);

const db = mongoose.connection;

// Event listeners
db.on("error", (error) => {
  console.error("Error in the connection", error);
});

db.on("connected", () => {
  console.log("Database connected");
});

db.on("disconnected", () => {
  console.log("Database disconnected");
});



module.exports = db;
