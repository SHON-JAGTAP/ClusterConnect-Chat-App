import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  React.useEffect(() => {
    if (token) {
      navigate("/chat");
    }
  }, [token, navigate]);

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="home-content">
          <h1>Welcome to ClusterConnect</h1>
          <p>Real-time communication made simple</p>
          
          <div className="home-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>

          <div className="features">
            <h3>Features</h3>
            <ul>
              <li>Real-time messaging</li>
              <li>Multiple chat rooms</li>
              <li>User presence indicators</li>
              <li>Typing notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
