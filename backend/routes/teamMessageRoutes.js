const express = require("express");
const router = express.Router();

const teamMessageController = require("../controllers/teamMessageController");

router.post("/", teamMessageController.sendMessage);

router.get(
    "/my-team/:profileId",
    teamMessageController.getMyTeam
);

router.get("/:teamId", teamMessageController.getMessages);

module.exports = router;