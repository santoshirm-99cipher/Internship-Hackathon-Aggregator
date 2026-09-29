const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/skills", async (req, res) => {
    try {
        const [rows] = await db.promise().query(`
            SELECT skills
            FROM internships
            WHERE skills IS NOT NULL
            AND skills <> ''
        `);

        const skillCounts = {};

        rows.forEach(row => {
            const skills = row.skills
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0);

            skills.forEach(skill => {
                const formattedSkill = skill
                    .toLowerCase()
                    .replace(/\b\w/g, letter => letter.toUpperCase());

                skillCounts[formattedSkill] =
                    (skillCounts[formattedSkill] || 0) + 1;
            });
        });

        const totalListings = rows.length;

        const skills = Object.entries(skillCounts)
            .map(([skill, count]) => ({
                skill,
                count,
                percentage: totalListings
                    ? Math.round((count / totalListings) * 100)
                    : 0
            }))
            .sort((a, b) => b.count - a.count);

        res.json({
            totalListings,
            skills
        });

    } catch (error) {
        console.error("Analytics SQL error:", error);

        res.status(500).json({
            message: "Unable to load analytics",
            error: error.message
        });
    }
});

module.exports = router;