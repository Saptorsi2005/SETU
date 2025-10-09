// src/pages/Post.jsx
import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Post() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const navigate = useNavigate();

  const recommendations = [
    {
      name: "PRITAM SAHA",
      role: "Product manager at Spotify",
      experience: "7 years experience",
      mentees: "3 mentees",
      match: "95%",
      image: "https://api.dicebear.com/9.x/avataaars/svg?seed=pritam",
      bio: "Passionate about helping aspiring PMs grow.",
    },
    {
      name: "PRITAM BHOWMIK",
      role: "Software engineer at Google",
      experience: "7 years experience",
      mentees: "3 mentees",
      match: "92%",
      image: "https://api.dicebear.com/9.x/avataaars/svg?seed=pritamb",
      bio: "Loves solving engineering problems and mentoring young developers.",
    },
    {
      name: "OM PRAKASH MISHRA",
      role: "Senior Software developer at TCS",
      experience: "7 years experience",
      mentees: "3 mentees",
      match: "89%",
      image: "https://api.dicebear.com/9.x/avataaars/svg?seed=omprakash",
      bio: "Enjoys mentoring and technical leadership.",
    },
    {
      name: "SAPTORSI GHOSE DASTIDAR",
      role: "Co-Founder, Toppr",
      experience: "1 year experience",
      mentees: "27 mentees",
      match: "84%",
      image: "https://api.dicebear.com/9.x/avataaars/svg?seed=saptorsi",
      bio: "Startup enthusiast and mentor for tech founders.",
    },
  ];

  const connections = [
    {
      name: "RAVI KUMAR",
      role: "Senior Engineer at Google",
      experience: "5 years experience",
      mentees: "5 mentees",
      match: "91%",
      image: "https://api.dicebear.com/9.x/avataaars/svg?seed=ravi",
      bio: "Currently mentoring you. Loves problem-solving and tech leadership.",
    },
  ];

  const handleCardClick = (user) => {
    navigate(`/mentor/${user.name}`, { state: user });
  };

  const renderMentorCard = (user, idx, isConnection = false) => (
    <div
      key={idx}
      onClick={() => !isConnection && handleCardClick(user)}
      className={`bg-[#1E1E1E] border border-[#3A3A3A] hover:border-[#555] transition rounded-xl p-5 flex justify-between items-center ${
        isConnection ? "" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-4">
        <img
          src={user.image}
          alt={user.name}
          className="w-14 h-14 rounded-full bg-gray-700"
        />
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-gray-400">{user.role}</p>
          <div className="flex gap-3 text-sm text-gray-400 mt-2">
            <span>{user.experience}</span>
            <span>{user.mentees}</span>
          </div>
        </div>
      </div>

      {isConnection && (
        <button className="text-gray-300 hover:text-white transition">
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );

  return (
    <div className="pt-15 min-h-screen bg-black text-white flex flex-col items-center">
      <Navbar />

      {/* Tab Buttons */}
      <div className="flex mt-8 gap-4 flex-wrap justify-center">
        <button
          className={`px-6 py-2 rounded-full border transition ${
            activeTab === "recommendations"
              ? "bg-[#3A3A3A] border-[#3A3A3A]"
              : "border-[#3A3A3A]"
          }`}
          onClick={() => setActiveTab("recommendations")}
        >
          RECOMMENDATIONS
        </button>
        <button
          className={`px-6 py-2 rounded-full border transition ${
            activeTab === "connections"
              ? "bg-[#3A3A3A] border-[#3A3A3A]"
              : "border-[#3A3A3A]"
          }`}
          onClick={() => setActiveTab("connections")}
        >
          CONNECTIONS
        </button>

        {/* New Buttons for Feed & Job Post */}
        <button
          className="px-6 py-2 rounded-full border border-[#3A3A3A] hover:bg-[#3A3A3A] transition"
        //   onClick={() => navigate("/feed")}
        >
          FEED
        </button>
        <button
          className="px-6 py-2 rounded-full border border-[#3A3A3A] hover:bg-[#3A3A3A] transition"
          onClick={() => navigate("/job-post")}
        >
          JOB POST
        </button>
      </div>

      {/* Mentor cards */}
      <div className="mt-8 flex flex-col gap-5 w-11/12 max-w-3xl">
        {activeTab === "recommendations"
          ? recommendations.map((u, i) => renderMentorCard(u, i, false))
          : connections.map((u, i) => renderMentorCard(u, i, true))}
      </div>
    </div>
  );
}
