// src/pages/MentorProfile.jsx
import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MentorProfile() {
  const { state: user } = useLocation();
  const { name } = useParams();
  const navigate = useNavigate();

  if (!user) {
    // In case someone opens the link directly without navigating from Post
    return (
      <div className="pt-15 min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">Mentor not found</h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pt-15 min-h-screen bg-black text-white flex flex-col items-center">
      <Navbar />

      <div className="mt-10 w-11/12 max-w-2xl bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center gap-6">
          <img
            src={user.image}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-400">{user.role}</p>
          </div>
        </div>

        <div className="mt-6 text-gray-300 space-y-2">
          <p><strong>Experience:</strong> {user.experience}</p>
          <p><strong>Mentees:</strong> {user.mentees}</p>
          <p><strong>Match Percentage:</strong> {user.match}</p>
        </div>

        <div className="mt-6 text-gray-400">
          <p>{user.bio}</p>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/post")}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Back to Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}
