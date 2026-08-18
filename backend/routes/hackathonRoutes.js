const express = require("express");
const router = express.Router();

const { getHackathons } = require("../controllers/hackathonController");

router.get("/", getHackathons);

module.exports = router;