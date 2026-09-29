const container = document.getElementById("detailsContainer");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch("http://localhost:5001/api/internships")
    .then(res => res.json())
    .then(data => {

        const job = data.find(item => item.id == id);

        if (!job) {
            container.innerHTML = "<h2>Internship Not Found</h2>";
            return;
        }

        let skillsHTML = "";

        if (job.skills) {
            job.skills.split(",").forEach(skill => {
                skillsHTML += `
                    <span class="skill">
                        ${skill.trim()}
                    </span>
                `;
            });
        }

        const deadline = job.deadline
            ? new Date(job.deadline).toLocaleDateString("en-IN")
            : "Deadline not published";

        container.innerHTML = `

            <div class="details">

                <div class="logo">
                    ${job.company_name.charAt(0)}
                </div>

                <h1>${job.job_title}</h1>

                <h2>${job.company_name}</h2>

                <p class="info">
                    📍 ${job.location || "Not specified"}
                </p>

                <p class="info">
                    💻 ${job.mode || "Not specified"}
                </p>

                <p class="info">
                    💰 ${job.stipend || "Not specified"}
                </p>

                <p class="info">
                    📅 Apply Before: ${deadline}
                </p>

                <div class="application-cost-details">

    <h3>⏱️ Application Cost & Process</h3>

    <div class="cost-grid">

        <div class="cost-item">
            <strong>⏱️ Total Time</strong>
            <span>~${job.application_time_hours || 0} hours</span>
        </div>

        <div class="cost-item">
            <strong>🎯 Interview Rounds</strong>
            <span>${job.interview_rounds || 0} rounds</span>
        </div>

        <div class="cost-item">
            <strong>📝 Assignment</strong>
            <span>${job.assignment_hours || 0} hours</span>
        </div>

        <div class="cost-item">
            <strong>🧪 Assessment</strong>
            <span>${job.assessment_minutes || 0} minutes</span>
        </div>

        <div class="cost-item">
            <strong>📆 Process Duration</strong>
            <span>~${job.process_days || 0} days</span>
        </div>

        ${
            job.response_rate !== null && job.response_rate !== undefined
            ? `
            <div class="cost-item">
                <strong>📩 Response Rate</strong>
                <span>${job.response_rate}%</span>
            </div>
            `
            : ""
        }

    </div>

</div>

                <h3>Skills Required</h3>

                <div class="skills">
                    ${skillsHTML}
                </div>

                <h3>Description</h3>

                <p>
                    ${job.description || "No description available."}
                </p>

                <a
                    href="${job.apply_link}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="apply">

                    Apply Now →

                </a>

            </div>
        `;
    })
    .catch(error => {

        console.error("Error loading internship:", error);

        container.innerHTML = `
            <h2>Unable to load internship</h2>
            <p>Please try again later.</p>
        `;
    });