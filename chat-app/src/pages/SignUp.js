import React from "react";
import AuthForm from "../components/AuthForm";

const SignUp = () => {
  const handleSignUp = async (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // allow cookies
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully! Please sign in.");
        window.location.href = "/signin";
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return <AuthForm type="signup" onSubmit={handleSignUp} />;
};

export default SignUp;
