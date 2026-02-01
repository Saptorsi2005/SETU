import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

export const getMentorRecommendationsFromAI = async (skills) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/mentor-recommend`,
      { skills },
      { timeout: 20000 }
    );

    return response.data;
  } catch (error) {
    console.error("AI error:", error.message);
    return []; // 👈 fail-safe so backend doesn’t crash
  }
};
