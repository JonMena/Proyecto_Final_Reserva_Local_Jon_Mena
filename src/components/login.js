import React, { useState } from "react";
import { login, registro } from "../api";
import { saveSession, setNegocio } from "../auth";

const estiloInput = {
  width: "100%",
  height: 44,
  padding: "0 12px",
  border: "1px solid #ccccdd",
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
  background: "#ffffff",
};

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    setError("");
    setConfirmar("");
    setCodigo("");
    setNombreNegocio("");
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");

    if (modo === "registro") {
      const hayCodigo = codigo.trim().length > 0;
      const hayNegocio = nombreNegocio.trim().length > 0;

      if (password !== confirmar) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      // >>> VALIDACION 1: nombre de negocio SIN codigo -> bloquear <<<
      if (hayNegocio && !hayCodigo) {
        setError("Para crear un negocio necesitas un codigo de administrador. Pon el codigo o deja vacio el nombre del negocio.");
        return;
      }

      // >>> VALIDACION 2: codigo SIN nombre de negocio -> bloquear <<<
      if (hayCodigo && !hayNegocio) {
        setError("Si usas un codigo de admin, indica el nombre de tu negocio.");
        return;
      }
    }

    setCargando(true);
    try {
      let resp;
      if (modo === "login") {
        resp = await login(email, password);
      } else {
        resp = await registro({
          email: email,
          password: password,
          nombre: nombre,
          apellidos: apellidos,
          codigo_invitacion: codigo,
          nombre_negocio: nombreNegocio,
        });
      }
      saveSession(resp.data.token, resp.data.usuario);
      if (resp.data.negocio) {
        setNegocio(resp.data.negocio);
      }
      onLogin(resp.data.usuario);
    } catch (err) {
      const mensaje =
        err.response && err.response.data && err.response.data.error;
      setError(
        mensaje ||
          (modo === "login"
            ? "Email o contraseña incorrectos."
            : "No se pudo crear la cuenta.")
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-contenedor">
      <form className="login-caja" onSubmit={enviar}>
        <h1>Reserva Local</h1>
        <p className="login-subtitulo">
          {modo === "login"
            ? "Inicia sesión para continuar"
            : "Crea tu cuenta gratuita"}
        </p>

        {modo === "registro" && (
          <React.Fragment>
            <input
              type="text"
              style={estiloInput}
              value={nombre}
              placeholder="Nombre"
              aria-label="Nombre"
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              style={estiloInput}
              value={apellidos}
              placeholder="Apellidos"
              aria-label="Apellidos"
              onChange={(e) => setApellidos(e.target.value)}
              required
            />
          </React.Fragment>
        )}

        <div className="login-campo">
          <span className="login-icono" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input
            type="email"
            value={email}
            placeholder="Email"
            aria-label="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-campo">
          <span className="login-icono" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            type="password"
            value={password}
            placeholder="Contraseña"
            aria-label="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {modo === "registro" && (
          <React.Fragment>
            <input
              type="password"
              style={estiloInput}
              value={confirmar}
              placeholder="Repite la contraseña"
              aria-label="Repite la contraseña"
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
            <input
              type="text"
              style={estiloInput}
              value={codigo}
              placeholder="Código de administrador (opcional)"
              aria-label="Código de invitación"
              onChange={(e) => setCodigo(e.target.value)}
            />
            <input
              type="text"
              style={estiloInput}
              value={nombreNegocio}
              placeholder="Nombre de tu negocio (solo con código)"
              aria-label="Nombre de tu negocio"
              onChange={(e) => setNombreNegocio(e.target.value)}
            />
          </React.Fragment>
        )}

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Un momento..." : modo === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        <button
          type="button"
          onClick={() => cambiarModo(modo === "login" ? "registro" : "login")}
          style={{
            marginTop: 6,
            height: "auto",
            padding: "4px",
            background: "transparent",
            border: "none",
            color: "#2563eb",
            fontSize: 13,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {modo === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>

        {modo === "registro" && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "#667788",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Las cuentas nuevas se crean como <strong>cliente</strong>. Si eres un
            negocio, usa tu código de administrador y pon el{" "}
            <strong>nombre de tu negocio</strong> para crearlo al registrarte.
          </p>
        )}
      </form>
    </div>
  );
}