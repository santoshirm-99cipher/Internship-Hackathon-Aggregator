const db = require("../config/db");

// SEND MESSAGE
exports.sendMessage = (req, res) => {
    const { team_id, sender_id, message } = req.body;

    if (!team_id || !sender_id || !message || !message.trim()) {
        return res.status(400).json({
            message: "Team ID, sender ID and message are required"
        });
    }

    const sql = `
        INSERT INTO team_messages
        (team_id, sender_id, message)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [team_id, sender_id, message.trim()],
        (err, result) => {

            if (err) {
                console.error("Send message error:", err);

                return res.status(500).json({
                    message: "Failed to send message"
                });
            }

            res.status(201).json({
                message: "Message sent successfully",
                messageId: result.insertId
            });
        }
    );
};


// GET TEAM MESSAGES
exports.getMessages = (req, res) => {

    const teamId = Number(req.params.teamId);

    if (!teamId) {
        return res.status(400).json({
            message: "Invalid team ID"
        });
    }

    const sql = `
        SELECT
            tm.id,
            tm.team_id,
            tm.sender_id,
            tm.message,
            tm.created_at,
            tp.name AS sender_name
        FROM team_messages tm
        LEFT JOIN team_profiles tp
            ON tp.id = tm.sender_id
        WHERE tm.team_id = ?
        ORDER BY tm.created_at ASC
    `;

    db.query(sql, [teamId], (err, results) => {

        if (err) {
            console.error("Get messages error:", err);

            return res.status(500).json({
                message: "Failed to fetch messages"
            });
        }

        res.json(results);
    });
};

// GET SHARED TEAM ID
exports.getMyTeam = (req, res) => {
    const profileId = Number(req.params.profileId);

    if (!profileId) {
        return res.status(400).json({
            message: "Invalid profile ID"
        });
    }

    const sql = `
        WITH RECURSIVE team_members AS (

            SELECT id
            FROM team_profiles
            WHERE id = ?

            UNION

            SELECT
                CASE
                    WHEN ti.sender_id = tm.id
                    THEN ti.receiver_id
                    ELSE ti.sender_id
                END
            FROM team_invitations ti
            JOIN team_members tm
                ON ti.sender_id = tm.id
                OR ti.receiver_id = tm.id
            WHERE ti.status = 'accepted'
        )

        SELECT MIN(id) AS team_id
        FROM team_members
    `;

    db.query(sql, [profileId], (err, results) => {

        if (err) {
            console.error("Get team error:", err);

            return res.status(500).json({
                message: "Failed to find team"
            });
        }

        res.json({
            teamId: results[0].team_id
        });
    });
};