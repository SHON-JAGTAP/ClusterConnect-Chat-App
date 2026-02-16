import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/signin";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import "./App.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={token ? <Navigate to="/chat" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={token ? <Navigate to="/chat" /> : <Register />} 
      />
      <Route 
        path="/chat" 
        element={token ? <Chat /> : <Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

