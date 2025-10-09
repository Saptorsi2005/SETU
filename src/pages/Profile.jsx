import React from "react";
import { FaLinkedin, FaGithub, FaFacebook } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";

const profile = {
    name: "SARTHAK PANDEY",
    pronouns: "he/him",
    degree: "B.Tech, Computer Science and Engineering, 2021 batch",
    bio: "Tech enthusiast with 3+ years of experience in building scalable cloud platforms. Currently at Microsoft, passionate about AI, distributed systems, and mentoring young engineers.",
    social: [
        { icon: <FaLinkedin />, url: "#" },
        { icon: <FaGithub />, url: "#" },
        { icon: <FaFacebook />, url: "#" }
    ],
    experience: [
        "Software Intern, Infosys (2019, 3 months) – Worked on Java-based backend systems.",
        "Associate Engineer, TCS (2021–2023).",
        "Software Engineer, Microsoft (2023–Present)."
    ],
    skills: [
        "C,C++,JAVA,PYTHON",
        "AI/ML, Data Science",
        "Content Writing",
        "3D Modelling"
    ],
    education: [
        "Delhi Public School, Kolkata (2005–2017) – PCM (Science) with Computer Science.",
        "BTECH, Academy Of Technology(2017-2021)."
    ],
    projects: [
        "AI-Powered Student Attendance System using Face Recognition.",
        "Stock Market Prediction using Time Series Analysis.",
        "Predicting Heart Disease using Machine Learning.",
        "Smart Traffic Monitoring using Computer Vision."
    ]
};

const Card = ({ title, children, action }) => (
    <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-700 p-6 flex flex-col gap-2 min-h-[170px] shadow-lg text-white relative">
        <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            {action && (
                <button className="bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition">{action}</button>
            )}
        </div>
        {children}
    </div>
);

const Profile = () => {
    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-900 px-4 py-8 flex flex-col items-center justify-center pt-20">

                {/* Top: Avatar + Bio */}
                <div className="w-full max-w-4xl flex flex-row items-center bg-gray-800/90 backdrop-blur-xl rounded-xl border border-gray-700 shadow-lg md:px-8 px-4 py-6 mb-8">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-28 h-28 bg-gray-700 rounded-full flex items-center justify-center mr-6 overflow-hidden">
                        {/* Replace with image if available */}
                        <img src={assets.profile} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    {/* Bio Info */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{profile.name} <span className="text-base text-gray-400 font-light ml-2">{profile.pronouns}</span></h1>
                                <p className="mt-1 text-gray-300">{profile.degree}</p>
                            </div>
                            {/* Social icons */}
                            <div className="flex gap-2">
                                {profile.social.map((s, i) => (
                                    <a key={i} href={s.url} className="text-gray-400 hover:text-blue-400 text-xl">{s.icon}</a>
                                ))}
                            </div>
                        </div>
                        <h2 className="text-lg font-bold mt-3 mb-1">BIO</h2>
                        <p className="text-gray-200">{profile.bio}</p>
                    </div>
                </div>
                {/* Grid: Experience, Skills, Projects, Education */}
                <div className="w-full max-w-5xl grid md:grid-cols-2 grid-cols-1 gap-6">
                    <Card title="EXPERIENCE" action="Add Exp">
                        {profile.experience.map((item, idx) => (
                            <div key={idx} className="text-gray-200 text-sm mb-1">{item}</div>
                        ))}
                    </Card>
                    <Card title="SKILLS" action="Add Skill">
                        {profile.skills.map((item, idx) => (
                            <div key={idx} className="text-gray-200 text-sm mb-1">{item}</div>
                        ))}
                    </Card>
                    <Card title="PROJECTS" action="Add Project">
                        {profile.projects.map((item, idx) => (
                            <div key={idx} className="text-gray-200 text-sm mb-1">{item}</div>
                        ))}
                    </Card>
                    <Card title="EDUCATION" action="Add Education">
                        {profile.education.map((item, idx) => (
                            <div key={idx} className="text-gray-200 text-sm mb-1">{item}</div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>

    );
};

export default Profile;
