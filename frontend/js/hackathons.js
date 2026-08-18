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

        displayHackathons(hackathons);

    })

    .catch(error => {

        console.error(
            "Error loading hackathons:",
            error
        );

    });


// ================= DISPLAY =================

function displayHackathons(list) {

    let output = "";

    const saved =
        JSON.parse(
            localStorage.getItem("savedHackathons")
        ) || [];


    list.forEach(hackathon => {

        // Deadline status

        const today = new Date();

        const deadline =
            new Date(hackathon.deadline);

        const diffDays =
            Math.ceil(
                (deadline - today) /
                (1000 * 60 * 60 * 24)
            );

            let status = "";

if (diffDays < 0) {

    status =
        `<span class="expired">
            🔴 Expired
        </span>`;

}

else if (diffDays === 0) {

    status =
        `<span class="closing">
            🟡 Closing Today
        </span>`;

}

else if (diffDays <= 7) {

    status =
        `<span class="closing">
            🟡 Closing Soon • ${diffDays} day${diffDays === 1 ? "" : "s"} left
        </span>`;

}

else {

    status =
        `<span class="open">
            🟢 Open • ${diffDays} days left
        </span>`;

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
                    ${deadline.toLocaleDateString("en-IN")}
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
                            ? "💜 Saved"
                            : "❤️ Save"}

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

    if (sort === "deadline") {

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

    if (sort === "deadline") {

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