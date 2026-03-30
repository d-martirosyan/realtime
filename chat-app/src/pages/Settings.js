import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "", email: "", avatar: "" });
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check theme
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }

    // Fetch profile
    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setUser({ username: data.username, email: data.email, avatar: data.avatar || "" });
        }
      });
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/users/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, avatar: data.fileUrl }));
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };
    if (password.trim() !== "") {
      payload.password = password;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        setPassword("");
      } else {
        const data = await res.json();
        alert(data.msg || "Update failed");
      }
    } catch (err) {
      console.error("Profile update error", err);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg flex items-center justify-center p-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-2xl shadow-xl p-8 transition-colors duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Settings</h2>
          <button
            onClick={() => navigate("/chat")}
            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
          >
            ← Back to Chat
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-4">
              {user.avatar ? (
                <img
                  src={`http://localhost:5000${user.avatar}`}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full border-4 border-purple-500 shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center text-4xl font-bold border-4 border-purple-300 dark:border-purple-700 shadow-lg">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 dark:bg-darkInput text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            >
              Change Avatar
            </button>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-darkInput border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-darkInput border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-darkInput border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-darkInput rounded-lg mt-6 border border-gray-200 dark:border-slate-600 transition-colors">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Dark Theme</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reduce eye strain with a darker interface.</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isDarkMode ? "bg-purple-600" : "bg-gray-300"
                }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isDarkMode ? "translate-x-6" : ""
                  }`}
              ></div>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
