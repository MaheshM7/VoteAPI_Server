const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate");
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const { use } = require("passport");
const { message } = require("prompt");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (user.role === "admin") {
      return true;
    }
  } catch (error) {
    return false;
  }
};

// Add candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update candidate
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      console.log("admin role not found");

      return res.status(403).json({ message: "User does not have admin role" });
    }
    const candidateId = req.params.candidateId;

    const updatedCandidatedData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      console.log("Candidate not found");
      res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate data updated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Candidate
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }
    const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      console.log("Candidate not found");
      res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate data deleted");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// let's start voting
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  //user can only vote once

  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    // Finding the candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "admin is not allowed" });
    }

    // Updating the candidate document
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    //  Updating the user document
    user.isVoted = true;
    user.save();

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Vote count
router.get('/vote/count',async (req,res)=>{
  try {
    // Find all candidates and sort them by voteCount in descending order
    const candidates = await Candidate.find().sort({voteCount: 'desc'});

    // Map candidates to only return their name and voteCount
    const voteRecord = candidates.map((candidate)=>{
      return{
        party: candidate.party,
        count: candidate.voteCount
      }
    })

    return res.status(200).json(voteRecord);
  } catch (error) {
    
  }
})

router.get('/candidates', async (req,res)=>{
  try {

    // Findnig candidates
    const candidates = await Candidate.find();
    const candidatelist = candidates.map((candidate)=>candidate.name);
    
    return res.status(200).json(candidatelist);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})



module.exports = router;
