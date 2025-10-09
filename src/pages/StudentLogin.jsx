import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { assets } from "../assets/assets";
import './LoginLanding.css'; // For slide-up animation

const StudentLogin = () => {
    const [formData, setFormData] = useState({
        name: "",
        college: "",
        email: "",
        password: "",
    });

    const navigate = useNavigate(); // Hook to navigate programmatically

    const colleges = [
        "IIT Bombay",
        "IIT Delhi",
        "IIT Kharagpur",
        "IIT Madras",
        "Other",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Student Login Data:", formData);
        // Add login logic here
        navigate("/home")
    };

    const goToSignup = () => {
        navigate("/studentSignup"); // Navigate to alumniSignup route
    };

    return (
        <div
            className="h-screen w-full bg-cover bg-center flex flex-col items-center justify-center relative"
            style={{ backgroundImage: `url(${assets.landingBG})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Logo + Title + Tagline */}
            <div className="relative z-10 flex flex-col items-center mb-10 animate-slide-up">
                <div className="flex flex-row items-center">
                    <div className=" text-white">
                        <h1 className="font-bold text-8xl md:text-8xl leading-none drop-shadow-lg">
                            SETU
                        </h1>
                        <p className="text-sm md:text-sm  drop-shadow-md ">
                            Sharing Experience To Undergrads
                        </p>
                    </div>
                    <img
                        src={assets.logo}
                        alt="Setu Logo"
                        className="w-30 md:w-34 drop-shadow-xl"
                    />
                </div>
            </div>

            {/* Alumni Login Form */}
            <div className="relative z-10 bg-amber-400 bg-opacity-10 backdrop-blur-md rounded-3xl shadow-xl p-8 w-full max-w-md animate-slide-up">
                <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-md">
                    Student Login
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Name */}
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="border border-white/50 text-gray-900 px-4 py-3 rounded-xl bg-white/60 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/70 transition"
                        required
                    />

                    {/* Select College */}
                    <select
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        className="border border-white/50 text-gray-900 px-4 py-3 rounded-xl bg-white/60 focus:outline-none focus:ring-2 focus:ring-white/70 transition"
                        required
                    >
                        <option value="" disabled>
                            Select College
                        </option>
                        {colleges.map((c, idx) => (
                            <option key={idx} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    {/* College Email */}
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="College Email"
                        className="border border-white/50 text-gray-900 px-4 py-3 rounded-xl bg-white/60 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/70 transition"
                        required
                    />

                    {/* Password */}
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="border border-white/50 text-gray-900 px-4 py-3 rounded-xl bg-white/60 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/70 transition"
                        required
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-white/30 text-white py-3 rounded-xl font-semibold hover:bg-white/50 transition"
                    >
                        Login
                    </button>
                </form>

                {/* Signup Link */}
                <p className="text-center text-white mt-4">
                    Don't have an account?{" "}
                    <button
                        onClick={goToSignup}
                        className="underline font-semibold hover:text-gray-300 focus:outline-none"
                        type="button"
                    >
                        Signup
                    </button>
                </p>
            </div>
        </div>
    );
};

export default StudentLogin;
