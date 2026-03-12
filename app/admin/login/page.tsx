"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";
import { FiLock, FiMail, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { C, F } from "@/components/admin/adminUI";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.data?.token) {
        setAuth(res.data.user, res.data.token);
        toast.success("Welcome back!");
        router.push(from);
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(192,57,43,0.6)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.12)";
  };
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = C.border;
    e.currentTarget.style.boxShadow = "none";
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "13px 14px 13px 42px",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    color: C.text1,
    fontFamily: F.body,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow blobs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(192,57,43,0.2) 0%, transparent 65%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "5%",
          width: 350,
          height: 350,
          background:
            "radial-gradient(circle, rgba(241,196,15,0.08) 0%, transparent 65%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 430,
          background: C.bg3,
          border: `1px solid ${C.border}`,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
        }}
      >
        {/* Accent line */}
        <div
          style={{
            height: 3,
            background:
              "linear-gradient(90deg, transparent, #c0392b 30%, #f1c40f 50%, #c0392b 70%, transparent)",
          }}
        />

        <div style={{ padding: "40px 40px 36px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 34 }}>
            <div
              style={{
                width: 60,
                height: 60,
                background: "linear-gradient(135deg, #c0392b, #e74c3c)",
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 26,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 8px 32px rgba(192,57,43,0.45)",
                fontFamily: F.display,
              }}
            >
              R
            </div>
            <h1
              style={{
                fontFamily: F.display,
                fontSize: 26,
                fontWeight: 700,
                color: C.text1,
                margin: "0 0 6px",
              }}
            >
              Admin Panel
            </h1>
            <p
              style={{
                fontFamily: F.body,
                fontSize: 12,
                color: C.text4,
                margin: 0,
              }}
            >
              Regmi Plastic Traders · CMS
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: "rgba(192,57,43,0.12)",
                border: "1px solid rgba(192,57,43,0.35)",
                borderRadius: 12,
                padding: "11px 14px",
                marginBottom: 20,
                color: "#f87171",
                fontFamily: F.body,
                fontSize: 13,
              }}
            >
              <FiAlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: C.text4,
                }}
              >
                username
              </label>
              <div style={{ position: "relative" }}>
                <FiMail
                  size={14}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.text4,
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: C.text4,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <FiLock
                  size={14}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: C.text4,
                    pointerEvents: "none",
                  }}
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: C.text4,
                    cursor: "pointer",
                    display: "flex",
                    padding: 3,
                  }}
                >
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                width: "100%",
                padding: "15px",
                marginTop: 6,
                background: loading
                  ? "rgba(192,57,43,0.5)"
                  : "linear-gradient(135deg, #c0392b, #e74c3c)",
                border: "none",
                borderRadius: 14,
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: F.ui,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 28px rgba(192,57,43,0.4)",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                  }}
                >
                  ◌
                </span>
              ) : (
                <FiLock size={15} />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
