import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/signin";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={token ? <Navigate to="/chat" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to="/chat" replace /> : <Register />}
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;