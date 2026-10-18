import React, { useState } from "react";
import { login, registro } from "../api";
import { saveSession, setNegocio } from "../auth";

// svg pequeño que reutilizo para todos los iconos
const Icono = function ({ children }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
};

// icono de cada campo del formulario
const iconoNombre = (
  <Icono>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icono>
);

const iconoApellidos = (
  <Icono>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icono>
);

const iconoEmail = (
  <Icono>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Icono>
);

const iconoCandado = (
  <Icono>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icono>
);

const iconoCandadoCheck = (
  <Icono>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <path d="m9 16 2 2 4-4" />
  </Icono>
);

const iconoEscudo = (
  <Icono>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </Icono>
);

const iconoTienda = (
  <Icono>
    <path d="M4 4h16l1 5H3l1-5z" />
    <path d="M4 9v11h16V9" />
    <path d="M9 20v-6h6v6" />
  </Icono>
);

// ojo abierto y ojo tachado, para mostrar u ocultar la contraseña
const iconoOjoAbierto = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const iconoOjoCerrado = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

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
  // cada contraseña tiene su propio ojo, no se pisan entre ellas
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    setError("");
    setConfirmar("");
    setCodigo("");
    setNombreNegocio("");
    setVerPassword(false);
    setVerConfirmar(false);
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

      // el código y el nombre del negocio van juntos o no van
      if (hayNegocio && !hayCodigo) {
        setError("Para crear un negocio necesitas un código de administrador. Pon el código o deja vacío el nombre del negocio.");
        return;
      }

      if (hayCodigo && !hayNegocio) {
        setError("Si usas un código de admin, indica el nombre de tu negocio.");
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

  const estiloOjo = {
    background: "transparent",
    border: "none",
    padding: "0 12px",
    cursor: "pointer",
    color: "var(--texto-sec)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flexShrink: 0,
  };

  return (
    <div className="login-layout">
      {/* título grande a la izquierda */}
      <div className="login-marca">
        <h1>
          Reserva<br />
          <span>Local</span>
        </h1>
        <p>
          Reserva tu cita en los negocios de tu barrio en menos de un minuto.
          Sin llamadas, sin esperas, sin líos.
        </p>
      </div>

      {/* el formulario, a la derecha */}
      <form className="login-caja" onSubmit={enviar}>
        <p className="login-subtitulo">
          {modo === "login"
            ? "Inicia sesión para continuar"
            : "Crea tu cuenta gratuita"}
        </p>

        {modo === "registro" && (
          <React.Fragment>
            <div className="login-campo">
              <span className="login-icono" aria-hidden="true">{iconoNombre}</span>
              <input
                type="text"
                name="nombre"
                autoComplete="given-name"
                value={nombre}
                placeholder="Nombre"
                aria-label="Nombre"
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="login-campo">
              <span className="login-icono" aria-hidden="true">{iconoApellidos}</span>
              <input
                type="text"
                name="apellidos"
                autoComplete="family-name"
                value={apellidos}
                placeholder="Apellidos"
                aria-label="Apellidos"
                onChange={(e) => setApellidos(e.target.value)}
                required
              />
            </div>
          </React.Fragment>
        )}

        <div className="login-campo">
          <span className="login-icono" aria-hidden="true">{iconoEmail}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            placeholder="Email"
            aria-label="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-campo">
          <span className="login-icono" aria-hidden="true">{iconoCandado}</span>
          <input
            type={verPassword ? "text" : "password"}
            name="password"
            autoComplete={modo === "login" ? "current-password" : "new-password"}
            value={password}
            placeholder="Contraseña"
            aria-label="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setVerPassword(!verPassword)}
            style={estiloOjo}
            tabIndex={-1}
          >
            {verPassword ? iconoOjoCerrado : iconoOjoAbierto}
          </button>
        </div>

        {modo === "registro" && (
          <React.Fragment>
            <div className="login-campo">
              <span className="login-icono" aria-hidden="true">{iconoCandadoCheck}</span>
              <input
                type={verConfirmar ? "text" : "password"}
                name="confirm-password"
                autoComplete="new-password"
                value={confirmar}
                placeholder="Repite la contraseña"
                aria-label="Repite la contraseña"
                onChange={(e) => setConfirmar(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={verConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setVerConfirmar(!verConfirmar)}
                style={estiloOjo}
                tabIndex={-1}
              >
                {verConfirmar ? iconoOjoCerrado : iconoOjoAbierto}
              </button>
            </div>
            <div className="login-campo">
              <span className="login-icono" aria-hidden="true">{iconoEscudo}</span>
              <input
                type="text"
                name="codigo"
                autoComplete="off"
                value={codigo}
                placeholder="Código de administrador (opcional)"
                aria-label="Código de invitación"
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <div className="login-campo">
              <span className="login-icono" aria-hidden="true">{iconoTienda}</span>
              <input
                type="text"
                name="nombre_negocio"
                autoComplete="organization"
                value={nombreNegocio}
                placeholder="Nombre de tu negocio (solo con código)"
                aria-label="Nombre de tu negocio"
                onChange={(e) => setNombreNegocio(e.target.value)}
              />
            </div>
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
            color: "var(--primario)",
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
              color: "var(--texto-sec)",
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