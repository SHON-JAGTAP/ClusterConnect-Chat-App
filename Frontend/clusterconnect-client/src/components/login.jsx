import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate login
    localStorage.setItem("token", "dev-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Test User", id: "123" })
    );

    navigate("/chat");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>
      <button onClick={handleLogin}>
        Login (Dev Mode)
      </button>
    </div>
  );
};

export default Login;