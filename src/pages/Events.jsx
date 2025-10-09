import React from "react";
import { FaUser } from "react-icons/fa";
import Navbar from "../components/Navbar";

const events = [
    { title: "SYMPOSIUM 3.0", registered: 120, capacity: 200 },
    { title: "SYMPOSIUM 3.0", registered: 120, capacity: 200 },
    { title: "SYMPOSIUM 3.0", registered: 120, capacity: 200 },
    { title: "SYMPOSIUM 3.0", registered: 120, capacity: 200 }
];

const EventCard = ({ title, registered, capacity }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-600 p-6 flex flex-col items-center gap-6 min-h-[340px] w-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
    {/* Image placeholder */}
    <div className="w-full h-28 bg-gray-700 rounded-lg mb-4 shadow-inner"></div>
    
    {/* Title */}
    <div className="text-white text-xl font-semibold text-center tracking-wide">{title}</div>
    
    {/* Registration info */}
    <div className="bg-gray-900 border border-gray-600 rounded-lg text-white px-8 py-2 flex items-center gap-3 justify-center mb-4 drop-shadow-md">
      <FaUser className="text-gray-300" />
      <span className="text-sm font-medium">{registered} / {capacity}</span>
    </div>
    
    {/* Buttons container */}
    <div className="flex w-full gap-4">
      <button className="flex-1 px-6 py-3 bg-transparent border border-gray-600 text-white rounded-lg text-lg font-medium hover:bg-gray-700 hover:border-amber-400 transition-colors duration-300">
        Register
      </button>
      <button className="flex-1 px-6 py-3 bg-transparent border border-gray-600 text-white rounded-lg text-lg font-medium hover:bg-gray-700 hover:border-amber-400 transition-colors duration-300">
        Event Details
      </button>
    </div>
  </div>
);

const Events = () => (
    <div>
        <Navbar />
        <div className="min-h-screen bg-black px-8 pt-24 pb-8">
            <h1 className="text-white text-3xl font-bold mb-6">UPCOMING EVENTS</h1>
            <div className="flex gap-4 mb-8">
                <button className="bg-transparent border border-gray-400 rounded-full px-8 py-2 text-white font-medium hover:bg-gray-700 transition">
                    CALENDER
                </button>
                <button onClick={() => navigate("/addEvents")} className="bg-transparent border border-gray-400 rounded-full px-8 py-2 text-white font-medium hover:bg-gray-700 transition">
                    ADD EVENT
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {events.map((ev, idx) => (
                    <EventCard key={idx} {...ev} />
                ))}
            </div>
        </div>
    </div>

);

export default Events;
