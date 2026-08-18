const container = document.getElementById("savedContainer");

let html = "";


// ================= SAVED INTERNSHIPS =================

const savedInternships =
    JSON.parse(localStorage.getItem("savedInternships")) || [];

fetch("http://localhost:5001/api/internships")
    .then(res => res.json())
    .then(data => {

        const jobs = data.filter(job =>
            savedInternships.includes(job.id)
        );

        jobs.forEach(job => {

            html += `

                <div class="card">

                    <h2>
                        💼 ${job.job_title}
                    </h2>

                    <h3>
                        ${job.company_name}
                    </h3>

                    <p>
                        📍 <strong>Location:</strong>
                        ${job.location}
                    </p>

                    <p>
                        💻 <strong>Mode:</strong>
                        ${job.mode}
                    </p>

                    <p>
                        💰 <strong>Stipend:</strong>
                        ${job.stipend}
                    </p>

                    <p>
                        📅 <strong>Deadline:</strong>
                        ${new Date(job.deadline).toLocaleDateString("en-IN")}
                    </p>

                    <a href="${job.apply_link}" target="_blank">

                        <button>
                            Apply Now →
                        </button>

                    </a>

                    <button
                        onclick="removeSaved('internship', ${job.id})"
                        style="background:#ef4444; margin-left:8px;">

                        Remove

                    </button>

                </div>

            `;

        });


        // ================= SAVED HACKATHONS =================

        const savedHackathons =
            JSON.parse(localStorage.getItem("savedHackathons")) || [];

        return fetch("http://localhost:5001/api/hackathons")
            .then(res => res.json())
            .then(events => {

                const hacks = events.filter(event =>
                    savedHackathons.includes(event.id)
                );


                hacks.forEach(event => {

                    html += `

                        <div class="card">

                            <h2>
                                🏆 ${event.event_name}
                            </h2>

                            <h3>
                                ${event.organizer}
                            </h3>

                            <p>
                                💻 <strong>Mode:</strong>
                                ${event.mode}
                            </p>

                            <p>
                                🏆 <strong>Prize:</strong>
                                ${event.prize}
                            </p>

                            <p>
                                📅 <strong>Deadline:</strong>
                                ${new Date(event.deadline).toLocaleDateString("en-IN")}
                            </p>

                            <a
                                href="${event.registration_link}"
                                target="_blank">

                                <button>
                                    Register →
                                </button>

                            </a>

                            <button
                                onclick="removeSaved('hackathon', ${event.id})"
                                style="background:#ef4444; margin-left:8px;">

                                Remove

                            </button>

                        </div>

                    `;

                });


                // ================= EMPTY STATE =================

                if (html === "") {

                    container.innerHTML = `

                        <div class="no-saved">

                            <div class="empty-icon">
                                ❤️
                            </div>

                            <h2>
                                No saved opportunities yet
                            </h2>

                            <p>
                                Save internships and hackathons
                                you are interested in.
                            </p>

                            <a
                                href="internships.html"
                                class="explore-btn">

                                Explore Internships →

                            </a>

                        </div>

                    `;

                } else {

                    container.innerHTML = html;

                }

            });

    })
    .catch(error => {

        console.error(
            "Error loading saved opportunities:",
            error
        );

    });


// ================= REMOVE SAVED =================

function removeSaved(type, id) {

    const key =
        type === "internship"
            ? "savedInternships"
            : "savedHackathons";


    let saved =
        JSON.parse(localStorage.getItem(key)) || [];


    saved = saved.filter(item =>
        item != id
    );


    localStorage.setItem(
        key,
        JSON.stringify(saved)
    );


    location.reload();

}