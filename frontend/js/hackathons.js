const container =
    document.getElementById("hackathonContainer");

const searchInput =
    document.getElementById("searchInput");

const modeFilter =
    document.getElementById("modeFilter");

const sortFilter =
    document.getElementById("sortFilter");


let hackathons = [];


// ================= LOAD HACKATHONS =================

fetch("http://localhost:5001/api/hackathons")

    .then(response => response.json())

    .then(data => {

        hackathons = data;

        applyFilters();

    })

    .catch(error => {

        console.error(
            "Error loading hackathons:",
            error
        );

    });

    // ================= HACKATHON STATUS =================

// ================= HACKATHON STATUS =================

function getHackathonStatus(deadline) {

    if (!deadline) {
        return {
            text: "Open",
            priority: 1
        };
    }

    // Get only YYYY-MM-DD
    const dateString =
        String(deadline).split("T")[0];

    const deadlineDate =
        new Date(dateString + "T23:59:59");

    if (isNaN(deadlineDate.getTime())) {
        return {
            text: "Open",
            priority: 1
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
        (deadlineDate - today) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
        return {
            text: "Expired",
            priority: 3
        };
    }

    if (diffDays <= 7) {
        return {
            text: "Closing Soon",
            priority: 2
        };
    }

    return {
        text: "Open",
        priority: 1
    };
}


// ================= DISPLAY =================

function displayHackathons(list) {

    let output = "";

    const saved =
        JSON.parse(
            localStorage.getItem("savedHackathons")
        ) || [];


    list.forEach(hackathon => {

        // Deadline status

        const dateString =
    String(hackathon.deadline).split("T")[0];

const deadline =
    new Date(dateString + "T23:59:59");

const statusInfo =
    getHackathonStatus(hackathon.deadline);

const diffDays =
    Math.ceil(
        (deadline - new Date()) /
        (1000 * 60 * 60 * 24)
    );

let status = "";

if (statusInfo.priority === 3) {

    status = `
        <span class="expired">
            🔴 Expired
        </span>
    `;

}

else if (statusInfo.priority === 2) {

    status = `
        <span class="closing">
            🟡 Closing Soon
        </span>
    `;

}

else {

    status = `
        <span class="open">
            🟢 Open
        </span>
    `;

}


        output += `

            <div class="card">

                <h2>
                    ${hackathon.event_name}
                </h2>

                <h3>
                    ${hackathon.organizer}
                </h3>

                <p>
                    <strong>Mode:</strong>
                    ${hackathon.mode}
                </p>

                <p>
                    <strong>Prize:</strong>
                    ${hackathon.prize}
                </p>

                <p>
                    <strong>Deadline:</strong>
                    ${new Date(
    dateString + "T00:00:00"
).toLocaleDateString("en-IN")}
                </p>

                ${status}


                <div class="buttons">

                    <button
                        onclick="showDetails(${hackathon.id})">

                        View Details

                    </button>


                    <a
                        href="${hackathon.registration_link}"
                        target="_blank">

                        <button>
                            Register
                        </button>

                    </a>


                    <button
                        onclick="saveHackathon(${hackathon.id})">

                        ${saved.includes(hackathon.id)
                            ? " Saved"
                            : " Save"}

                    </button>

                </div>

            </div>

        `;

    });


    if (output === "") {

        container.innerHTML = `

            <div class="no-result">

                <h2>
                    😔 No hackathons found
                </h2>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

    }

    else {

        container.innerHTML = output;

    }

}


// ================= FILTERS =================

searchInput.addEventListener(
    "keyup",
    applyFilters
);

modeFilter.addEventListener(
    "change",
    applyFilters
);

sortFilter.addEventListener(
    "change",
    applyFilters
);


function applyFilters() {

    let filtered = [...hackathons];

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const mode =
        modeFilter.value;

    const sort =
        sortFilter.value;


    // ================= SEARCH =================

    filtered = filtered.filter(event => {

        return (
            (event.event_name || "")
                .toLowerCase()
                .includes(search)

            ||

            (event.organizer || "")
                .toLowerCase()
                .includes(search)
        );

    });


    // ================= MODE =================

    if (mode) {

        filtered = filtered.filter(
            event => event.mode === mode
        );

    }


    // ================= SORTING =================

    // DEFAULT:
    // Open → Closing Soon → Expired

    if (sort === "") {

        filtered.sort((a, b) => {

            const statusA =
                getHackathonStatus(a.deadline);

            const statusB =
                getHackathonStatus(b.deadline);


            // Status priority
            // Open = 1
            // Closing Soon = 2
            // Expired = 3

            if (
                statusA.priority !==
                statusB.priority
            ) {

                return (
                    statusA.priority -
                    statusB.priority
                );

            }


            // Same status:
            // nearest deadline first

            return (
                new Date(a.deadline) -
                new Date(b.deadline)
            );

        });

    }


    // ================= DEADLINE =================

    else if (sort === "deadline") {

        filtered.sort((a, b) => {

            return (
                new Date(a.deadline) -
                new Date(b.deadline)
            );

        });

    }


    // ================= NAME =================

    else if (sort === "name") {

        filtered.sort((a, b) => {

            return a.event_name.localeCompare(
                b.event_name
            );

        });

    }


    // ================= PRIZE =================

    else if (sort === "prizeHigh") {

        filtered.sort((a, b) => {

            return (
                getPrize(b.prize) -
                getPrize(a.prize)
            );

        });

    }


    // ================= DISPLAY =================

    displayHackathons(filtered);

}


// ================= PRIZE =================

function getPrize(prize) {

    if (!prize) return 0;

    return parseInt(
        prize.replace(/\D/g, "")
    ) || 0;

}


// ================= SAVE =================
function saveHackathon(id) {

    let saved =
        JSON.parse(
            localStorage.getItem("savedHackathons")
        ) || [];

    id = Number(id);

    if (saved.includes(id)) {

        saved = saved.filter(
            savedId => savedId !== id
        );

    } else {

        saved.push(id);

    }

    localStorage.setItem(
        "savedHackathons",
        JSON.stringify(saved)
    );

    applyFilters();
}

function getCurrentlyDisplayedHackathons() {

    let filtered = [...hackathons];

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const mode =
        modeFilter.value;

    const sort =
        sortFilter.value;


    // Search

    filtered = filtered.filter(event => {

        return (
            event.event_name
                .toLowerCase()
                .includes(search)

            ||

            event.organizer
                .toLowerCase()
                .includes(search)
        );

    });


    // Mode

    if (mode) {

        filtered =
            filtered.filter(
                event =>
                    event.mode === mode
            );

    }


    // Sorting

    // ================= SORTING =================

if (sort === "") {

    filtered.sort((a, b) => {

        const statusA =
            getHackathonStatus(a.deadline);

        const statusB =
            getHackathonStatus(b.deadline);

        if (statusA.priority !== statusB.priority) {
            return statusA.priority - statusB.priority;
        }

        return new Date(a.deadline) -
               new Date(b.deadline);

    });

}

else if (sort === "deadline") {

    filtered.sort(
        (a, b) =>
            new Date(a.deadline) -
            new Date(b.deadline)
    );

}

else if (sort === "name") {

    filtered.sort(
        (a, b) =>
            a.event_name.localeCompare(
                b.event_name
            )
    );

}

else if (sort === "prizeHigh") {

    filtered.sort(
        (a, b) =>
            getPrize(b.prize) -
            getPrize(a.prize)
    );

}
    return filtered;
}

// ================= DETAILS =================

function showDetails(id) {

    const hackathon =
        hackathons.find(
            h => h.id == id
        );


    if (!hackathon) return;


    document.getElementById(
        "modalBody"
    ).innerHTML = `

        <h2>
            ${hackathon.event_name}
        </h2>

        <h3>
            ${hackathon.organizer}
        </h3>

        <p>
            <strong>📍 Mode:</strong>
            ${hackathon.mode}
        </p>

        <p>
            <strong>🏆 Prize:</strong>
            ${hackathon.prize}
        </p>

        <p>
            <strong>📅 Deadline:</strong>
            ${new Date(
                hackathon.deadline
            ).toLocaleDateString("en-IN")}
        </p>

        <p>
            <strong>👥 Team Size:</strong>
            ${hackathon.team_size || "Not specified"}
        </p>

        <p>
            <strong>🎓 Eligibility:</strong>
            ${hackathon.eligibility || "Not specified"}
        </p>

        <p>
            <strong>Description:</strong>
        </p>

        <p>
            ${hackathon.description ||
              "No description available."}
        </p>

        <br>

        <a
            href="${hackathon.registration_link}"
            target="_blank">

            <button class="registerBtn">
                Register Now
            </button>

        </a>

    `;


    document.getElementById(
        "hackathonModal"
    ).style.display = "flex";

}


// ================= CLOSE MODAL =================

function closeModal() {

    document.getElementById(
        "hackathonModal"
    ).style.display = "none";

}


window.onclick = function(event) {

    const modal =
        document.getElementById(
            "hackathonModal"
        );


    if (event.target === modal) {

        modal.style.display = "none";

    }

};