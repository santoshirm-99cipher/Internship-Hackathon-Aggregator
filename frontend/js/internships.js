const container = document.getElementById("internshipContainer");
const searchInput = document.getElementById("searchInput");

let internships = [];

const urlParams = new URLSearchParams(window.location.search);
const selectedSkill = urlParams.get("skill");
const modeFilter = document.getElementById("modeFilter");
const companyFilter = document.getElementById("companyFilter");
const locationFilter = document.getElementById("locationFilter");
const sortFilter = document.getElementById("sortFilter");


// =========================================
// LOAD INTERNSHIPS
// =========================================

fetch("http://localhost:5001/api/internships")
    .then(res => res.json())
    .then(data => {

        internships = data;

        const urlParams = new URLSearchParams(window.location.search);
        const selectedSkill = urlParams.get("skill");

        if (selectedSkill) {
            internships = internships.filter(job =>
                (job.skills || "")
                    .toLowerCase()
                    .includes(selectedSkill.toLowerCase())
            );
        }

        populateFilters();
        applyFilters();

    })
    .catch(err => console.log(err));

// =========================================
// GET STATUS
// =========================================

function getStatus(deadline) {

    if (!deadline) {
        return {
            text: "Open",
            className: "open",
            priority: 1
        };
    }

    // Convert database date to YYYY-MM-DD
    let dateString = String(deadline).split("T")[0];

    // If date is DD/MM/YYYY, convert it
    if (dateString.includes("/")) {
        const parts = dateString.split("/");

        if (parts.length === 3) {
            dateString = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
    }

    const deadlineDate = new Date(`${dateString}T23:59:59`);

    // Check for invalid date
    if (isNaN(deadlineDate.getTime())) {
        console.error("Invalid deadline:", deadline);

        return {
            text: "Open",
            className: "open",
            priority: 1
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const difference = Math.ceil(
        (deadlineDate - today) / (1000 * 60 * 60 * 24)
    );

    // Deadline has passed
    if (difference < 0) {
        return {
            text: "Expired",
            className: "expired",
            priority: 3
        };
    }

    // Deadline is within 7 days
    if (difference <= 7) {
        return {
            text: "Closing Soon",
            className: "closing-soon",
            priority: 2
        };
    }

    // More than 7 days remaining
    return {
        text: "Open",
        className: "open",
        priority: 1
    };
}

// =========================================
// APPLICATION READINESS SCORE
// =========================================

function calculateReadiness(job) {

    const profile =
        JSON.parse(localStorage.getItem("profile")) || {};

    let score = 0;

    const userSkills =
        (profile.skills || "")
            .toLowerCase()
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean);

    const jobSkills =
        (job.skills || "")
            .toLowerCase()
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean);

    // Skills match — maximum 50 points
    if (userSkills.length && jobSkills.length) {

        const matchedSkills = jobSkills.filter(jobSkill =>
            userSkills.some(userSkill =>
                jobSkill.includes(userSkill) ||
                userSkill.includes(jobSkill)
            )
        );

        const skillScore =
            Math.min(
                50,
                Math.round(
                    (matchedSkills.length / jobSkills.length) * 50
                )
            );

        score += skillScore;
    }

    // Location preference — 20 points
    const preferredLocation =
        (profile.location || "").toLowerCase().trim();

    if (
        preferredLocation &&
        (job.location || "")
            .toLowerCase()
            .includes(preferredLocation)
    ) {
        score += 20;
    }

    // Profile completeness — 20 points
    if (profile.skills) score += 10;
    if (profile.location) score += 5;
    if (profile.name) score += 5;

    // Deadline — 10 points
    if (job.deadline) {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadline = new Date(job.deadline);
        deadline.setHours(0, 0, 0, 0);

        const daysLeft =
            Math.ceil(
                (deadline - today) /
                (1000 * 60 * 60 * 24)
            );

        if (daysLeft >= 7) {
            score += 10;
        } else if (daysLeft >= 3) {
            score += 7;
        } else if (daysLeft >= 0) {
            score += 4;
        }
    }

    return Math.min(score, 100);
}


// =========================================
// DISPLAY INTERNSHIPS
// =========================================

function displayInternships(list) {

    let html = "";

    const saved =
        JSON.parse(
            localStorage.getItem("savedInternships")
        ) || [];


    list.forEach(job => {

        // -----------------------------
        // Skills
        // -----------------------------

        let skillsHTML = "";

        if (job.skills) {

            const skills = job.skills.split(",");

            skills.forEach(skill => {

                skillsHTML += `
                    <span class="skill">
                        ${skill.trim()}
                    </span>
                `;

            });

        }


        // -----------------------------
        // Status
        // -----------------------------

        const status =
            getStatus(job.deadline);


        // -----------------------------
        // Card
        // -----------------------------

        html += `

        <div class="card">

        <div class="company">

    <div class="logo">
        ${job.company_name.charAt(0)}
    </div>

    <div>

        <h3>
            ${job.company_name}
        </h3>

        <span class="status-badge ${status.className}">
            ${status.text}
        </span>

        <p>
            ${job.location || "Not specified"}
        </p>

    </div>

</div>

            <div class="job">
                ${job.job_title}
            </div>


            <p class="info">
                💻 ${job.mode}
            </p>


            <p class="info">
                💰 ${job.stipend}
            </p>


            <p class="info">
    📅 Apply Before:
    ${
        job.deadline
            ? new Date(job.deadline).toLocaleDateString()
            : "Deadline not published"
    }
</p>

${job.application_time_hours > 0 ? `
<div class="application-cost">
    <strong>⏱️ Application Cost: ~${job.application_time_hours}h</strong>
    <span>🎯 ${job.interview_rounds || 0} rounds</span>
    ${job.assignment_hours > 0 ? `<span>📝 ${job.assignment_hours}h assignment</span>` : ""}
    ${job.assessment_minutes > 0 ? `<span>🧪 ${job.assessment_minutes}m assessment</span>` : ""}
</div>
` : ""}


            <p class="info">
                ${job.description || ""}
            </p>


            <div class="skills">
                ${skillsHTML}
            </div>


            <div class="buttons">

                <button
                    class="save"
                    onclick="saveInternship(${job.id})">

                    ${saved.includes(job.id)
                        ? "Saved"
                        : "Save"}

                </button>


                <a
                    href="internship-details.html?id=${job.id}"
                    class="apply">

                    View Details →

                </a>

            </div>

        </div>

        `;

    });


    // -----------------------------
    // No results
    // -----------------------------

    if (html === "") {

        container.innerHTML = `

            <div class="no-result">

                <h2>No internships found</h2>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

    } else {

        container.innerHTML = html;

    }

}


// =========================================
// POPULATE FILTERS
// =========================================

function populateFilters() {

    companyFilter.innerHTML =
        '<option value="">All Companies</option>';

    locationFilter.innerHTML =
        '<option value="">All Locations</option>';


    const companies = [
        ...new Set(
            internships.map(
                job => job.company_name
            )
        )
    ].sort();


    companies.forEach(company => {

        companyFilter.innerHTML += `
            <option value="${company}">
                ${company}
            </option>
        `;

    });


    const locations = [
        ...new Set(
            internships.map(
                job => job.location
            )
        )
    ].sort();


    locations.forEach(location => {

        locationFilter.innerHTML += `
            <option value="${location}">
                ${location}
            </option>
        `;

    });

}


// =========================================
// FILTER EVENTS
// =========================================

searchInput.addEventListener(
    "keyup",
    applyFilters
);

modeFilter.addEventListener(
    "change",
    applyFilters
);

companyFilter.addEventListener(
    "change",
    applyFilters
);

locationFilter.addEventListener(
    "change",
    applyFilters
);

sortFilter.addEventListener(
    "change",
    applyFilters
);


// =========================================
// APPLY FILTERS
// =========================================

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const mode =
        modeFilter.value;

    const company =
        companyFilter.value;

    const location =
        locationFilter.value;

    const sort =
        sortFilter.value;


    // IMPORTANT:
    // Create a NEW array so the original
    // internships array is never modified.

    let filtered = internships.filter(job => {

        const companyName =
            (job.company_name || "")
                .toLowerCase();

        const jobTitle =
            (job.job_title || "")
                .toLowerCase();

        const skills =
            (job.skills || "")
                .toLowerCase();

        const jobLocation =
            (job.location || "")
                .toLowerCase();


        const matchesSearch =
            companyName.includes(search) ||
            jobTitle.includes(search) ||
            skills.includes(search) ||
            jobLocation.includes(search);


        const matchesMode =
            !mode ||
            job.mode === mode;


        const matchesCompany =
            !company ||
            job.company_name === company;


        const matchesLocation =
            !location ||
            job.location === location;


        return (
            matchesSearch &&
            matchesMode &&
            matchesCompany &&
            matchesLocation
        );

    });


    // =========================================
    // SORTING
    // =========================================

    if (sort === "") {

        /*
         DEFAULT ORDER:

         1. Open
         2. Closing Soon
         3. Expired

         Within each group:
         nearest deadline first.
        */

        filtered.sort((a, b) => {

            const statusA =
                getStatus(a.deadline);

            const statusB =
                getStatus(b.deadline);


            if (
                statusA.priority !==
                statusB.priority
            ) {

                return (
                    statusA.priority -
                    statusB.priority
                );

            }


            return (
                new Date(a.deadline) -
                new Date(b.deadline)
            );

        });

    }


    else if (sort === "company") {

        filtered.sort((a, b) => {

            return a.company_name
                .localeCompare(
                    b.company_name
                );

        });

    }


    else if (sort === "job") {

        filtered.sort((a, b) => {

            return a.job_title
                .localeCompare(
                    b.job_title
                );

        });

    }


    else if (sort === "deadline") {

        filtered.sort((a, b) => {

            return (
                new Date(a.deadline) -
                new Date(b.deadline)
            );

        });

    }


    else if (sort === "stipendHigh") {

        filtered.sort((a, b) => {

            const stipendA =
                parseInt(
                    (a.stipend || "")
                        .replace(/\D/g, "")
                ) || 0;

            const stipendB =
                parseInt(
                    (b.stipend || "")
                        .replace(/\D/g, "")
                ) || 0;


            return stipendB - stipendA;

        });

    }


    else if (sort === "stipendLow") {

        filtered.sort((a, b) => {

            const stipendA =
                parseInt(
                    (a.stipend || "")
                        .replace(/\D/g, "")
                ) || 0;

            const stipendB =
                parseInt(
                    (b.stipend || "")
                        .replace(/\D/g, "")
                ) || 0;


            return stipendA - stipendB;

        });

    }


    displayInternships(filtered);

}


// =========================================
// SAVE INTERNSHIP
// =========================================

function saveInternship(id) {

    let saved =
        JSON.parse(
            localStorage.getItem(
                "savedInternships"
            )
        ) || [];


    if (!saved.includes(id)) {

        saved.push(id);

        localStorage.setItem(
            "savedInternships",
            JSON.stringify(saved)
        );

    }


    // Re-run filters so the current
    // search/filter selection stays active.

    applyFilters();

}

