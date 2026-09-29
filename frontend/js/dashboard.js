// ================= DASHBOARD =================

console.log("DASHBOARD.JS IS RUNNING");


// ==================================================
// ================= LOAD DASHBOARD ==================
// ==================================================

async function loadDashboard() {

    try {

        // ================= GET INTERNSHIPS =================

        const internshipResponse = await fetch(
            "http://localhost:5001/api/internships"
        );

        if (!internshipResponse.ok) {
            throw new Error("Could not load internships");
        }

        const internships = await internshipResponse.json();


        // ================= FEATURED INTERNSHIP =================

        const featuredInternship = internships[0];

        const featuredInternshipContainer =
            document.getElementById("featuredInternship");

        if (featuredInternship && featuredInternshipContainer) {

            featuredInternshipContainer.innerHTML = `

                <h3>
                    ${featuredInternship.job_title}
                </h3>

                <p class="company-name">
                    ${featuredInternship.company_name}
                </p>

                <div class="opportunity-info">

                    <span>
                        📍 ${featuredInternship.location}
                    </span>

                    <span>
                        💰 ${featuredInternship.stipend}
                    </span>

                </div>

                <a
                    href="internships.html"
                    class="card-button">

                    Explore Internship →

                </a>

            `;
        }


        // ================= GET HACKATHONS =================

        const hackathonResponse = await fetch(
            "http://localhost:5001/api/hackathons"
        );

        if (!hackathonResponse.ok) {
            throw new Error("Could not load hackathons");
        }

        const hackathons = await hackathonResponse.json();


        // ================= FEATURED HACKATHON =================

        const featuredHackathon = hackathons[0];

        const featuredHackathonContainer =
            document.getElementById("featuredHackathon");

        if (featuredHackathon && featuredHackathonContainer) {

            featuredHackathonContainer.innerHTML = `

                <h3>
                    ${featuredHackathon.event_name}
                </h3>

                <p class="company-name">
                    ${featuredHackathon.organizer}
                </p>

                <div class="opportunity-info">

                    <span>
                        💻 ${featuredHackathon.mode}
                    </span>

                    <span>
                        🏆 ${featuredHackathon.prize}
                    </span>

                </div>

                <a
                    href="hackathons.html"
                    class="card-button">

                    View Hackathon →

                </a>

            `;
        }


        // ================= COUNTS =================

        const internshipCount =
            document.getElementById("internshipCount");

        const hackathonCount =
            document.getElementById("hackathonCount");

        if (internshipCount) {
            internshipCount.innerText = internships.length;
        }

        if (hackathonCount) {
            hackathonCount.innerText = hackathons.length;
        }


        // ================= SAVED =================

        const savedInternships =
            JSON.parse(
                localStorage.getItem("savedInternships")
            ) || [];

        const savedHackathons =
            JSON.parse(
                localStorage.getItem("savedHackathons")
            ) || [];

        const savedCount =
            document.getElementById("savedCount");

        if (savedCount) {

            savedCount.innerText =
                savedInternships.length +
                savedHackathons.length;

        }


        // ================= LATEST INTERNSHIPS =================

        let internshipHTML = "";

        internships
            .slice(0, 3)
            .forEach(job => {

                internshipHTML += `

                    <div class="latest-item">

                        <strong>
                            ${job.company_name}
                        </strong>

                        <p>
                            ${job.job_title}
                        </p>

                        <span>
                            📍 ${job.location}
                        </span>

                        <br>

                        <a href="internships.html">
                            View Internship →
                        </a>

                        <hr>

                    </div>

                `;

            });


        const latestInternships =
            document.getElementById(
                "latestInternships"
            );

        if (latestInternships) {

            latestInternships.innerHTML =
                internshipHTML;

        }


        // ================= LATEST HACKATHONS =================

        let hackathonHTML = "";

        hackathons
            .slice(0, 3)
            .forEach(event => {

                hackathonHTML += `

                    <div class="latest-item">

                        <strong>
                            ${event.event_name}
                        </strong>

                        <p>
                            ${event.organizer}
                        </p>

                        <span>
                            🏆 ${event.prize}
                        </span>

                        <br>

                        <a href="hackathons.html">
                            View Hackathon →
                        </a>

                        <hr>

                    </div>

                `;

            });


        const latestHackathons =
            document.getElementById(
                "latestHackathons"
            );

        if (latestHackathons) {

            latestHackathons.innerHTML =
                hackathonHTML;

        }


        // ================= DEADLINES =================

        /*
            Only internships with a REAL deadline
            appear in the deadline section.
        */

        const validDeadlineInternships =
            internships.filter(job => {

                if (
                    job.deadline === null ||
                    job.deadline === undefined ||
                    job.deadline === "" ||
                    job.deadline === "0000-00-00"
                ) {

                    return false;

                }

                const date =
                    new Date(job.deadline);

                return !isNaN(
                    date.getTime()
                );

            });


        // ================= SORT DEADLINES =================

        const sortedInternships =
            [...validDeadlineInternships].sort(
                (a, b) =>
                    new Date(a.deadline) -
                    new Date(b.deadline)
            );


        let deadlineHTML = "";


        // ================= SHOW 5 DEADLINES =================

        sortedInternships
            .slice(0, 5)
            .forEach(job => {

                const deadline =
                    new Date(job.deadline)
                        .toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );


                deadlineHTML += `

                    <div class="deadline-item">

                        <strong>
                            ${job.company_name}
                        </strong>

                        <p>
                            ${job.job_title}
                        </p>

                        <span>
                            📅 Deadline: ${deadline}
                        </span>

                    </div>

                    <hr>

                `;

            });


        // ================= NO DEADLINES =================

        if (sortedInternships.length === 0) {

            deadlineHTML = `

                <div class="no-deadlines">

                    <p>
                        No upcoming deadlines available.
                    </p>

                </div>

            `;

        }


        const deadlineList =
            document.getElementById(
                "deadlineList"
            );

        if (deadlineList) {

            deadlineList.innerHTML =
                deadlineHTML;

        }


        // ================= CONSOLE =================

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

        console.log(
            "Valid deadlines:",
            validDeadlineInternships.length
        );

    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ==================================================
// ================= RECOMMENDATIONS =================
// ==================================================

function loadRecommendations() {

    const container =
        document.getElementById(
            "recommendedContainer"
        );


    if (!container) {

        console.log(
            "Recommendation container not found."
        );

        return;

    }


    // ================= GET PROFILE =================

    const profile =
        JSON.parse(
            localStorage.getItem("profile")
        ) || {};


    // ================= USER SKILLS =================

    const userSkills =
        (profile.skills || "")
            .toLowerCase()
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill !== "");


    // ================= USER LOCATION =================

    const preferredLocation =
        (profile.location || "")
            .toLowerCase()
            .trim();


    // ================= GET INTERNSHIPS =================

    fetch(
        "http://localhost:5001/api/internships"
    )

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load internships"
                );
            }

            return response.json();

        })

        .then(internships => {


            // ================= CALCULATE MATCH =================

            const recommendations =
                internships

                    .map(job => {

                        let score = 0;


                        // ================= JOB SKILLS =================

                        const jobSkills =
                            (job.skills || "")
                                .toLowerCase()
                                .split(",")
                                .map(skill =>
                                    skill.trim()
                                )
                                .filter(skill =>
                                    skill !== ""
                                );


                        // ================= SKILL MATCH =================

                        userSkills.forEach(
                            userSkill => {

                                jobSkills.forEach(
                                    jobSkill => {

                                        if (
                                            jobSkill.includes(
                                                userSkill
                                            ) ||
                                            userSkill.includes(
                                                jobSkill
                                            )
                                        ) {

                                            score += 2;

                                        }

                                    }
                                );

                            }
                        );


                        // ================= LOCATION MATCH =================

                        if (
                            preferredLocation &&
                            (job.location || "")
                                .toLowerCase()
                                .includes(
                                    preferredLocation
                                )
                        ) {

                            score += 3;

                        }


                        return {
                            ...job,
                            score: score
                        };

                    })


                    // Only matching opportunities

                    .filter(
                        job =>
                            job.score > 0
                    )


                    // Highest match first

                    .sort(
                        (a, b) =>
                            b.score - a.score
                    )


                    // Maximum 4

                    .slice(0, 4);


            // ================= NO RESULTS =================

            if (recommendations.length === 0) {

                container.innerHTML = `

                    <div class="recommendation-empty">

                        <h3>
                            🔍 No recommendations yet
                        </h3>

                        <p>
                            Add your skills and preferred
                            location in your profile to get
                            personalized opportunities.
                        </p>

                        <a href="profile.html">
                            Update Profile →
                        </a>

                    </div>

                `;

                return;

            }


            // ================= DISPLAY =================

            let html = "";


            recommendations.forEach(
                job => {


                    // ================= MATCH PERCENTAGE =================

                    const maxScore =
                        (userSkills.length * 2) +
                        (preferredLocation ? 3 : 0);


                    let matchPercentage = 0;


                    if (maxScore > 0) {

                        matchPercentage =
                            Math.round(
                                (
                                    job.score /
                                    maxScore
                                ) * 100
                            );

                    }


                    // Keep between 0 and 100

                    matchPercentage =
                        Math.min(
                            100,
                            Math.max(
                                0,
                                matchPercentage
                            )
                        );


                    // ================= MATCHED SKILLS =================

                    const matchedSkills =
                        userSkills.filter(
                            userSkill =>

                                (job.skills || "")
                                    .toLowerCase()
                                    .split(",")
                                    .some(
                                        jobSkill =>
                                            jobSkill
                                                .trim()
                                                .includes(
                                                    userSkill
                                                ) ||
                                            userSkill.includes(
                                                jobSkill
                                                    .trim()
                                            )
                                    )
                        );


                    // ================= MISSING SKILLS =================

                    const missingSkills =
                        (job.skills || "")
                            .split(",")
                            .map(skill =>
                                skill.trim()
                            )
                            .filter(skill => {

                                if (!skill) {
                                    return false;
                                }

                                return !userSkills.some(
                                    userSkill =>

                                        skill
                                            .toLowerCase()
                                            .includes(
                                                userSkill
                                            ) ||

                                        userSkill.includes(
                                            skill
                                                .toLowerCase()
                                        )

                                );

                            })
                            .slice(0, 2);


                    // ================= WHY THIS FITS =================

                    let reasonsHTML = "";


                    // Skill reason

                    if (matchedSkills.length > 0) {

                        reasonsHTML += `

                            <li>
                                ✅ Your skills match:
                                <strong>
                                    ${matchedSkills.join(", ")}
                                </strong>
                            </li>

                        `;

                    }


                    // Location reason

                    if (
                        preferredLocation &&
                        (job.location || "")
                            .toLowerCase()
                            .includes(
                                preferredLocation
                            )
                    ) {

                        reasonsHTML += `

                            <li>
                                ✅ ${job.location}
                                matches your preferred
                                location
                            </li>

                        `;

                    }


                    // Experience reason

                    if (job.experience_level) {

                        reasonsHTML += `

                            <li>
                                💼 Experience:
                                <strong>
                                    ${job.experience_level}
                                </strong>
                            </li>

                        `;

                    }


                    // Missing skills

                    if (missingSkills.length > 0) {

                        reasonsHTML += `

                            <li class="missing-skill">

                                ⚠️ Learn
                                <strong>
                                    ${missingSkills.join(", ")}
                                </strong>

                                to improve your match

                            </li>

                        `;

                    }


                    // If no reason exists

                    if (reasonsHTML === "") {

                        reasonsHTML = `

                            <li>
                                🔎 This opportunity
                                matches your profile.
                            </li>

                        `;

                    }


                    // ================= CARD =================

                    html += `

                        <div class="recommendation-card">


                            <div class="recommendation-top">

                                <span
                                    class="recommendation-badge">

                                    ⭐ Recommended

                                </span>


                                <span
                                    class="match-score">

                                    ${matchPercentage}% Match

                                </span>

                            </div>


                            <h3>
                                ${job.job_title}
                            </h3>


                            <h4>
                                ${job.company_name}
                            </h4>


                            <div
                                class="recommendation-info">

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


                            <p
                                class="matched-skills">

                                🛠 ${job.skills}

                            </p>


                            <div
                                class="why-fit">

                                <h4>
                                    💡 Why this fits you
                                </h4>

                                <ul>

                                    ${reasonsHTML}

                                </ul>

                            </div>


                            <a
                                href="internship-details.html?id=${job.id}"
                                class="recommendation-btn">

                                View Internship →

                            </a>


                        </div>

                    `;

                }
            );


            // ================= INSERT HTML =================

            container.innerHTML = html;

        })


        // ================= ERROR =================

        .catch(error => {

            console.error(
                "Recommendation error:",
                error
            );

            container.innerHTML = `

                <div class="recommendation-empty">

                    <h3>
                        ⚠️ Unable to load recommendations
                    </h3>

                    <p>
                        Please make sure the backend
                        server is running.
                    </p>

                </div>

            `;

        });

}


// ==================================================
// ================= START ===========================
// ==================================================

loadDashboard();

loadRecommendations();