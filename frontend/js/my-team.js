let currentProfileId = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadCurrentUserProfile();

    if (currentProfileId) {
        loadMyTeam();
    }
});


// =====================================================
// Get logged-in user's team profile
// =====================================================
async function loadCurrentUserProfile() {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(storedUser);

    try {

        const response = await fetch(
            `http://localhost:5001/api/team-profiles/user/${user.id}`
        );

        if (!response.ok) {
            throw new Error("Team profile not found");
        }

        const profile = await response.json();

        currentProfileId = profile.id;

        console.log(
            "Current profile ID:",
            currentProfileId
        );

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        document.getElementById("teamContainer").innerHTML = `
            <div class="empty">
                <h3>Create your Team Profile first</h3>
                <p>
                    You need a team profile before viewing your team.
                </p>
            </div>
        `;
    }
}


// =====================================================
// Load connected teammates
// =====================================================
async function loadMyTeam() {

    const container =
        document.getElementById("teamContainer");

    try {

        const response = await fetch(
            `http://localhost:5001/api/team-profiles/connections/${currentProfileId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load team");
        }

        const teammates = await response.json();

        document.getElementById("teamCount").textContent =
            teammates.length;


        // =================================================
        // No teammates
        // =================================================

        if (teammates.length === 0) {

            container.innerHTML = `
                <div class="empty">
                    <h3>No teammates yet 🤝</h3>
                    <p>
                        Accept an invitation to start building your team.
                    </p>
                </div>
            `;

            return;
        }


        // =================================================
        // Display teammates
        // =================================================

        container.innerHTML = teammates.map(member => {

            const email = member.email || "";

            return `
                <div class="teammate-card">

                    <div class="teammate-top">

                        <div class="avatar">
                            👤
                        </div>

                        <div>
                            <h3>
                                ${escapeHTML(member.name)}
                            </h3>

                            <p class="role">
                                ${escapeHTML(member.role)}
                            </p>
                        </div>

                    </div>


                    <div class="info">
                        <strong>💻 Skills:</strong>
                        ${escapeHTML(member.skills)}
                    </div>


                    <div class="info">
                        <strong>⏰ Availability:</strong>
                        ${escapeHTML(member.availability)}
                        hours/week
                    </div>


                    <div class="info">
                        <strong>💬 Communication:</strong>
                        ${escapeHTML(member.communication)}
                    </div>


                    <div class="info">
                        <strong>📚 Experience:</strong>
                        ${escapeHTML(member.experience)}
                    </div>


                    ${
                        email
                        ? `
                            <div class="contact-email">
                                📧 ${escapeHTML(email)}
                            </div>

                            <div class="contact-actions">

                                <button
                                    class="contact-btn"
                                    data-email="${escapeHTML(email)}"
                                    onclick="copyEmail(this.dataset.email)"
                                >
                                    📋 Copy Email
                                </button>

                                <button
                                    class="contact-btn gmail-btn"
                                    data-email="${escapeHTML(email)}"
                                    data-name="${escapeHTML(member.name)}"
                                    onclick="openGmail(
                                        this.dataset.email,
                                        this.dataset.name
                                    )"
                                >
                                    🌐 Open Gmail
                                </button>

                            </div>
                          `
                        : `
                            <div class="contact-unavailable">
                                📧 Email not available
                            </div>
                          `
                    }

<button
    class="remove-teammate-btn"
    onclick="removeTeammate(${currentProfileId}, ${member.id}, '${escapeHTML(member.name || "this teammate")}')">
    ❌ Remove Teammate
</button>

                </div>
            `;

        }).join("");


    } catch (error) {

        console.error(
            "Team loading error:",
            error
        );

        container.innerHTML = `
            <div class="empty">

                <h3>Unable to load your team</h3>

                <p>
                    Please make sure the backend server is running.
                </p>

            </div>
        `;
    }
}


// =====================================================
// Copy teammate email
// =====================================================
async function copyEmail(email) {

    try {

        await navigator.clipboard.writeText(email);

        alert("Email copied: " + email);

    } catch (error) {

        console.error(
            "Copy email error:",
            error
        );

        alert(
            "Unable to copy email. Please copy it manually."
        );
    }
}


// =====================================================
// Open Gmail
// =====================================================
function openGmail(email, name) {

    const subject = encodeURIComponent(
        "Team Collaboration - Internship & Hackathon Aggregator"
    );

    const body = encodeURIComponent(
        `Hello ${name},

I connected with you through the Internship & Hackathon Aggregator.

I would like to discuss our project/team collaboration.

Thank you.`
    );

    const gmailURL =
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;

    window.open(
        gmailURL,
        "_blank"
    );
}


// =====================================================
// Escape HTML
// =====================================================
function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function removeTeammate(profileId, teammateId, teammateName) {

    const confirmed = confirm(
        `Are you sure you want to remove ${teammateName} from your team?`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5001/api/team-profiles/connections/${profileId}/${teammateId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to remove teammate"
            );
        }

        alert("Teammate removed successfully.");

        // Reload the team
        loadMyTeam();

    } catch (error) {

        console.error("Remove teammate error:", error);

        alert(
            error.message || "Failed to remove teammate."
        );
    }
}