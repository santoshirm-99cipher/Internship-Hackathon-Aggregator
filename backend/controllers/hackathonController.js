const db = require("../config/db");


// ==========================================
// GET ALL HACKATHONS
// ==========================================

exports.getHackathons = (req, res) => {

    const sql = "SELECT * FROM hackathons";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.json(results);

    });

};


// ==========================================
// ADD HACKATHON
// ==========================================

exports.addHackathon = (req, res) => {

    const {
        event_name,
        organizer,
        mode,
        prize,
        deadline,
        registration_link,
        team_size,
        eligibility,
        description
    } = req.body;

    const sql = `
        INSERT INTO hackathons
        (event_name, organizer, mode, prize, deadline,
         registration_link, team_size, eligibility, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        event_name,
        organizer,
        mode,
        prize,
        deadline,
        registration_link,
        team_size,
        eligibility,
        description
    ], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.status(201).json({
            message: "Hackathon added successfully",
            id: result.insertId
        });

    });

};


// ==========================================
// UPDATE HACKATHON
// ==========================================

exports.updateHackathon = (req, res) => {

    const id = req.params.id;

    const {
        event_name,
        organizer,
        mode,
        prize,
        deadline,
        registration_link,
        team_size,
        eligibility,
        description
    } = req.body;

    const sql = `
        UPDATE hackathons
        SET
            event_name = ?,
            organizer = ?,
            mode = ?,
            prize = ?,
            deadline = ?,
            registration_link = ?,
            team_size = ?,
            eligibility = ?,
            description = ?
        WHERE id = ?
    `;

    db.query(sql, [
        event_name,
        organizer,
        mode,
        prize,
        deadline,
        registration_link,
        team_size,
        eligibility,
        description,
        id
    ], (err) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.json({
            message: "Hackathon updated successfully"
        });

    });

};


// ==========================================
// DELETE HACKATHON
// ==========================================

exports.deleteHackathon = (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM hackathons WHERE id = ?";

    db.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.json({
            message: "Hackathon deleted successfully"
        });

    });

};