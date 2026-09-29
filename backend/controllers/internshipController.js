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

// Add internship
exports.addInternship = (req, res) => {

    const {
        company_name,
        job_title,
        location,
        mode,
        stipend,
        deadline,
        apply_link
    } = req.body;

    const sql = `
        INSERT INTO internships
        (company_name, job_title, location, mode, stipend, deadline, apply_link)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            company_name,
            job_title,
            location,
            mode,
            stipend,
            deadline,
            apply_link
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.status(201).json({
                message: "Internship added successfully",
                id: result.insertId
            });

        }
    );
};


// Update internship
exports.updateInternship = (req, res) => {

    const id = req.params.id;

    const {
        company_name,
        job_title,
        location,
        mode,
        stipend,
        deadline,
        apply_link
    } = req.body;

    const sql = `
        UPDATE internships
        SET
            company_name = ?,
            job_title = ?,
            location = ?,
            mode = ?,
            stipend = ?,
            deadline = ?,
            apply_link = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            company_name,
            job_title,
            location,
            mode,
            stipend,
            deadline,
            apply_link,
            id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.json({
                message: "Internship updated successfully"
            });

        }
    );
};


// Delete internship
exports.deleteInternship = (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM internships WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.json({
            message: "Internship deleted successfully"
        });

    });
};