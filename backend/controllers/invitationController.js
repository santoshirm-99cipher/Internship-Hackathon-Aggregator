const db = require("../config/db");

// ==========================================
// SEND TEAM INVITATION
// ==========================================
exports.sendInvitation = (req, res) => {

    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
        return res.status(400).json({
            message: "Sender and receiver are required"
        });
    }

    if (Number(sender_id) === Number(receiver_id)) {
        return res.status(400).json({
            message: "You cannot invite yourself"
        });
    }

    const checkSql = `
        SELECT id, status
        FROM team_invitations
        WHERE sender_id = ?
        AND receiver_id = ?
        LIMIT 1
    `;

    db.query(
        checkSql,
        [sender_id, receiver_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Check invitation error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check invitation"
                });
            }

            if (results.length > 0) {

                return res.status(400).json({
                    message: "Invitation already sent",
                    status: results[0].status
                });
            }

            const insertSql = `
                INSERT INTO team_invitations
                (sender_id, receiver_id, status)
                VALUES (?, ?, 'Pending')
            `;

            db.query(
                insertSql,
                [sender_id, receiver_id],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Send invitation error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to send invitation"
                        });
                    }

                    res.status(201).json({
                        message: "Invitation sent successfully",
                        invitationId: result.insertId
                    });

                }
            );
        }
    );
};


// ==========================================
// GET RECEIVED INVITATIONS
// ==========================================
exports.getReceivedInvitations = (req, res) => {

    const receiverId = Number(req.params.receiverId);

    if (!receiverId) {
        return res.status(400).json({
            message: "Receiver ID is required"
        });
    }

    const sql = `
        SELECT
            ti.id,
            ti.sender_id,
            ti.receiver_id,
            ti.status,
            ti.created_at,

            sender.name AS sender_name,
            sender.role AS sender_role,
            sender.skills AS sender_skills,
            sender.availability AS sender_availability,
            sender.communication AS sender_communication,
            sender.experience AS sender_experience

        FROM team_invitations ti

        JOIN team_profiles sender
            ON ti.sender_id = sender.id

        WHERE ti.receiver_id = ?

        ORDER BY ti.created_at DESC
    `;

    db.query(
        sql,
        [receiverId],
        (err, results) => {

            if (err) {

                console.error(
                    "Get received invitations error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch invitations"
                });
            }

            res.json(results);
        }
    );
};


// ==========================================
// UPDATE INVITATION STATUS
// ==========================================
exports.updateInvitationStatus = (req, res) => {

    const invitationId = Number(req.params.id);

    const {
        receiver_id,
        status
    } = req.body;

    if (!invitationId || !receiver_id || !status) {

        return res.status(400).json({
            message: "Invitation ID, receiver ID and status are required"
        });
    }

    const allowedStatuses = [
        "Accepted",
        "Declined"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message: "Invalid invitation status"
        });
    }

    const checkSql = `
        SELECT id, status
        FROM team_invitations
        WHERE id = ?
        AND receiver_id = ?
        LIMIT 1
    `;

    db.query(
        checkSql,
        [invitationId, receiver_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Check invitation status error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check invitation"
                });
            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: "Invitation not found"
                });
            }

            if (results[0].status !== "Pending") {

                return res.status(400).json({
                    message:
                        `Invitation is already ${results[0].status}`
                });
            }

            const updateSql = `
                UPDATE team_invitations
                SET status = ?
                WHERE id = ?
                AND receiver_id = ?
            `;

            db.query(
                updateSql,
                [
                    status,
                    invitationId,
                    receiver_id
                ],
                (err) => {

                    if (err) {

                        console.error(
                            "Update invitation error:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update invitation"
                        });
                    }

                    res.json({
                        message:
                            `Invitation ${status.toLowerCase()} successfully`,
                        status: status
                    });

                }
            );
        }
    );
};
// =====================================================
// Get invitations sent by a user
// =====================================================
exports.getSentInvitations = (req, res) => {

    const senderId = Number(req.params.senderId);

    if (!senderId) {
        return res.status(400).json({
            message: "Invalid sender ID"
        });
    }

    const sql = `
        SELECT
            ti.id,
            ti.sender_id,
            ti.receiver_id,
            ti.status,
            tp.name,
            tp.role,
            tp.skills,
            tp.availability,
            tp.communication,
            tp.experience,
            u.email
        FROM team_invitations ti

        JOIN team_profiles tp
            ON tp.id = ti.receiver_id

        LEFT JOIN users u
            ON u.id = tp.user_id

        WHERE ti.sender_id = ?

        ORDER BY ti.id DESC
    `;

    db.query(sql, [senderId], (err, results) => {

        if (err) {

            console.error(
                "Get sent invitations error:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch sent invitations"
            });
        }

        res.json(results);
    });
};