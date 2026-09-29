console.log("Team Invitations loaded");

let currentProfileId = null;
let currentUserId = null;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    const profileLoaded = await loadCurrentUserProfile();

    if (profileLoaded) {
        await loadInvitations();
        await loadSentInvitations();
    }

});


// =====================================================
// GET LOGGED-IN USER'S TEAM PROFILE
// =====================================================

async function loadCurrentUserProfile() {

    try {

        const userData = localStorage.getItem("user");

        if (!userData) {

            console.warn("No logged-in user found.");

            window.location.href = "login.html";

            return false;
        }

        const user = JSON.parse(userData);

        if (!user.id) {

            console.warn("Logged-in user ID not found.");

            return false;
        }

        currentUserId = Number(user.id);

        console.log(
            "Logged-in user ID:",
            currentUserId
        );


        const response = await fetch(
            `http://localhost:5001/api/team-profiles/user/${currentUserId}`
        );


        if (response.status === 404) {

            console.log(
                "No team profile exists for this user yet."
            );

            return false;
        }


        const profile = await response.json();


        if (!response.ok) {

            throw new Error(
                profile.message ||
                "Failed to load team profile"
            );
        }


        currentProfileId = Number(profile.id);


        localStorage.setItem(
            "teamProfileId",
            currentProfileId
        );


        console.log(
            "Current team profile ID:",
            currentProfileId
        );


        return true;


    } catch (error) {

        console.error(
            "Load current profile error:",
            error
        );

        return false;
    }

}


// =====================================================
// LOAD RECEIVED INVITATIONS
// =====================================================

async function loadInvitations() {

    const container =
        document.getElementById(
            "invitationsContainer"
        );


    if (!container) {

        console.error(
            "invitationsContainer not found."
        );

        return;
    }


    if (!currentProfileId) {

        container.innerHTML = `
            <div class="no-invitations">

                <div class="icon">
                    📩
                </div>

                <h2>
                    Create Your Team Profile First
                </h2>

                <p>
                    You need a Team Matcher profile
                    before you can receive invitations.
                </p>

                <a
                    href="team-matcher.html"
                    class="matcher-link"
                >
                    Go to Team Matcher →
                </a>

            </div>
        `;

        return;
    }


    try {

        console.log(
            "Loading received invitations for profile:",
            currentProfileId
        );


        const response = await fetch(
            `http://localhost:5001/api/team-invitations/received/${currentProfileId}`
        );


        const invitations = await response.json();


        if (!response.ok) {

            throw new Error(
                invitations.message ||
                "Failed to load invitations"
            );
        }


        console.log(
            "Received invitations:",
            invitations
        );


        displayInvitations(invitations);


    } catch (error) {

        console.error(
            "Invitation loading error:",
            error
        );


        container.innerHTML = `
            <div class="no-invitations">

                <div class="icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Invitations
                </h2>

                <p>
                    Please make sure the backend
                    server is running.
                </p>

            </div>
        `;
    }

}


// =====================================================
// DISPLAY RECEIVED INVITATIONS
// =====================================================

function displayInvitations(invitations) {

    const container =
        document.getElementById(
            "invitationsContainer"
        );


    if (!container) return;


    if (
        !invitations ||
        invitations.length === 0
    ) {

        container.innerHTML = `
            <div class="no-invitations">

                <div class="icon">
                    📭
                </div>

                <h2>
                    No Invitations Yet
                </h2>

                <p>
                    You don't have any team
                    invitations right now.
                </p>

                <a
                    href="team-matcher.html"
                    class="matcher-link"
                >
                    Find Team Members →
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML =
        invitations.map(invitation => {

            const status =
                String(invitation.status || "")
                    .toLowerCase();


            const statusClass =
                status === "pending"
                    ? "status-pending"
                    : status === "accepted"
                        ? "status-accepted"
                        : "status-declined";


            return `
                <div class="invitation-card">

                    <div class="invitation-header">

                        <div>

                            <h2>
                                ${escapeHTML(
                                    invitation.sender_name
                                )}
                            </h2>

                            <p>
                                ${escapeHTML(
                                    invitation.sender_role
                                )}
                            </p>

                        </div>


                        <span
                            class="invitation-status ${statusClass}"
                        >
                            ${escapeHTML(
                                invitation.status
                            )}
                        </span>

                    </div>


                    <div class="invitation-info">

                        <div class="info-item">

                            <strong>
                                💻 Skills
                            </strong>

                            <span>
                                ${
                                    escapeHTML(
                                        invitation.sender_skills ||
                                        "Not specified"
                                    )
                                }
                            </span>

                        </div>


                        <div class="info-item">

                            <strong>
                                ⏰ Availability
                            </strong>

                            <span>
                                ${
                                    invitation.sender_availability ||
                                    0
                                }
                                hours/week
                            </span>

                        </div>


                        <div class="info-item">

                            <strong>
                                💬 Communication
                            </strong>

                            <span>
                                ${
                                    escapeHTML(
                                        invitation.sender_communication ||
                                        "Not specified"
                                    )
                                }
                            </span>

                        </div>


                        <div class="info-item">

                            <strong>
                                📚 Experience
                            </strong>

                            <span>
                                ${
                                    escapeHTML(
                                        invitation.sender_experience ||
                                        "Not specified"
                                    )
                                }
                            </span>

                        </div>

                    </div>


                    <div class="invitation-date">

                        Received:
                        ${formatDate(
                            invitation.created_at
                        )}

                    </div>


                    ${
                        invitation.status === "Pending"
                        ? `
                            <div class="invitation-actions">

                                <button
                                    class="accept-btn"
                                    onclick="
                                        updateInvitation(
                                            ${invitation.id},
                                            'Accepted'
                                        )
                                    "
                                >
                                    ✓ Accept
                                </button>


                                <button
                                    class="decline-btn"
                                    onclick="
                                        updateInvitation(
                                            ${invitation.id},
                                            'Declined'
                                        )
                                    "
                                >
                                    ✕ Decline
                                </button>

                            </div>
                        `
                        : ""
                    }

                </div>
            `;

        }).join("");

}


// =====================================================
// LOAD SENT INVITATIONS
// =====================================================

async function loadSentInvitations() {

    const container =
        document.getElementById(
            "sentInvitationsContainer"
        );


    if (!container) {

        console.error(
            "sentInvitationsContainer not found."
        );

        return;
    }


    if (!currentProfileId) {

        container.innerHTML = `
            <div class="no-invitations">

                <div class="icon">
                    📤
                </div>

                <h2>
                    Create Your Team Profile First
                </h2>

                <p>
                    Create your Team Matcher profile
                    before sending invitations.
                </p>

            </div>
        `;

        return;
    }


    try {

        console.log(
            "Loading sent invitations for profile:",
            currentProfileId
        );


        const response = await fetch(
            `http://localhost:5001/api/team-invitations/sent/${currentProfileId}`
        );


        const invitations = await response.json();


        if (!response.ok) {

            throw new Error(
                invitations.message ||
                "Failed to load sent invitations"
            );
        }


        console.log(
            "Sent invitations:",
            invitations
        );


        displaySentInvitations(
            invitations
        );


    } catch (error) {

        console.error(
            "Sent invitations loading error:",
            error
        );


        container.innerHTML = `
            <div class="no-invitations">

                <div class="icon">
                    ⚠️
                </div>

                <h2>
                    Unable to Load Sent Invitations
                </h2>

                <p>
                    Please make sure the backend
                    server is running.
                </p>

            </div>
        `;
    }

}


// =====================================================
// DISPLAY SENT INVITATIONS
// =====================================================

function displaySentInvitations(invitations) {

    const container =
        document.getElementById(
            "sentInvitationsContainer"
        );


    if (!container) return;


    if (
        !invitations ||
        invitations.length === 0
    ) {

        container.innerHTML = `
            <div class="no-invitations">

                <div class="icon">
                    📤
                </div>

                <h2>
                    No Sent Invitations
                </h2>

                <p>
                    You haven't invited anyone
                    to join your team yet.
                </p>

                <a
                    href="team-matcher.html"
                    class="matcher-link"
                >
                    Find Team Members →
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML =
        invitations.map(invitation => {

            const status =
                String(invitation.status || "")
                    .toLowerCase();


            const statusClass =
                status === "pending"
                    ? "status-pending"
                    : status === "accepted"
                        ? "status-accepted"
                        : "status-declined";


            return `
                <div class="invitation-card">

                    <div class="invitation-header">

                        <div>

                            <h2>
                                ${escapeHTML(
                                    invitation.name
                                )}
                            </h2>

                            <p>
                                ${escapeHTML(
                                    invitation.role
                                )}
                            </p>

                        </div>


                        <span
                            class="invitation-status ${statusClass}"
                        >
                            ${escapeHTML(
                                invitation.status
                            )}
                        </span>

                    </div>


                    <div class="invitation-info">

                        <div class="info-item">

                            <strong>
                                💻 Skills
                            </strong>

                            <span>
                                ${
                                    escapeHTML(
                                        invitation.skills ||
                                        "Not specified"
                                    )
                                }
                            </span>

                        </div>


                        <div class="info-item">

                            <strong>
                                📧 Email
                            </strong>

                            <span>
                                ${
                                    escapeHTML(
                                        invitation.email ||
                                        "Not available"
                                    )
                                }
                            </span>

                        </div>


                        <div class="info-item">

                            <strong>
                                ⏰ Availability
                            </strong>

                            <span>
                                ${
                                    invitation.availability ||
                                    0
                                }
                                hours/week
                            </span>

                        </div>


                        <div class="info-item">

                            <strong>
                                📚 Experience
                            </strong>

                            <span>
                                ${
                                    escapeHTML(
                                        invitation.experience ||
                                        "Not specified"
                                    )
                                }
                            </span>

                        </div>

                    </div>


                    <div class="invitation-date">

                        ${
                            status === "accepted"
                                ? "✓ Invitation accepted"
                                : status === "pending"
                                    ? "⏳ Waiting for response"
                                    : "✕ Invitation declined"
                        }

                    </div>


                    ${
                        status === "accepted"
                            ? `
                                <div class="sent-accepted-message">
                                    🤝 You are now connected!
                                    <br>
                                    <a href="my-team.html">
                                        View My Team →
                                    </a>
                                </div>
                              `
                            : ""
                    }

                </div>
            `;

        }).join("");

}


// =====================================================
// ACCEPT / DECLINE INVITATION
// =====================================================

async function updateInvitation(
    invitationId,
    status
) {

    if (!currentProfileId) {

        alert(
            "⚠️ Your team profile could not be found."
        );

        return;
    }


    const action =
        status === "Accepted"
            ? "accept"
            : "decline";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} this invitation?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `http://localhost:5001/api/team-invitations/${invitationId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    receiver_id:
                        Number(
                            currentProfileId
                        ),

                    status:
                        status
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update invitation"
            );
        }


        alert(
            `Invitation ${status.toLowerCase()} successfully!`
        );


        console.log(
            "Invitation updated:",
            data
        );


        await loadInvitations();

        await loadSentInvitations();


    } catch (error) {

        console.error(
            "Invitation update error:",
            error
        );


        alert(
            "Unable to update invitation."
        );
    }

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateString) {

    if (!dateString) {
        return "Unknown";
    }


    return new Date(
        dateString
    ).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}