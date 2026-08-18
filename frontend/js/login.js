const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5001/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        console.log("Login response:", data);

        if (response.ok) {

            // Save token if backend sends one
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            // Save user information if backend sends it
            if (data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }

            alert("Login successful! 🎉");

            window.location.href = "dashboard.html";

        } else {

            alert(
                data.message || "Invalid email or password."
            );

        }

    } catch (error) {

        console.error("Login error:", error);

        alert(
            "Unable to connect to the server. Please make sure the backend is running."
        );

    }

});