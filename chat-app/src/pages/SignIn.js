import React from "react";
import AuthForm from "../components/AuthForm";
import { useToast } from "../context/ToastContext";

const SignIn = () => {
  const toast = useToast();
  const handleSignIn = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookies
        body: JSON.stringify({ email, password }),
      });

      console.log("here")

      if (res.ok) {
        // Instead of window.location.href, use React Router navigation
        window.location.replace("/chat");
      } else {
        const data = await res.json();
        toast.error(data.msg);
      }
    } catch (err) {
      console.error(err);
    }
  };


  return <AuthForm type="signin" onSubmit={handleSignIn} />;
};

export default SignIn;
