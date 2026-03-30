import React from "react";
import { useNavigate } from "react-router-dom";

const AuthForm = ({ type, onSubmit }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-2xl shadow-2xl p-8 transition-colors duration-300 border border-transparent dark:border-slate-800">
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
