const express = require("express");

const router = express.Router();

const {
    getInternships,
    searchInternships,
    addInternship,
    updateInternship,
    deleteInternship
} = require("../controllers/internshipController");

const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/", getInternships);

router.get("/search", searchInternships);

router.post("/", requireAdmin, addInternship);

router.put("/:id", requireAdmin, updateInternship);

router.delete("/:id", requireAdmin, deleteInternship);

module.exports = router;