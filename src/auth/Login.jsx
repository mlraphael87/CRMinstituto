import React, { useState } from "react";
import { useAuth } from "./AuthProvider.jsx";

const TEAL = "#0a7f83";
const TEAL_DARK = "#075e61";
const INK = "#132625";
const SUB = "#5c7473";
const BORDER = "#e3ebe9";
const RED = "#d64545";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError("E-mail ou senha inválidos.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(185deg, #0b2e2f, #06282a)`,
        fontFamily: "Inter, sans-serif",
        padding: 16,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: "0 20px 60px rgba(6,40,42,0.35)",
        }}
      >
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: INK,
              fontFamily: "Manrope, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            IMOUVIR
          </div>
          <div style={{ fontSize: 12.5, color: SUB, marginTop: 2 }}>Entrar no CRM</div>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: TEAL_DARK }}>E-mail</span>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }}
            placeholder="voce@imouvir.com.br"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: TEAL_DARK }}>Senha</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ border: `1.5px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" }}
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p style={{ color: RED, fontSize: 12.5, fontWeight: 600, marginBottom: 14 }}>{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            background: `linear-gradient(180deg, ${TEAL}, ${TEAL_DARK})`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            borderRadius: 10,
            padding: "11px 0",
            cursor: submitting ? "default" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>

        <p style={{ marginTop: 16, fontSize: 11.5, color: SUB, textAlign: "center", lineHeight: 1.5 }}>
          Sua conta é criada pelo administrador do CRM no painel do Supabase.
          Fale com o gestor do projeto se ainda não tiver acesso.
        </p>
      </form>
    </div>
  );
}
