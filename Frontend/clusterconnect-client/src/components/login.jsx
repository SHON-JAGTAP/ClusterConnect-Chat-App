import React from "react";

const Login = ({ setUser }) => {
  const handleLogin = () => {
    
    setUser({ name: "Test User", id: "123" });
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
