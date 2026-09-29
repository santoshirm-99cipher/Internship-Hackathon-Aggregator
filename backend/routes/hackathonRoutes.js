const express = require("express");

const router = express.Router();

const {
    getHackathons,
    addHackathon,
    updateHackathon,
    deleteHackathon
} = require("../controllers/hackathonController");

const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/", getHackathons);

router.post("/", requireAdmin, addHackathon);

router.put("/:id", requireAdmin, updateHackathon);

router.delete("/:id", requireAdmin, deleteHackathon);

module.exports = router;