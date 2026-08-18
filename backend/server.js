console.log("THIS IS MY CURRENT SERVER.JS");
const express = require("express");
const cors = require("cors");
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
    res.send("Test route is working");
});
app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/hackathons", hackathonRoutes);

app.get("/", (req, res) => {
    res.send("CareerConnect Backend Running 🚀");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});