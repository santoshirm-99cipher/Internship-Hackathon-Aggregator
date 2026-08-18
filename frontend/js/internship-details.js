const container = document.getElementById("detailsContainer");

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

fetch(`http://localhost:5001/api/internships`)
.then(res=>res.json())
.then(data=>{

    const job = data.find(item=>item.id == id);

    if(!job){

        container.innerHTML="<h2>Internship Not Found</h2>";

        return;

    }

    let skillsHTML="";

    if(job.skills){

        job.skills.split(",").forEach(skill=>{

            skillsHTML += `<span class="skill">${skill.trim()}</span>`;

        });

    }

    container.innerHTML=`

<div class="details">

<div class="logo">

${job.company_name.charAt(0)}

</div>

<h1>${job.job_title}</h1>

<h2>${job.company_name}</h2>

<p class="info">📍 ${job.location}</p>

<p class="info">💻 ${job.mode}</p>

<p class="info">💰 ${job.stipend}</p>

<p class="info">

📅 Apply Before

${new Date(job.deadline).toLocaleDateString()}

</p>

<h3>Skills Required</h3>

<div class="skills">

${skillsHTML}

</div>

<h3>Description</h3>

<p>

${job.description}

</p>

<a

href="${job.apply_link}"

target="_blank"

class="apply">

Apply Now →

</a>

</div>

`;

});