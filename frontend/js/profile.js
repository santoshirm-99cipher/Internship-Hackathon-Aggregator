// ================= SAVED COUNTS =================

const internships =
    JSON.parse(localStorage.getItem("savedInternships")) || [];

const hackathons =
    JSON.parse(localStorage.getItem("savedHackathons")) || [];

document.getElementById("savedInternships").innerText =
    internships.length;

document.getElementById("savedHackathons").innerText =
    hackathons.length;


// ================= REGISTERED USER =================

const user =
    JSON.parse(localStorage.getItem("user")) || {};


// ================= SAVED PROFILE =================

const profile =
    JSON.parse(localStorage.getItem("profile")) || {};


// Use registered account information as default

document.getElementById("name").value =
    profile.name || user.full_name || "";

document.getElementById("email").value =
    profile.email || user.email || "";

document.getElementById("college").value =
    profile.college || "";

document.getElementById("phone").value =
    profile.phone || "";

document.getElementById("skills").value =
    profile.skills || "";

document.getElementById("location").value =
    profile.location || "";


// ================= SAVE PROFILE =================

function saveProfile() {

    const profileData = {

        name:
            document.getElementById("name").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        college:
            document.getElementById("college").value.trim(),

        phone:
            document.getElementById("phone").value.trim(),

        skills:
            document.getElementById("skills").value.trim(),

        location:
            document.getElementById("location").value.trim()

    };


    localStorage.setItem(
        "profile",
        JSON.stringify(profileData)
    );


    alert("Profile Saved Successfully!");


    // Update saved counts

    document.getElementById("savedInternships").innerText =
        (JSON.parse(localStorage.getItem("savedInternships")) || []).length;

    document.getElementById("savedHackathons").innerText =
        (JSON.parse(localStorage.getItem("savedHackathons")) || []).length;

}