require("dotenv").config();
console.log("THIS IS MY CURRENT SERVER.JS");
const express = require("express");
const cors = require("cors");
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");
const teamRoutes = require("./routes/teamRoutes");

const invitationRoutes =
    require("./routes/invitationRoutes");

const teamMessageRoutes = require("./routes/teamMessageRoutes");
const marketRoutes = require("./routes/marketRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
    res.send("Test route is working");
});
app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/team-profiles", teamRoutes);
app.use(
    "/api/team-invitations",
    invitationRoutes
);
app.use("/api/team-messages", teamMessageRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
    res.send("CareerConnect Backend Running 🚀");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});