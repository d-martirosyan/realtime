import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="z-10 flex flex-col items-center text-center p-8 bg-white/40 dark:bg-darkCard/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl max-w-2xl">
        <h1 className="text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Aknthart
        </h1>
        <p className="text-xl mb-10 max-w-md text-gray-700 dark:text-gray-300 leading-relaxed">
          A modern real-time chat application to connect instantly with friends. 
          Fast, secure, and beautifully designed.
        </p>
        <div className="flex space-x-6">
          <button
            onClick={() => navigate("/signin")}
            className="px-8 py-3 bg-white dark:bg-darkInput text-blue-600 dark:text-blue-400 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 dark:border-slate-700"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
