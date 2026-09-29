let currentProfileId = null;
let currentUserName = "";
let currentTeamId = null;


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

    await loadCurrentUserProfile();

    if (!currentProfileId) {
        return;
    }

    await loadMyTeam();

    if (!currentTeamId) {
        return;
    }

    await loadTeamMembers();

    await loadMessages();

    // Refresh messages every 5 seconds
    setInterval(loadMessages, 5000);
});


// ===============================
// LOAD CURRENT USER
// ===============================

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
        currentUserName = profile.name;

        console.log(
            "Current profile ID:",
            currentProfileId
        );

        document.getElementById("teamInfo").textContent =
            `Logged in as ${profile.name}`;

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        document.getElementById(
            "messagesContainer"
        ).innerHTML = `
            <div class="empty-message">
                <h3>Create your Team Profile first</h3>
                <p>You need a team profile to use Project Discussion.</p>
            </div>
        `;
    }
}


// ===============================
// FIND TEAM
// ===============================

async function loadMyTeam() {

    try {

        const response = await fetch(
            `http://localhost:5001/api/team-messages/my-team/${currentProfileId}`
        );

        const data = await response.json();

        console.log("Team response:", data);

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to find team"
            );
        }

        currentTeamId = data.teamId;

        console.log(
            "Current Team ID:",
            currentTeamId
        );

        document.getElementById("teamInfo").textContent =
            `Logged in as ${currentUserName} • Team ID: ${currentTeamId}`;

    } catch (error) {

        console.error(
            "Team loading error:",
            error
        );

        document.getElementById(
            "messagesContainer"
        ).innerHTML = `
            <div class="empty-message">
                Unable to find your team.
            </div>
        `;
    }
}


// ===============================
// LOAD TEAM MEMBERS
// ===============================

async function loadTeamMembers() {

    try {

        const response = await fetch(
            `http://localhost:5001/api/team-profiles/connections/${currentProfileId}`
        );

        const data = await response.json();

        console.log(
            "Team members response:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load team members"
            );
        }

        const list =
            document.getElementById("teamMembersList");

        const members = [
            {
                id: currentProfileId,
                name: currentUserName
            },
            ...data
        ];

        list.innerHTML = members.map(member => {

            const isCurrent =
                Number(member.id) ===
                Number(currentProfileId);

            return `
                <span class="team-member ${isCurrent ? "current" : ""}">
                    ${isCurrent ? "👤" : "👥"}
                    ${escapeHTML(member.name || "Team Member")}
                    ${isCurrent ? " (You)" : ""}
                </span>
            `;

        }).join("");

    } catch (error) {

        console.error(
            "Team members loading error:",
            error
        );

        document.getElementById(
            "teamMembersList"
        ).innerHTML = `
            <span class="team-member">
                Unable to load members
            </span>
        `;
    }
}


// ===============================
// LOAD MESSAGES
// ===============================

async function loadMessages() {

    if (!currentTeamId) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5001/api/team-messages/${currentTeamId}`
        );

        const messages = await response.json();

        console.log(
            "Messages response:",
            messages
        );

        if (!response.ok) {
            throw new Error(
                messages.message ||
                "Failed to load messages"
            );
        }

        displayMessages(messages);

    } catch (error) {

        console.error(
            "Load messages error:",
            error
        );

        document.getElementById(
            "messagesContainer"
        ).innerHTML = `
            <div class="empty-message">
                Unable to load messages.
            </div>
        `;
    }
}


// ===============================
// DISPLAY MESSAGES
// ===============================

function displayMessages(messages) {

    const container =
        document.getElementById(
            "messagesContainer"
        );

    if (messages.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                <h3>💬 No messages yet</h3>
                <p>Start the discussion with your team.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        messages.map(message => {

            const isMine =
                Number(message.sender_id) ===
                Number(currentProfileId);

            const time =
                new Date(
                    message.created_at
                ).toLocaleString();

            return `
                <div class="message ${isMine ? "mine" : "other"}">

                    <div class="message-name">
                        ${escapeHTML(
                            message.sender_name ||
                            "Team Member"
                        )}
                    </div>

                    <div class="message-bubble">
                        ${escapeHTML(
                            message.message
                        )}
                    </div>

                    <div class="message-time">
                        ${time}
                    </div>

                </div>
            `;

        }).join("");

    container.scrollTop =
        container.scrollHeight;
}


// ===============================
// SEND MESSAGE
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "messageForm"
            );

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "messageInput"
                    );

                const message =
                    input.value.trim();

                if (!message) {
                    return;
                }

                if (!currentProfileId) {
                    alert(
                        "Please create your team profile first."
                    );
                    return;
                }

                if (!currentTeamId) {
                    alert(
                        "Team could not be found."
                    );
                    return;
                }

                try {

                    const response =
                        await fetch(
                            "http://localhost:5001/api/team-messages",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    team_id:
                                        currentTeamId,

                                    sender_id:
                                        currentProfileId,

                                    message:
                                        message
                                })
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            "Failed to send message"
                        );
                    }

                    input.value = "";

                    await loadMessages();

                    input.focus();

                } catch (error) {

                    console.error(
                        "Send message error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Unable to send message."
                    );
                }
            }
        );
    }
);


// ===============================
// SECURITY
// ===============================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(
            /'/g,
            "&#039;"
        );
}