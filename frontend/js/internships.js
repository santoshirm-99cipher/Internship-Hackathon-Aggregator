const container = document.getElementById("internshipContainer");
const searchInput = document.getElementById("searchInput");

let internships = [];

const modeFilter = document.getElementById("modeFilter");
const companyFilter = document.getElementById("companyFilter");
const locationFilter = document.getElementById("locationFilter");
const sortFilter = document.getElementById("sortFilter");

// Load internships
fetch("http://localhost:5001/api/internships")
    .then(res => res.json())
    .then(data => {

        internships = data;

        populateFilters();

        displayInternships(internships);

    })
    .catch(err => console.log(err));

// Display internships
function displayInternships(list){

    let html = "";
    const saved = JSON.parse(localStorage.getItem("savedInternships")) || [];

    list.forEach(job => {

        // Skills badges
        let skillsHTML = "";

        if(job.skills){

            const skills = job.skills.split(",");

            skills.forEach(skill => {

                skillsHTML += `
                    <span class="skill">${skill.trim()}</span>
                `;

            });

        }

        let status = "";

const today = new Date();
const deadline = new Date(job.deadline);

const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

if (diffDays < 0) {
    status = `<span class="expired">🔴 Expired</span>`;
}
else if (diffDays <= 7) {
    status = `<span class="closing">🟡 Closing Soon</span>`;
}
else {
    status = `<span class="open">🟢 Open</span>`;
}

        html += `

        <div class="card">

            <div class="company">

                <div class="logo">
                    ${job.company_name.charAt(0)}
                </div>

                <div>

                <h3>${job.company_name}</h3>

${status}

<p>${job.location}</p>

                </div>

            </div>

            <div class="job">
                ${job.job_title}
            </div>

            <p class="info">💻 ${job.mode}</p>

            <p class="info">💰 ${job.stipend}</p>

            <p class="info">
    📅 Apply Before:
    ${new Date(job.deadline).toLocaleDateString()}
</p>

            <p class="info">
                ${job.description || ""}
            </p>

            <div class="skills">

                ${skillsHTML}

            </div>

            <div class="buttons">

    <button
        class="save"
        onclick="saveInternship(${job.id})">

        ${saved.includes(job.id) ? "💜 Saved" : "❤️ Save"}

    </button>

    <a
    href="internship-details.html?id=${job.id}"
    class="apply">

    View Details →

</a>

</div>

        </div>

        `;

    });

    if(html === ""){

    container.innerHTML = `
        <div class="no-result">
            <h2>😔 No internships found</h2>
            <p>Try changing your search or filters.</p>
        </div>
    `;

}else{

    container.innerHTML = html;

}

}

function populateFilters() {

    companyFilter.innerHTML = '<option value="">All Companies</option>';
    locationFilter.innerHTML = '<option value="">All Locations</option>';

    const companies = [...new Set(internships.map(job => job.company_name))]
        .sort();

    companies.forEach(company => {

        companyFilter.innerHTML +=
            `<option value="${company}">${company}</option>`;

    });

    const locations = [...new Set(internships.map(job => job.location))]
        .sort();

    locations.forEach(location => {

        locationFilter.innerHTML +=
            `<option value="${location}">${location}</option>`;

    });

}

// Search
searchInput.addEventListener("keyup", applyFilters);

modeFilter.addEventListener("change", applyFilters);

companyFilter.addEventListener("change", applyFilters);

locationFilter.addEventListener("change", applyFilters);

sortFilter.addEventListener("change", applyFilters);

function applyFilters(){

    let filtered = internships;

    const search = searchInput.value.trim().toLowerCase();
    const mode = modeFilter.value;
    const company = companyFilter.value;
    const location = locationFilter.value;
    const sort = sortFilter.value;

    filtered = filtered.filter(job => {

        const matchesSearch =
            job.company_name.toLowerCase().includes(search) ||
            job.job_title.toLowerCase().includes(search) ||
            job.skills.toLowerCase().includes(search) ||
            job.location.toLowerCase().includes(search);

        const matchesMode =
            !mode || job.mode === mode;

        const matchesCompany =
            !company || job.company_name === company;

        const matchesLocation =
            !location || job.location === location;

        return matchesSearch &&
               matchesMode &&
               matchesCompany &&
               matchesLocation;

    });

    // Sorting

if (sort === "company") {

    filtered.sort((a, b) =>
        a.company_name.localeCompare(b.company_name)
    );

}

else if (sort === "job") {

    filtered.sort((a, b) =>
        a.job_title.localeCompare(b.job_title)
    );

}

else if (sort === "deadline") {

    filtered.sort((a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
    );

}

else if (sort === "stipendHigh") {

    filtered.sort((a, b) =>
        parseInt(b.stipend.replace(/\D/g, "")) -
        parseInt(a.stipend.replace(/\D/g, ""))
    );

}

else if (sort === "stipendLow") {

    filtered.sort((a, b) =>
        parseInt(a.stipend.replace(/\D/g, "")) -
        parseInt(b.stipend.replace(/\D/g, ""))
    );

}

    displayInternships(filtered);

}

function saveInternship(id){

    let saved = JSON.parse(localStorage.getItem("savedInternships")) || [];

    if(!saved.includes(id)){

        saved.push(id);

        localStorage.setItem("savedInternships", JSON.stringify(saved));

    }

    displayInternships(internships);

}