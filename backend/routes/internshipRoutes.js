const express = require("express");
const router = express.Router();

const {
    getInternships,
    searchInternships
} = require("../controllers/internshipController");

router.get("/", getInternships);

router.get("/search", searchInternships);

module.exports = router;