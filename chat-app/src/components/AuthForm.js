import React from "react";
import { useNavigate } from "react-router-dom";

const AuthForm = ({ type, onSubmit }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {type === "signup" ? "Create Your Aknthart Account" : "Welcome Back to Aknthart"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {type === "signup" && (
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            {type === "signup" ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <p className="text-sm text-center mt-6 text-gray-600">
            {type === "signup"
                ? "Already have an account? "
                : "Don't have an account? "}
            <span
                onClick={() => navigate(type === "signup" ? "/signin" : "/signup")}
                className="text-purple-600 font-semibold cursor-pointer hover:underline"
            >
                {type === "signup" ? "Sign In" : "Sign Up"}
            </span>
        </p>
      </div>
    </div>
  );
};


export default AuthForm;
