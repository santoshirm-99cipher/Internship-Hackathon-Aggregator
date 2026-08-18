// ================= DASHBOARD =================
console.log("DASHBOARD.JS IS RUNNING");

async function loadDashboard() {

    try {

        // Get internships
        const internshipResponse =
            await fetch("http://localhost:5001/api/internships");

        const internships =
            await internshipResponse.json();

            // ================= FEATURED INTERNSHIP =================

const featuredInternship = internships[0];

if (featuredInternship) {

    document.getElementById("featuredInternship").innerHTML = `

        <h3>
            ${featuredInternship.job_title}
        </h3>

        <p class="company-name">
            ${featuredInternship.company_name}
        </p>

        <div class="opportunity-info">

            <span>📍 ${featuredInternship.location}</span>

            <span>💰 ${featuredInternship.stipend}</span>

        </div>

        <a href="internships.html" class="card-button">
            Explore Internship →
        </a>

    `;

}


        // Get hackathons
        const hackathonResponse =
            await fetch("http://localhost:5001/api/hackathons");

        const hackathons =
            await hackathonResponse.json();

            // ================= FEATURED HACKATHON =================

const featuredHackathon = hackathons[0];

if (featuredHackathon) {

    document.getElementById("featuredHackathon").innerHTML = `

        <h3>
            ${featuredHackathon.event_name}
        </h3>

        <p class="company-name">
            ${featuredHackathon.organizer}
        </p>

        <div class="opportunity-info">

            <span>💻 ${featuredHackathon.mode}</span>

            <span>🏆 ${featuredHackathon.prize}</span>

        </div>

        <a href="hackathons.html" class="card-button">
            View Hackathon →
        </a>

    `;

}

        // ================= COUNTS =================

        document.getElementById("internshipCount").innerText =
            internships.length;

        document.getElementById("hackathonCount").innerText =
            hackathons.length;


        // ================= SAVED =================

        const savedInternships =
            JSON.parse(
                localStorage.getItem("savedInternships")
            ) || [];

        const savedHackathons =
            JSON.parse(
                localStorage.getItem("savedHackathons")
            ) || [];

        document.getElementById("savedCount").innerText =
            savedInternships.length +
            savedHackathons.length;


        // ================= LATEST INTERNSHIPS =================

        let internshipHTML = "";

        internships.slice(0, 3).forEach(job => {

            internshipHTML += `
                <div class="latest-item">

                    <strong>${job.company_name}</strong>

                    <p>${job.job_title}</p>

                    <span>📍 ${job.location}</span>

                    <br>

                    <a href="internships.html">
                        View Internship →
                    </a>

                    <hr>

                </div>
            `;

        });

        document.getElementById("latestInternships").innerHTML =
            internshipHTML;


        // ================= LATEST HACKATHONS =================

        let hackathonHTML = "";

        hackathons.slice(0, 3).forEach(event => {

            hackathonHTML += `
                <div class="latest-item">

                    <strong>${event.event_name}</strong>

                    <p>${event.organizer}</p>

                    <span>🏆 ${event.prize}</span>

                    <br>

                    <a href="hackathons.html">
                        View Hackathon →
                    </a>

                    <hr>

                </div>
            `;

        });

        document.getElementById("latestHackathons").innerHTML =
            hackathonHTML;


        // ================= DEADLINES =================

        const sortedInternships =
            [...internships].sort(
                (a, b) =>
                    new Date(a.deadline) -
                    new Date(b.deadline)
            );


        let deadlineHTML = "";

        sortedInternships.slice(0, 5).forEach(job => {

            const deadline =
                new Date(job.deadline).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

            deadlineHTML += `
                <div class="deadline-item">

                    <strong>${job.company_name}</strong>

                    <p>${job.job_title}</p>

                    <span>
                        📅 Deadline: ${deadline}
                    </span>

                </div>

                <hr>
            `;

        });

        document.getElementById("deadlineList").innerHTML =
            deadlineHTML;


        console.log(
            "Dashboard loaded successfully"
        );

        console.log(
            "Internships:",
            internships.length
        );

        console.log(
            "Hackathons:",
            hackathons.length
        );

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ================= START DASHBOARD =================

loadDashboard();

// ================= RECOMMENDED OPPORTUNITIES =================

function loadRecommendations() {

    const container =
        document.getElementById("recommendedContainer");

    if (!container) return;

    // Get student's profile
    const profile =
        JSON.parse(localStorage.getItem("profile")) || {};

    const userSkills =
        (profile.skills || "")
            .toLowerCase()
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill !== "");

    const preferredLocation =
        (profile.location || "")
            .toLowerCase()
            .trim();


    // Get internships
    fetch("http://localhost:5001/api/internships")

        .then(response => response.json())

        .then(internships => {

            const recommendations =
                internships
                    .map(job => {

                        let score = 0;

                        const jobSkills =
                            (job.skills || "")
                                .toLowerCase()
                                .split(",")
                                .map(skill => skill.trim());


                        // Match skills
                        userSkills.forEach(userSkill => {

                            jobSkills.forEach(jobSkill => {

                                if (
                                    jobSkill.includes(userSkill) ||
                                    userSkill.includes(jobSkill)
                                ) {

                                    score += 2;

                                }

                            });

                        });


                        // Match location
                        if (
                            preferredLocation &&
                            (job.location || "")
                                .toLowerCase()
                                .includes(preferredLocation)
                        ) {

                            score += 3;

                        }


                        return {
                            ...job,
                            score: score
                        };

                    })

                    // Only show matching opportunities
                    .filter(job => job.score > 0)

                    // Highest match first
                    .sort(
                        (a, b) =>
                            b.score - a.score
                    )

                    // Show maximum 4
                    .slice(0, 4);


                // ================= DISPLAY =================

                if (recommendations.length === 0) {

                    container.innerHTML = `

                        <div class="recommendation-empty">

                            <h3>
                                🔍 No recommendations yet
                            </h3>

                            <p>
                                Add your skills and preferred location
                                in your profile to get personalized
                                opportunities.
                            </p>

                            <a href="profile.html">
                                Update Profile →
                            </a>

                        </div>

                    `;

                    return;

                }


                let html = "";


                recommendations.forEach(job => {

                    html += `

                        <div class="recommendation-card">

                            <div class="recommendation-badge">
                                ⭐ Recommended
                            </div>

                            <h3>
                                ${job.job_title}
                            </h3>

                            <h4>
                                ${job.company_name}
                            </h4>

                            <div class="recommendation-info">

                                <span>
                                    📍 ${job.location}
                                </span>

                                <span>
                                    💰 ${job.stipend}
                                </span>

                                <span>
                                    💼 ${job.mode}
                                </span>

                            </div>

                            <p class="matched-skills">
                                🛠 ${job.skills}
                            </p>

                            <a
                                href="internships.html"
                                class="recommendation-btn">

                                View Internship →

                            </a>

                        </div>

                    `;

                });


                container.innerHTML = html;

        })

        .catch(error => {

            console.error(
                "Recommendation error:",
                error
            );

            container.innerHTML = `
                <p>
                    Unable to load recommendations.
                </p>
            `;

        });

}


// Start recommendations
loadRecommendations();
