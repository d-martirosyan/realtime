import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        
        {/* App name */}
        <h2 className="mt-6 text-2xl font-bold text-white">Aknthart</h2>
        <p className="mt-2 text-white opacity-80">Loading your chat experience...</p>
      </div>
    </div>
  );
};

export default Loading;
