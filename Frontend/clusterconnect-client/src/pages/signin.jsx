import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(`/api/auth/login`, formData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/chat");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post(`/api/auth/google`, { token: credentialResponse.credential });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/chat");
    } catch {
      setError("Google login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#0D0D0D",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glows */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 70% 50% at 15% 15%, rgba(79, 142, 247, 0.1) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 85% 85%, rgba(139, 92, 246, 0.1) 0%, transparent 55%)
        `,
      }} />

      {/* Grid lines effect */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.025,
        backgroundImage: `
          linear-gradient(rgba(79,142,247,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,142,247,1) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Main Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          zIndex: 10,
          background: "rgba(17,17,17,0.85)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05) inset",
          animation: "fade-slide-in 0.5s ease-out forwards",
        }}
      >
        {/* Top reflection line */}
        <div style={{
          position: "absolute", top: 0, left: 40, right: 40, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          borderRadius: "100%",
        }} />

        {/* Logo & Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)",
            boxShadow: "0 8px 24px rgba(79,142,247,0.4), 0 1px 0 rgba(255,255,255,0.2) inset",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "Inter, sans-serif", fontWeight: 700,
            fontSize: "1.5rem", letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #EAEAEA 0%, rgba(234,234,234,0.65) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 6,
          }}>
            Cluster Connect
          </h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(234,234,234,0.38)", fontFamily: "Inter, sans-serif" }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            marginBottom: 20, padding: "10px 14px", borderRadius: 12,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            animation: "fade-slide-in 0.3s ease-out",
          }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(252,165,165,0.9)", fontFamily: "Inter, sans-serif" }}>
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{
              display: "block", marginBottom: 7,
              fontSize: "0.78rem", fontWeight: 500,
              color: "rgba(234,234,234,0.55)", fontFamily: "Inter, sans-serif",
              letterSpacing: "0.02em",
            }}>
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{
              display: "block", marginBottom: 7,
              fontSize: "0.78rem", fontWeight: 500,
              color: "rgba(234,234,234,0.55)", fontFamily: "Inter, sans-serif",
              letterSpacing: "0.02em",
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: 6, height: 46, fontSize: "0.88rem" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontSize: "0.74rem", color: "rgba(234,234,234,0.3)", fontFamily: "Inter, sans-serif" }}>
            OR
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Google */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            theme="filled_black"
            size="large"
            width="100%"
          />
        </div>

        {/* Sign Up Link */}
        <p style={{
          textAlign: "center", marginTop: 24,
          fontSize: "0.82rem", color: "rgba(234,234,234,0.35)",
          fontFamily: "Inter, sans-serif",
        }}>
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#4F8EF7", fontWeight: 600, fontSize: "0.82rem",
              fontFamily: "Inter, sans-serif",
              transition: "color 0.2s",
            }}
          >
            Sign Up
          </button>
        </p>
      </div>

      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;
