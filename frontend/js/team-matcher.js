console.log("Team Chemistry Matcher loaded");

let currentProfileId = null;
let currentUserId = null;


// =====================================================
// LOAD LOGGED-IN USER'S TEAM PROFILE
// =====================================================

async function loadCurrentUserProfile() {

    try {

        const userData = localStorage.getItem("user");

        if (!userData) {
            console.warn("No logged-in user found.");
            return;
        }

        const user = JSON.parse(userData);

        if (!user.id) {
            console.warn("Logged-in user ID not found.");
            return;
        }

        currentUserId = Number(user.id);

        console.log("Logged-in user ID:", currentUserId);


        // Get team profile using USER ID
        const response = await fetch(
            `http://localhost:5001/api/team-profiles/user/${currentUserId}`
        );

        if (response.status === 404) {

            console.log(
                "No team profile exists for this user yet."
            );

            return;
        }


        const profile = await response.json();


        if (!response.ok) {

            throw new Error(
                profile.message ||
                "Failed to load team profile"
            );

        }


        // Store the actual TEAM PROFILE ID
        currentProfileId = profile.id;

        localStorage.setItem(
            "teamProfileId",
            currentProfileId
        );


        console.log(
            "Current team profile ID:",
            currentProfileId
        );


        // Fill existing profile data into the form
        const studentName =
            document.getElementById("studentName");

        const skills =
            document.getElementById("skills");

        const role =
            document.getElementById("role");

        const availability =
            document.getElementById("availability");

        const communication =
            document.getElementById("communication");

        const experience =
            document.getElementById("experience");

        const teamStatus =
    document.getElementById("teamStatus");    


        if (studentName)
            studentName.value = profile.name || "";

        if (skills)
            skills.value = profile.skills || "";

        if (role)
            role.value = profile.role || "";

        if (availability)
            availability.value =
                profile.availability ?? "";

        if (communication)
            communication.value =
                profile.communication || "";

        if (experience)
            experience.value =
                profile.experience || "";

        if (teamStatus)
    teamStatus.value =
        profile.team_status || "Looking for Team";


    } catch (error) {

        console.error(
            "Load user profile error:",
            error
        );

    }

}



// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const form =
            document.getElementById(
                "teamProfileForm"
            );

        const matchesContainer =
            document.getElementById(
                "matchesContainer"
            );


        if (!form) return;


        // First find logged-in user's profile
        await loadCurrentUserProfile();



        // =================================================
        // SUBMIT TEAM PROFILE
        // =================================================

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                // Make sure logged-in user exists
                if (!currentUserId) {

                    alert(
                        "⚠️ Please login first."
                    );

                    return;
                }


                const profile = {

                    // IMPORTANT:
                    // Send logged-in USER ID
                    user_id: currentUserId,

                    name:
                        document
                            .getElementById(
                                "studentName"
                            )
                            .value
                            .trim(),

                    skills:
                        document
                            .getElementById(
                                "skills"
                            )
                            .value
                            .trim(),

                    role:
                        document
                            .getElementById(
                                "role"
                            )
                            .value,

                    availability:
                        Number(
                            document
                                .getElementById(
                                    "availability"
                                )
                                .value
                        ),

                    communication:
                        document
                            .getElementById(
                                "communication"
                            )
                            .value,

                    experience:
    document
        .getElementById("experience")
        .value,

team_status:
    document
        .getElementById("teamStatus")
        .value

                };



                try {

                    // ======================================
                    // 1. SAVE / UPDATE PROFILE
                    // ======================================

                    const saveResponse =
                        await fetch(
                            "http://localhost:5001/api/team-profiles",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(profile)
                            }
                        );


                    const savedData =
                        await saveResponse.json();


                    if (!saveResponse.ok) {

                        throw new Error(
                            savedData.message ||
                            "Failed to save profile"
                        );

                    }


                    // Save returned TEAM PROFILE ID
                    currentProfileId =
                        savedData.profileId;


                    localStorage.setItem(
                        "teamProfileId",
                        currentProfileId
                    );


                    console.log(
                        "Current profile ID:",
                        currentProfileId
                    );


                    // ======================================
                    // 2. FIND MATCHES
                    // ======================================

                    console.log("MATCH REQUEST USING PROFILE ID:", currentProfileId);
console.log("CURRENT USER ID:", currentUserId);

const matchResponse =
    await fetch(
        `http://localhost:5001/api/team-profiles/matches/${currentProfileId}`
    );


                    const matches =
                        await matchResponse.json();


                    if (!matchResponse.ok) {

                        throw new Error(
                            matches.message ||
                            "Could not find matches"
                        );

                    }


                    displayMatches(
                        matches
                    );


                    document
                        .querySelector(
                            ".matches-section"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });


                } catch (error) {

                    console.error(
                        "Team matcher error:",
                        error
                    );


                    alert(
                        "❌ Something went wrong. Check the backend."
                    );

                }

            }
        );



        // =================================================
        // DISPLAY MATCHES
        // =================================================

        function displayMatches(matches) {

            if (!matchesContainer) return;


            if (matches.length === 0) {

                matchesContainer.innerHTML = `
                    <div class="no-matches">

                        <h3>
                            😕 No teammates found yet
                        </h3>

                        <p>
                            Check back when more students
                            create profiles.
                        </p>

                    </div>
                `;

                return;
            }


            matchesContainer.innerHTML =
                matches
                    .map(match => {

                        const breakdown =
                            match.breakdown || {};


                        return `
                            <div class="match-card">

                                <div class="match-header">

                                    <div>

                                        <h3>
                                            ${match.name}
                                        </h3>

                                        <p>
                                            ${match.role}
                                        </p>

                                    </div>


                                    <div class="match-score">

                                        ${match.matchScore}%

                                        <span>
                                            Team Chemistry
                                        </span>

                                    </div>

                                </div>


                                <div class="match-skills">

                                    <strong>
                                        🛠 Skills
                                    </strong>

                                    <p>
                                        ${match.skills}
                                    </p>

                                </div>


                                <div class="chemistry-breakdown">

                                    <h4>
                                        🧩 Team Chemistry Breakdown
                                    </h4>


                                    ${createChemistryItem(
                                        "🛠 Skills",
                                        breakdown.skills || 0,
                                        25
                                    )}


                                    ${createChemistryItem(
                                        "🎯 Role",
                                        breakdown.role || 0,
                                        25
                                    )}


                                    ${createChemistryItem(
                                        "⏰ Availability",
                                        breakdown.availability || 0,
                                        20
                                    )}


                                    ${createChemistryItem(
                                        "💬 Communication",
                                        breakdown.communication || 0,
                                        15
                                    )}


                                    ${createChemistryItem(
                                        "🏆 Experience",
                                        breakdown.experience || 0,
                                        15
                                    )}

                                </div>


                                <div class="match-reasons">

                                    <strong>
                                        💡 Why you match
                                    </strong>

                                    ${(match.reasons || [])
                                        .map(
                                            reason => `
                                                <p>
                                                    ${reason}
                                                </p>
                                            `
                                        )
                                        .join("")}

                                </div>


                                <button
                                    class="invite-btn"
                                    onclick="
                                        inviteTeammate(
                                            ${match.id},
                                            '${match.name.replace(
                                                /'/g,
                                                "\\'"
                                            )}'
                                        )
                                    "
                                >
                                    🤝 Invite Teammate
                                </button>

                            </div>
                        `;

                    })
                    .join("");
        }



        // =================================================
        // CHEMISTRY ITEM
        // =================================================

        function createChemistryItem(
            label,
            score,
            maximum
        ) {

            const percentage =
                (score / maximum) * 100;


            return `
                <div class="chemistry-item">

                    <div class="chemistry-label">

                        <span>
                            ${label}
                        </span>

                        <strong>
                            ${score}/${maximum}
                        </strong>

                    </div>


                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="
                                width: ${percentage}%;
                            "
                        ></div>

                    </div>

                </div>
            `;
        }

    }
);



// =====================================================
// SEND TEAM INVITATION
// =====================================================

async function inviteTeammate(
    receiverId,
    receiverName
) {

    if (!currentProfileId) {

        alert(
            "⚠️ Please create your team profile first."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5001/api/team-invitations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        sender_id:
                            currentProfileId,

                        receiver_id:
                            receiverId

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                `⚠️ ${data.message}`
            );

            return;
        }


        alert(
            `🤝 Invitation sent to ${receiverName}!`
        );


        console.log(
            "Invitation created:",
            data
        );


    } catch (error) {

        console.error(
            "Invitation error:",
            error
        );


        alert(
            "❌ Could not send invitation. Check the backend."
        );

    }

}