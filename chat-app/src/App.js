import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Chat from "./pages/Chat";
import Loading from "./components/Loading";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include"
        });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/chat" /> : <Home />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/chat" /> : <SignUp />} />
        <Route path="/signin" element={isAuthenticated ? <Navigate to="/chat" /> : <SignIn />} />
        <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/signin" />} />
      </Routes>
    </Router>
  );
}


export default App;
