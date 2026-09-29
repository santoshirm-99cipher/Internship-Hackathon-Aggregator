const db = require("../config/db");

// =====================================================
// Save or update team profile
// =====================================================
// =====================================================
// Save or update team profile
// =====================================================
exports.createTeamProfile = (req, res) => {

    const {
        user_id,
        name,
        skills,
        role,
        availability,
        communication,
        experience,
        team_status
    } = req.body;

    if (
        !user_id ||
        !name ||
        !skills ||
        !role ||
        !availability ||
        !communication ||
        !experience
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const finalTeamStatus =
        team_status || "Looking for Team";

    // First check whether this USER already has a profile
    const checkUserSql = `
        SELECT id
        FROM team_profiles
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(checkUserSql, [user_id], (err, results) => {

        if (err) {
            console.error("Check user profile error:", err);

            return res.status(500).json({
                message: "Failed to check existing profile"
            });
        }

        // =================================================
        // USER PROFILE EXISTS → UPDATE
        // =================================================

        if (results.length > 0) {

            const existingId = results[0].id;

            const updateSql = `
                UPDATE team_profiles
                SET
                    name = ?,
                    skills = ?,
                    role = ?,
                    availability = ?,
                    communication = ?,
                    experience = ?,
                    team_status = ?
                WHERE id = ?
            `;

            db.query(
                updateSql,
                [
                    name.trim(),
                    skills,
                    role,
                    availability,
                    communication,
                    experience,
                    finalTeamStatus,
                    existingId
                ],
                (err) => {

                    if (err) {
                        console.error(
                            "Update team profile error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to update team profile"
                        });
                    }

                    return res.json({
                        message: "Team profile updated",
                        profileId: existingId
                    });
                }
            );

            return;
        }

        // =================================================
        // NEW PROFILE → INSERT
        // =================================================

        const insertSql = `
            INSERT INTO team_profiles
            (
                user_id,
                name,
                skills,
                role,
                availability,
                communication,
                experience,
                team_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertSql,
            [
                user_id,
                name.trim(),
                skills,
                role,
                availability,
                communication,
                experience,
                finalTeamStatus
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Team profile error:",
                        err
                    );

                    return res.status(500).json({
                        message: "Failed to save team profile"
                    });
                }

                res.status(201).json({
                    message: "Team profile saved",
                    profileId: result.insertId
                });
            }
        );

    });
};


// =====================================================
// Get all team profiles
// =====================================================
exports.getTeamProfiles = (req, res) => {

    const sql = `
        SELECT *
        FROM team_profiles
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Get team profiles error:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch team profiles"
            });
        }

        res.json(results);
    });
};


// =====================================================
// Get team profile using logged-in user's ID
// =====================================================
exports.getProfileByUserId = (req, res) => {

    const userId = Number(req.params.userId);

    if (!userId) {
        return res.status(400).json({
            message: "Invalid user ID"
        });
    }

    const sql = `
        SELECT *
        FROM team_profiles
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.error(
                "Get profile by user ID error:",
                err
            );

            return res.status(500).json({
                message: "Failed to find team profile"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Team profile not found"
            });
        }

        res.json(results[0]);
    });
};


// =====================================================
// Find compatible teammates
// =====================================================
exports.getMatches = (req, res) => {

    const userId = Number(req.params.id);

    if (!userId) {
        return res.status(400).json({
            message: "Invalid profile ID"
        });
    }

    // Get all OTHER profiles
    const sql = `
        SELECT *
        FROM team_profiles
        WHERE id <> ?
    `;

    db.query(sql, [userId], (err, users) => {

        if (err) {
            console.error("Matching error:", err);

            return res.status(500).json({
                message: "Failed to find teammates"
            });
        }

        // Get current student's profile
        db.query(
            "SELECT * FROM team_profiles WHERE id = ?",
            [userId],
            (err, currentResults) => {

                if (err || currentResults.length === 0) {
                    return res.status(404).json({
                        message: "Profile not found"
                    });
                }

                const current = currentResults[0];

                const currentSkills = current.skills
                    .toLowerCase()
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(Boolean);

                const matches = users
                    .filter(user => Number(user.id) !== userId)
                    .map(user => {

                        let score = 0;
                        let reasons = [];
                        let breakdown = {};

                        // =========================
                        // 1. SKILLS — 25 POINTS
                        // =========================

                        const userSkills = user.skills
                            .toLowerCase()
                            .split(",")
                            .map(skill => skill.trim())
                            .filter(Boolean);

                        const commonSkills = currentSkills.filter(
                            skill => userSkills.includes(skill)
                        );

                        if (commonSkills.length > 0) {

                            breakdown.skills = 25;

                            reasons.push(
                                `✓ Shared skills: ${commonSkills.join(", ")}`
                            );

                        } else {

                            breakdown.skills = 25;

                            reasons.push(
                                "✓ Different skills can strengthen the team"
                            );
                        }

                        score += breakdown.skills;


                        // =========================
                        // 2. ROLE — 25 POINTS
                        // =========================

                        if (
                            current.role &&
                            user.role &&
                            current.role !== user.role
                        ) {

                            breakdown.role = 25;

                            reasons.push(
                                `✓ Strong role combination: ${current.role} + ${user.role}`
                            );

                        } else {

                            breakdown.role = 10;

                            reasons.push(
                                "⚠ Same role — less role diversity"
                            );
                        }

                        score += breakdown.role;


                        // =========================
                        // 3. AVAILABILITY — 20 POINTS
                        // =========================

                        const availabilityDifference =
                            Math.abs(
                                Number(current.availability) -
                                Number(user.availability)
                            );

                        if (availabilityDifference === 0) {

                            breakdown.availability = 20;

                            reasons.push(
                                "✓ Perfect availability match"
                            );

                        } else if (availabilityDifference <= 5) {

                            breakdown.availability = 15;

                            reasons.push(
                                "✓ Similar availability"
                            );

                        } else if (availabilityDifference <= 10) {

                            breakdown.availability = 8;

                            reasons.push(
                                "⚠ Availability is somewhat different"
                            );

                        } else {

                            breakdown.availability = 3;

                            reasons.push(
                                "⚠ Availability differs significantly"
                            );
                        }

                        score += breakdown.availability;


                        // =========================
                        // 4. COMMUNICATION — 15 POINTS
                        // =========================

                        if (
                            current.communication ===
                            user.communication
                        ) {

                            breakdown.communication = 15;

                            reasons.push(
                                "✓ Same communication style"
                            );

                        } else {

                            breakdown.communication = 8;

                            reasons.push(
                                "✓ Different communication styles can complement"
                            );
                        }

                        score += breakdown.communication;


                        // =========================
                        // 5. EXPERIENCE — 15 POINTS
                        // =========================

                        if (
                            current.experience ===
                            user.experience
                        ) {

                            breakdown.experience = 15;

                            reasons.push(
                                "✓ Similar experience level"
                            );

                        } else {

                            breakdown.experience = 10;

                            reasons.push(
                                "✓ Different experience levels can encourage learning"
                            );
                        }

                        score += breakdown.experience;


                        return {
                            ...user,

                            matchScore: Math.min(score, 100),

                            breakdown: {
                                skills: breakdown.skills,
                                role: breakdown.role,
                                availability: breakdown.availability,
                                communication: breakdown.communication,
                                experience: breakdown.experience
                            },

                            reasons: reasons
                        };

                    });


                // Highest chemistry first
                matches.sort(
                    (a, b) =>
                        b.matchScore - a.matchScore
                );

                res.json(
                    matches.slice(0, 5)
                );

            }
        );

    });

};
// =====================================================
// Get connected teammates
// =====================================================
exports.getConnections = (req, res) => {

    const profileId = Number(req.params.profileId);

    if (!profileId) {
        return res.status(400).json({
            message: "Invalid profile ID"
        });
    }

    const sql = `
        SELECT
            tp.id,
            tp.user_id,
            tp.name,
            u.email,
            tp.skills,
            tp.role,
            tp.availability,
            tp.communication,
            tp.experience,
            ti.status
        FROM team_invitations ti
        JOIN team_profiles tp
            ON tp.id = ti.receiver_id
        LEFT JOIN users u
            ON u.id = tp.user_id
        WHERE ti.sender_id = ?
          AND ti.status = 'Accepted'

        UNION

        SELECT
            tp.id,
            tp.user_id,
            tp.name,
            u.email,
            tp.skills,
            tp.role,
            tp.availability,
            tp.communication,
            tp.experience,
            ti.status
        FROM team_invitations ti
        JOIN team_profiles tp
            ON tp.id = ti.sender_id
        LEFT JOIN users u
            ON u.id = tp.user_id
        WHERE ti.receiver_id = ?
          AND ti.status = 'Accepted'
    `;

    db.query(sql, [profileId, profileId], (err, results) => {

        if (err) {
            console.error("Get connections error:", err);

            return res.status(500).json({
                message: "Failed to fetch connected teammates"
            });
        }

        res.json(results);
    });
};

exports.removeConnection = (req, res) => {

    const profileId = Number(req.params.profileId);
    const teammateId = Number(req.params.teammateId);

    if (!profileId || !teammateId) {
        return res.status(400).json({
            message: "Invalid profile IDs"
        });
    }

    const sql = `
        DELETE FROM team_invitations
        WHERE status = 'Accepted'
        AND (
            (sender_id = ? AND receiver_id = ?)
            OR
            (sender_id = ? AND receiver_id = ?)
        )
    `;

    db.query(
        sql,
        [profileId, teammateId, teammateId, profileId],
        (err, result) => {

            if (err) {
                console.error("Remove connection error:", err);

                return res.status(500).json({
                    message: "Failed to remove teammate"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Connection not found"
                });
            }

            res.json({
                message: "Teammate removed successfully"
            });
        }
    );
};