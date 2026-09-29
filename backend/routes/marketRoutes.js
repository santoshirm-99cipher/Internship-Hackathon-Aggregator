const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("/skills", (req, res) => {
    const query = `
        SELECT skills
        FROM internships
        WHERE skills IS NOT NULL
        AND skills != ''
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Market analysis error:", err);

            return res.status(500).json({
                message: "Failed to analyze market skills"
            });
        }

        const skillCounts = {};
        const totalListings = results.length;

        results.forEach((row) => {
            const skills = row.skills
                .split(",")
                .map((skill) => skill.trim().toLowerCase())
                .filter(Boolean);

            const uniqueSkills = [...new Set(skills)];

            uniqueSkills.forEach((skill) => {
                const formattedSkill =
                    skill.charAt(0).toUpperCase() + skill.slice(1);

                skillCounts[formattedSkill] =
                    (skillCounts[formattedSkill] || 0) + 1;
            });
        });

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
    });
});

module.exports = router;