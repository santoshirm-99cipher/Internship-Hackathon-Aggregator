const db = require("../config/db");

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