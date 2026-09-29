const express = require("express");

const router = express.Router();

const invitationController =
    require("../controllers/invitationController");


// ==========================================
// SEND TEAM INVITATION
// ==========================================
router.post(
    "/",
    invitationController.sendInvitation
);


// ==========================================
// GET RECEIVED INVITATIONS
// ==========================================
router.get(
    "/received/:receiverId",
    invitationController.getReceivedInvitations
);


// ==========================================
// ACCEPT / DECLINE INVITATION
// ==========================================
router.put(
    "/:id/status",
    invitationController.updateInvitationStatus
);

router.get("/sent/:senderId", invitationController.getSentInvitations);

module.exports = router;