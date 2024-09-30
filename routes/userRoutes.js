const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

const checkAdmin = async ()=>{
  const response = await User.find();

  const hasAdmin = response.some(entity => entity.role === 'admin');

if (hasAdmin) {
  return true;
}

return false;
}

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data);
    if(checkAdmin){
      if(newUser.role === 'admin'){
        console.log("Admin already exist");
        return res.status(400).json({message:"Admin already exists"})
      }
      
    }
    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id
    };

    console.log("Payload: ", JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is: ", token);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server mahesh Error" });
  }
});

//Login Route
router.post("/login", async (req, res) => {
  try {
    //Extract username and password from the request bodu;
    const { aadharCardNumber, password } = req.body;

    //Find the user by username
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: "Invalid usesrname or password" });
    }

    //generate token;
    const payload = {
      id: user.id
    };

    const token = generateToken(payload);

    //Return token as response
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({error:'Internal server error'})
    
  }
});


router.put("/profile/password",jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user; // Extract the id from the token
    const {currentPassword,newPassword} = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    // if password odes not match, return error
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(401).json({ error: "Invalid usesrname or password" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save()


    console.log("Password updatedd");
    res.status(200).json({message:'password updated'});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:workType", async (req, res) => {
  let workType = req.params.workType;
  try {
    if (workType == "chef" || workType == "waiter" || workType == "manager") {
      const response = await Person.find({ work: workType });
      console.log("response successfully fetched");
      res.status(200).json(response);
    } else {
      res.status(400).json({ error: "Invalid Work Type" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
