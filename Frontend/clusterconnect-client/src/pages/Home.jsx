import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Floating particle background ── */
const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      o: Math.random() * 0.4 + 0.1,
      c: Math.random() > 0.5 ? "79,142,247" : "139,92,246",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.o})`;
        ctx.fill();
      });
      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79,142,247,${0.07 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
};

/* ── Feature card ── */
const FeatureCard = ({ icon, title, desc, delay = 0 }) => (
  <div
    style={{
      padding: "28px 24px",
      borderRadius: 20,
      background: "rgba(22,22,22,0.7)",
      border: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
      transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
      cursor: "default",
      animation: `fade-up 0.6s ease-out ${delay}s both`,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px)";
      e.currentTarget.style.borderColor = "rgba(79,142,247,0.25)";
      e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(79,142,247,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset";
    }}
  >
    <div
      style={{
        width: 48, height: 48, borderRadius: 14, marginBottom: 18,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, rgba(79,142,247,0.15) 0%, rgba(139,92,246,0.15) 100%)",
        border: "1px solid rgba(79,142,247,0.2)",
      }}
    >
      {icon}
    </div>
    <h3 style={{
      fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "0.95rem",
      color: "#EAEAEA", marginBottom: 8, letterSpacing: "-0.01em",
    }}>
      {title}
    </h3>
    <p style={{
      fontFamily: "Inter, sans-serif", fontSize: "0.82rem",
      color: "rgba(234,234,234,0.4)", lineHeight: 1.65,
    }}>
      {desc}
    </p>
  </div>
);

/* ── Stat pill ── */
const Stat = ({ value, label }) => (
  <div style={{ textAlign: "center" }}>
    <p style={{
      fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "1.8rem",
      background: "linear-gradient(90deg, #4F8EF7, #8B5CF6)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      letterSpacing: "-0.03em", lineHeight: 1,
    }}>
      {value}
    </p>
    <p style={{
      fontFamily: "Inter, sans-serif", fontSize: "0.75rem",
      color: "rgba(234,234,234,0.35)", marginTop: 6, letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {label}
    </p>
  </div>
);

/* ── Mock chat bubble for hero visual ── */
const MockBubble = ({ msg, mine, delay }) => (
  <div
    className={`mock-bubble`}
    style={{
      display: "flex", justifyContent: mine ? "flex-end" : "flex-start",
      animation: `fade-up 0.5s ease-out ${delay}s both`,
    }}
  >
    <div style={{
      padding: "9px 14px",
      borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      maxWidth: 220, fontSize: "0.8rem", lineHeight: 1.5,
      fontFamily: "Inter, sans-serif",
      background: mine
        ? "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)"
        : "rgba(255,255,255,0.07)",
      color: mine ? "#fff" : "rgba(234,234,234,0.85)",
      border: mine ? "none" : "1px solid rgba(255,255,255,0.1)",
      boxShadow: mine
        ? "0 4px 16px rgba(79,142,247,0.4)"
        : "0 4px 16px rgba(0,0,0,0.4)",
    }}>
      {msg}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Home Component
// ─────────────────────────────────────────────

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) navigate("/chat");
  }, [token, navigate]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0D0D0D",
      fontFamily: "Inter, sans-serif", overflowX: "hidden", position: "relative",
    }}>
      <ParticleField />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, padding: "0 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(13,13,13,0.8)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(79,142,247,0.4)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{
            fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #EAEAEA, rgba(234,234,234,0.6))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Cluster Connect
          </span>
        </div>

        {/* Nav actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(234,234,234,0.8)", fontFamily: "Inter, sans-serif",
              fontWeight: 500, fontSize: "0.82rem",
              padding: "8px 20px", borderRadius: 10, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#EAEAEA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(234,234,234,0.8)";
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)",
              border: "none", color: "white", fontFamily: "Inter, sans-serif",
              fontWeight: 600, fontSize: "0.82rem",
              padding: "8px 20px", borderRadius: 10, cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 14px rgba(79,142,247,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(79,142,247,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,142,247,0.35)";
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative", zIndex: 1,
        padding: "100px 48px 60px",
      }}>
        {/* Ambient glows */}
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "8%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 80, alignItems: "center", maxWidth: 1100, width: "100%",
        }}>
          {/* Left: Text */}
          <div style={{ animation: "fade-up 0.7s ease-out 0.1s both" }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 100, marginBottom: 28,
              background: "rgba(79,142,247,0.1)",
              border: "1px solid rgba(79,142,247,0.2)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                animation: "pulse-dot 2s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: "0.73rem", fontWeight: 600, color: "#4F8EF7",
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                Real-Time Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontWeight: 800, fontSize: "clamp(2.4rem, 4vw, 3.5rem)",
              letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 22,
              color: "#EAEAEA",
            }}>
              Chat at the{" "}
              <span style={{
                background: "linear-gradient(90deg, #4F8EF7 0%, #8B5CF6 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                speed of light
              </span>
            </h1>

            <p style={{
              fontSize: "1rem", color: "rgba(234,234,234,0.45)",
              lineHeight: 1.75, marginBottom: 36, maxWidth: 460,
            }}>
              Cluster Connect delivers real-time messaging with live presence indicators,
              instant typing notifications, and enterprise-grade reliability — all in a
              sleek, modern interface.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "13px 28px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)",
                  color: "white", fontFamily: "Inter, sans-serif",
                  fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                  boxShadow: "0 6px 24px rgba(79,142,247,0.4)",
                  transition: "all 0.3s ease", letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(79,142,247,0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(79,142,247,0.4)";
                }}
              >
                Start for free →
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "13px 28px", borderRadius: 12,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(234,234,234,0.75)", fontFamily: "Inter, sans-serif",
                  fontWeight: 500, fontSize: "0.9rem", cursor: "pointer",
                  transition: "all 0.2s ease", letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                  e.currentTarget.style.color = "#EAEAEA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "rgba(234,234,234,0.75)";
                }}
              >
                Sign in
              </button>
            </div>

            {/* Stats row */}
            <div style={{
              display: "flex", gap: 36, marginTop: 48,
              paddingTop: 36, borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <Stat value="&lt;50ms" label="Latency" />
              <Stat value="99.9%" label="Uptime" />
              <Stat value="∞" label="Messages" />
            </div>
          </div>

          {/* Right: Mock Chat UI */}
          <div style={{ animation: "fade-up 0.7s ease-out 0.25s both" }}>
            <div style={{
              borderRadius: 24, overflow: "hidden",
              background: "rgba(17,17,17,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05) inset",
              backdropFilter: "blur(24px)",
            }}>
              {/* Mock toolbar */}
              <div style={{
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(13,13,13,0.6)",
              }}>
                {["#ff5f57","#febc2e","#28c840"].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
                ))}
                <div style={{
                  flex: 1, height: 22, borderRadius: 6, marginLeft: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: "0.65rem", color: "rgba(234,234,234,0.25)" }}>
                    cluster-connect.app/chat
                  </span>
                </div>
              </div>

              {/* Mock chat body */}
              <div style={{ display: "flex", height: 340 }}>
                {/* Sidebar */}
                <div style={{
                  width: 180, borderRight: "1px solid rgba(255,255,255,0.05)",
                  padding: "12px 0",
                }}>
                  {[
                    { name: "Alex M.", online: true },
                    { name: "Sarah K.", online: true },
                    { name: "Tom W.", online: false },
                  ].map((u, i) => (
                    <div
                      key={u.name}
                      style={{
                        padding: "9px 14px", display: "flex", alignItems: "center", gap: 9,
                        background: i === 0 ? "rgba(79,142,247,0.1)" : "transparent",
                        borderLeft: i === 0 ? "2px solid #4F8EF7" : "2px solid transparent",
                      }}
                    >
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.65rem", fontWeight: 700, color: "#fff",
                        }}>
                          {u.name[0]}
                        </div>
                        <div style={{
                          position: "absolute", bottom: 0, right: 0,
                          width: 8, height: 8, borderRadius: "50%",
                          background: u.online ? "#22c55e" : "#6b7280",
                          border: "1.5px solid #111",
                        }} />
                      </div>
                      <span style={{
                        fontSize: "0.73rem", fontWeight: i === 0 ? 600 : 400,
                        color: i === 0 ? "#EAEAEA" : "rgba(234,234,234,0.45)",
                      }}>
                        {u.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1, padding: "16px 14px",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <MockBubble msg="Hey! You there? 👋" mine={false} delay={0.5} />
                  <MockBubble msg="Yeah! Just joined ClusterConnect 🚀" mine={true} delay={0.75} />
                  <MockBubble msg="This real-time chat is insanely fast!" mine={false} delay={1.0} />
                  <MockBubble msg="I know right? Under 50ms latency 😄" mine={true} delay={1.25} />

                  {/* Typing indicator */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    animation: "fade-up 0.5s ease-out 1.5s both",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.5rem", color: "#fff", fontWeight: 700, flexShrink: 0,
                    }}>A</div>
                    <div style={{
                      padding: "7px 12px", borderRadius: "12px 12px 12px 4px",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", gap: 3, alignItems: "center",
                    }}>
                      {[0, 200, 400].map((d) => (
                        <div key={d} style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: "rgba(234,234,234,0.45)",
                          animation: `typing-dot 1.2s ease-in-out ${d}ms infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(13,13,13,0.5)",
                display: "flex", gap: 8, alignItems: "center",
              }}>
                <div style={{
                  flex: 1, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }} />
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(79,142,247,0.4)",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section style={{ padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#4F8EF7", marginBottom: 12,
            }}>
              EVERYTHING YOU NEED
            </p>
            <h2 style={{
              fontWeight: 800, fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              letterSpacing: "-0.03em", color: "#EAEAEA", lineHeight: 1.15,
            }}>
              Built for speed. Designed for humans.
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}>
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
                title: "Instant Messaging",
                desc: "Sub-50ms message delivery powered by WebSocket and Redis pub/sub architecture.",
                delay: 0,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 8 0v2"/><circle cx="19" cy="8" r="3"/><path d="M22 20v-1a3 3 0 0 0-3-3h-1"/></svg>,
                title: "Live Presence",
                desc: "See exactly who's online in real-time with animated green presence indicators.",
                delay: 0.1,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                title: "Typing Indicators",
                desc: "Know when someone is composing a reply with smooth animated typing bubbles.",
                delay: 0.2,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: "Secure by Default",
                desc: "JWT-based authentication with Google OAuth ensures only verified users connect.",
                delay: 0.3,
              },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: "60px 48px 100px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: 680, margin: "0 auto", textAlign: "center",
          padding: "56px 48px",
          borderRadius: 28,
          background: "rgba(17,17,17,0.8)",
          border: "1px solid rgba(79,142,247,0.15)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 80px rgba(79,142,247,0.07), 0 32px 64px rgba(0,0,0,0.6)",
          animation: "fade-up 0.6s ease-out 0.2s both",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.4), transparent)",
          }} />
          <h2 style={{
            fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            letterSpacing: "-0.03em", color: "#EAEAEA", marginBottom: 14, lineHeight: 1.2,
          }}>
            Ready to connect instantly?
          </h2>
          <p style={{
            fontSize: "0.88rem", color: "rgba(234,234,234,0.4)",
            lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px",
          }}>
            Join Cluster Connect today and experience real-time communication
            the way it was meant to be — instant, beautiful, and reliable.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "13px 32px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)",
                color: "white", fontFamily: "Inter, sans-serif",
                fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                boxShadow: "0 6px 24px rgba(79,142,247,0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(79,142,247,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(79,142,247,0.4)";
              }}
            >
              Create free account
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "13px 28px", borderRadius: 12,
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(234,234,234,0.65)", fontFamily: "Inter, sans-serif",
                fontWeight: 500, fontSize: "0.9rem", cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(79,142,247,0.4)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            >
              Sign in instead
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "24px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 7,
            background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ fontSize: "0.78rem", color: "rgba(234,234,234,0.3)", fontWeight: 500 }}>
            Cluster Connect
          </span>
        </div>
        <p style={{ fontSize: "0.73rem", color: "rgba(234,234,234,0.2)" }}>
          © 2026 Cluster Connect. Built with ❤️
        </p>
      </footer>

      {/* Global keyframes */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes typing-dot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
        @media (max-width: 768px) {
          section > div > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
