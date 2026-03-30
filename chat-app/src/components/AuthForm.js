import React from "react";
import { useNavigate } from "react-router-dom";

const AuthForm = ({ type, onSubmit }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-darkBg transition-colors duration-300 relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[5%] left-[-10%] w-96 h-96 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="z-10 w-full max-w-md bg-white/40 dark:bg-darkCard/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl p-8 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8 tracking-tight">
          {type === "signup" ? "Create Account" : "Welcome Back"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-5">
          {type === "signup" && (
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-darkInput border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-gray-100"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-darkInput border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-darkInput border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-gray-100"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {type === "signup" ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <p className="text-sm text-center mt-8 text-gray-600 dark:text-gray-400">
            {type === "signup"
                ? "Already have an account? "
                : "Don't have an account? "}
            <span
                onClick={() => navigate(type === "signup" ? "/signin" : "/signup")}
                className="text-purple-600 dark:text-purple-400 font-semibold cursor-pointer hover:underline transition-colors"
            >
                {type === "signup" ? "Log In" : "Sign Up"}
            </span>
        </p>
      </div>
    </div>
  );
};


export default AuthForm;
