const db = require("../config/db");

// Get all internships
exports.getInternships = (req, res) => {

    const sql = "SELECT * FROM internships";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.json(results);

    });

};


// Search internships
exports.searchInternships = (req, res) => {

    const search = req.query.query;

    const sql = `
        SELECT *
        FROM internships
        WHERE company_name LIKE ?
        OR job_title LIKE ?
        OR skills LIKE ?
        OR location LIKE ?
    `;

    const value = `%${search}%`;

    db.query(sql, [value, value, value, value], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.json(results);

    });

};