import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-4">Aknthart</h1>
      <p className="text-lg mb-8 text-center max-w-md">
        Aknthart is a modern real-time chat application where you can connect
        instantly with friends and communities. Fast, secure, and beautifully
        designed.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/signin")}
          className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Home;
