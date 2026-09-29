const express = require("express");

const router = express.Router();

const teamController = require("../controllers/teamController");

// Create / update team profile
router.post(
    "/",
    teamController.createTeamProfile
);

// Get all team profiles
router.get(
    "/",
    teamController.getTeamProfiles
);

// Get team profile using logged-in user's ID
router.get(
    "/user/:userId",
    teamController.getProfileByUserId
);

// Get compatible teammates
router.get(
    "/matches/:id",
    teamController.getMatches
);

router.delete(
    "/connections/:profileId/:teammateId",
    teamController.removeConnection
);
router.get("/connections/:profileId", teamController.getConnections);

module.exports = router;