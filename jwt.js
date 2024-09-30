const jwt = require("jsonwebtoken");
require('dotenv').config();


const jwtAuthMiddleware = (req, res, next) => {
  // First check request headers has authorization or not
  const authorization = req.headers.authorization;
 
  
  if (!authorization) return res.status(401).json({ error: "Token not found" });

  //Extract the jwt  tokenfrom the request
  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Attach the user information to the request object
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Function to generate JWT token
const generateToken = (userData) => {
  //Generate a new JWT tokenusing usesr data
  return jwt.sign(userData, process.env.JWT_SECRET,{ expiresIn: '1h'});
};

module.exports = { jwtAuthMiddleware, generateToken };
