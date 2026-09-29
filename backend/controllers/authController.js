const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    console.log("✅ Register API called");
    console.log(req.body);

    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";

        db.query(sql, [full_name, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.status(201).json({
                message: "Registration Successful"
            });
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ================= LOGIN =================

exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please fill all fields"
        });
    }

    const sql = "SELECT * FROM users WHERE email=?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        if (result.length === 0) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                message: "Incorrect Password"
            });
        }

        const token = jwt.sign(
    {
        id: user.id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "2h"
    }
);

res.status(200).json({
    message: "Login Successful",
    token,
    user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
    }
});

    });   // ✅ closes db.query()

};       // ✅ closes exports.login

exports.getProfile = (req, res) => {

    const userId = req.params.id;

    const sql = "SELECT id, full_name, email FROM users WHERE id = ?";

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result[0]);

    });

};