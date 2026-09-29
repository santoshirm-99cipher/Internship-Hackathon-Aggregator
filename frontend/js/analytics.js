console.log("analytics.js loaded");

const INTERNSHIPS_API =
    "http://localhost:5001/api/internships";

let allSkills = [];
let allInternships = [];
let showingAll = false;

const DEFAULT_SKILLS_COUNT = 5;
const FULL_SKILLS_COUNT = 20;

function formatSkillName(skill) {
    const skillMap = {
        sql: "SQL",
        mysql: "MySQL",
        javascript: "JavaScript",
        html: "HTML",
        css: "CSS",
        python: "Python",
        java: "Java",
        react: "React",
        "node.js": "Node.js",
        "spring boot": "Spring Boot",
        "machine learning": "Machine Learning",
        "power bi": "Power BI",
        "rest api": "REST API",
        dsa: "DSA",
        "ai systems": "AI Systems",
        "embedded systems": "Embedded Systems",
        "adobe xd": "Adobe XD",
        "ui design": "UI Design",
        "c++": "C++",
        "c#": "C#"
    };

    const normalizedSkill = String(skill)
        .trim()
        .toLowerCase();

    return skillMap[normalizedSkill] || String(skill).trim();
}

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function getSelectedCategory() {
    const categoryFilter = document.getElementById("categoryFilter");

    if (!categoryFilter) {
        return "all";
    }

    return normalizeText(categoryFilter.value);
}

function internshipMatchesCategory(internship, category) {
    if (category === "all") {
        return true;
    }

    const searchableText = [
        internship.job_title,
        internship.company_name,
        internship.skills,
        internship.description,
        internship.category,
        internship.experience_level
    ]
        .map(normalizeText)
        .join(" ");

    if (category === "sde") {
        return [
            "software",
            "developer",
            "development",
            "programmer",
            "backend",
            "frontend",
            "full stack",
            "java",
            "python",
            "c++",
            "c#",
            "node",
            "react",
            "spring",
            "api",
            "web"
        ].some(keyword => searchableText.includes(keyword));
    }

    if (category === "data") {
        return [
            "data",
            "analytics",
            "analyst",
            "machine learning",
            "artificial intelligence",
            "ai",
            "python",
            "sql",
            "power bi",
            "pandas",
            "tensorflow"
        ].some(keyword => searchableText.includes(keyword));
    }

    if (category === "web") {
        return [
            "web",
            "frontend",
            "front-end",
            "backend",
            "back-end",
            "full stack",
            "html",
            "css",
            "javascript",
            "react",
            "node",
            "website"
        ].some(keyword => searchableText.includes(keyword));
    }

    return true;
}

function getFilteredInternships() {
    const selectedCategory = getSelectedCategory();

    return allInternships.filter(internship =>
        internshipMatchesCategory(internship, selectedCategory)
    );
}

function calculateSkillAnalytics(internships) {
    const skillCounts = {};

    internships.forEach(internship => {
        if (!internship.skills) {
            return;
        }

        const skills = String(internship.skills)
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean);

        skills.forEach(skill => {
            const formattedSkill = formatSkillName(skill);

            if (!skillCounts[formattedSkill]) {
                skillCounts[formattedSkill] = 0;
            }

            skillCounts[formattedSkill]++;
        });
    });

    const totalListings = internships.length;

    const skills = Object.entries(skillCounts)
        .map(([skill, count]) => ({
            skill,
            count,
            percentage: totalListings
                ? Math.round((count / totalListings) * 100)
                : 0
        }))
        .sort((a, b) => {
            if (b.count !== a.count) {
                return b.count - a.count;
            }

            return a.skill.localeCompare(b.skill);
        });

    return {
        totalListings,
        skills
    };
}

function displaySkills(data) {
    const totalListings = document.getElementById("totalListings");
    const skillsContainer = document.getElementById("skillsContainer");

    if (!totalListings || !skillsContainer) {
        return;
    }

    totalListings.textContent = data.totalListings;

    const visibleSkills = showingAll
        ? data.skills.slice(0, FULL_SKILLS_COUNT)
        : data.skills.slice(0, DEFAULT_SKILLS_COUNT);

    skillsContainer.innerHTML = "";

    if (visibleSkills.length === 0) {
        skillsContainer.innerHTML = `
            <p class="error-message">
                No skills found for this category.
            </p>
        `;

        return;
    }

    visibleSkills.forEach(skill => {
        const skillRow = document.createElement("div");

skillRow.className = "skill-row";
skillRow.style.cursor = "pointer";

skillRow.addEventListener("click", () => {
    const selectedSkill = encodeURIComponent(skill.skill);

    window.location.href =
        `internships.html?skill=${selectedSkill}`;
});

        skillRow.innerHTML = `
            <div class="skill-info">
                <span class="skill-name">
                    ${skill.skill}
                </span>

                <span class="skill-percentage">
                    ${skill.count} listings (${skill.percentage}%)
                </span>
            </div>

            <div class="progress-background">
                <div
                    class="progress-bar"
                    style="width: ${skill.percentage}%"
                ></div>
            </div>
        `;

        skillsContainer.appendChild(skillRow);
    });

    const existingButton = document.getElementById("showMoreButton");

    if (existingButton) {
        existingButton.remove();
    }

    if (data.skills.length > DEFAULT_SKILLS_COUNT) {
        const button = document.createElement("button");

        button.id = "showMoreButton";
        button.className = "show-more-button";

        button.textContent = showingAll
            ? "Show Less ↑"
            : "Show More ↓";

        button.addEventListener("click", () => {
            showingAll = !showingAll;

            const filteredInternships = getFilteredInternships();
            const filteredAnalytics =
                calculateSkillAnalytics(filteredInternships);

            displaySkills(filteredAnalytics);
        });

        skillsContainer.appendChild(button);
    }
}

function updateMarketInsight(data) {
    const marketInsight = document.getElementById("marketInsight");

    if (!marketInsight) {
        return;
    }

    if (!data.skills || data.skills.length === 0) {
        marketInsight.textContent =
            "There is not enough data for this category.";
        return;
    }

    const topSkill = data.skills[0];
    const secondSkill = data.skills[1];

    if (secondSkill) {
        marketInsight.textContent =
            `${topSkill.skill} is currently the highest-demand skill ` +
            `with ${topSkill.percentage}% demand. ` +
            `${secondSkill.skill} is also commonly requested, so learning ` +
            `${secondSkill.skill} after ${topSkill.skill} may improve your internship options.`;
    } else {
        marketInsight.textContent =
            `${topSkill.skill} is currently the most demanded skill in this category.`;
    }
}

function updateAnalytics() {
    const filteredInternships = getFilteredInternships();
    const analyticsData = calculateSkillAnalytics(filteredInternships);

    showingAll = false;

    displaySkills(analyticsData);
    updateMarketInsight(analyticsData);
}

async function loadSkillAnalytics() {

    const totalListings =
        document.getElementById("totalListings");

    const skillsContainer =
        document.getElementById("skillsContainer");

    try {

        const response =
            await fetch(
                "http://localhost:5001/api/internships"
            );

        if (!response.ok) {

            throw new Error(
                `Internships API error: ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log("Internships received:", data);

        allInternships =
            Array.isArray(data)
                ? data
                : data.internships || [];

        updateAnalytics();

    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

        if (totalListings) {
            totalListings.textContent = "0";
        }

        if (skillsContainer) {

            skillsContainer.innerHTML = `
                <p class="error-message">
                    Unable to load internship data.
                    Please check whether the backend server is running.
                </p>
            `;

        }

    }

}

function setupCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");

    if (!categoryFilter) {
        return;
    }

    categoryFilter.addEventListener("change", () => {
        updateAnalytics();
    });
}

setupCategoryFilter();
loadSkillAnalytics();

const skillGapBtn = document.getElementById("skillGapBtn");
const skillGapResults = document.getElementById("skillGapResults");

if (skillGapBtn) {
    skillGapBtn.addEventListener("click", showSkillGap);
}

function showSkillGap() {
    const profile =
        JSON.parse(localStorage.getItem("profile")) || {};

    const userSkills = new Set(
        (profile.skills || "")
            .split(",")
            .map(skill => normalizeText(skill))
            .filter(Boolean)
    );

    const skillDemand = new Map();

    allInternships.forEach(internship => {
        const skills = new Set(
            (internship.skills || "")
                .split(",")
                .map(skill => normalizeText(skill))
                .filter(Boolean)
        );

        skills.forEach(skill => {
            skillDemand.set(
                skill,
                (skillDemand.get(skill) || 0) + 1
            );
        });
    });

    const top10Skills = [...skillDemand.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const top3MissingSkills = top10Skills
        .filter(([skill]) => !userSkills.has(skill))
        .slice(0, 3);

    const totalInternships = allInternships.length;

    const missingSkillsText = top3MissingSkills
        .map(([skill]) => formatSkillName(skill))
        .join(", ");

    const unlockDetails = top3MissingSkills.map(([skill, count]) => {
        const percentage = Math.round(
            (count / totalInternships) * 100
        );

        return `
            <div class="skill-unlock-item">
                <strong>
                    Add ${formatSkillName(skill)}
                </strong>
                <span>
                    to unlock ${count} more internships
                    (${percentage}%)
                </span>
            </div>
        `;
    }).join("");

    skillGapResults.innerHTML = `
        <div class="insight-box">
            <p>
                <strong>You know:</strong>
                ${[...userSkills]
                    .map(skill => formatSkillName(skill))
                    .join(", ")}
            </p>

            <p>
                <strong>You're missing:</strong>
                ${missingSkillsText || "No major skill gaps found"}
            </p>

            <div class="skill-unlock-list">
                ${unlockDetails}
            </div>

            <p>
                Add these skills to improve your internship opportunities.
            </p>

            <div class="skill-gap-actions">
    <a href="profile.html">Update My Skills →</a>
</div>
        </div>
    `;
}