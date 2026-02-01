import pool from "../config/database.js";
import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export const recommendMentors = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { id: userId, role } = req.user;

    // 1️⃣ Fetch user skills
    const userResult = await pool.query(
      "SELECT skills FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userSkillsArray =
      typeof userResult.rows[0].skills === "string"
        ? JSON.parse(userResult.rows[0].skills)
        : userResult.rows[0].skills || [];

    const userSkills = userSkillsArray
      .flatMap((s) =>
        typeof s === "string"
          ? s.split(",").map((x) => x.trim().toLowerCase())
          : []
      );

    // 2️⃣ Decide recommendation type
    let recommendationRole;
    if (role === "student" || role === "alumni") {
      recommendationRole = "alumni";
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    // 3️⃣ Fetch mentors
    const mentorResult = await pool.query(
      `SELECT id, name, email, skills, experience, profile_image
       FROM users
       WHERE role = $1 AND id != $2`,
      [recommendationRole, userId]
    );

    const mentors = mentorResult.rows.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      skills: Array.isArray(m.skills)
        ? m.skills.flatMap((s) =>
          typeof s === "string"
            ? s.split(",").map((x) => x.trim().toLowerCase())
            : []
        )
        : typeof m.skills === "string"
          ? m.skills.split(",").map((x) => x.trim().toLowerCase())
          : [],
      experience: m.experience || 0,
      profile_image: m.profile_image || null,
    }));

    // 4️⃣ Call AI service (FIXED)
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/mentor-recommend`,
      {
        student_skills: userSkills,
        mentors,
      },
      { timeout: 20000 }
    );

    return res.json(aiResponse.data);
  } catch (error) {
    console.error("Mentor recommendation error:", error.message);
    return res.status(500).json({ message: "Mentor recommendation failed" });
  }
};
