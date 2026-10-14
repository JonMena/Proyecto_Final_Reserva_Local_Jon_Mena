import React, { useEffect, useState } from "react";
import Reservas from "../pages/Reservas";
import MisReservas from "../components/panel/MisReservas";
import Login from "./login";
import { getSession, clearSession, getNegocio, setNegocio } from "../auth";
import { logout, getNegocios, getMisNegocios, urlRecurso } from "../api";

// --- Puerta de entrada: login → casa/menú/negocio según rol ---
export default function App() {
  const [sesion, setSesion] = useState(getSession());
  const [negocio, setNegocioState] = useState(getNegocio());
  const [negocios, setNegocios] = useState([]);
  const [vista, setVista] = useState("inicio");
  const [mensaje, setMensaje] = useState("");
  const [cargandoNegocios, setCargandoNegocios] = useState(false);

  const esAdmin = sesion && sesion.usuario.rol === "admin";

  useEffect(function () {
    if (!sesion) return;
    if (sesion.usuario.rol === "admin") {
      setVista("negocio");
      if (!getNegocio()) {
        getMisNegocios()
          .then(function (resp) {
            if (resp.data.length > 0) {
              setNegocio(resp.data[0]);
              setNegocioState(resp.data[0]);
            }
          })
          .catch(function () {});
      }
    } else {
      setVista("casa");
    }
  }, [sesion]);

  const cargarNegocios = function () {
    setCargandoNegocios(true);
    getNegocios()
      .then(function (resp) { setNegocios(resp.data); })
      .catch(function () { setNegocios([]); })
      .finally(function () { setCargandoNegocios(false); });
  };

  const manejarLogin = function () {
    setSesion(getSession());
    setNegocioState(getNegocio());
    setMensaje("");
  };

  const manejarLogout = async function () {
    try {
      await logout(sesion.token);
    } catch (e) {
      // cerramos local aunque el servidor no responda
    }
    clearSession();
    setSesion(null);
    setNegocioState(null);
    setNegocios([]);
    setVista("inicio");
    setMensaje("");
  };

  const elegirNegocio = function (n) {
    setNegocio(n);
    setNegocioState(n);
    setMensaje("");
    setVista("negocio");
  };

  const irAlSelector = function () {
    setMensaje("");
    setVista("selector");
    cargarNegocios();
  };

  const irACasa = function () {
    setMensaje("");
    setVista("casa");
  };

  // El cliente acaba de reservar: vuelta al menú con mensaje
  const reservaCreada = function () {
    setMensaje("Tu reserva ya se ha hecho. Puedes verla en 'Mis reservas'.");
    setVista("selector");
    cargarNegocios();
  };

  // ---------- SIN SESIÓN: LOGIN ----------
  if (!sesion) {
    return <Login onLogin={manejarLogin} />;
  }

  // ---------- MENÚ DE NEGOCIOS (selector) ----------
  if (vista === "selector") {
    return (
      <div className="selector-contenedor">
        {mensaje && <div className="toast toast-ok">{mensaje}</div>}
        <h1 className="selector-titulo">¿A qué negocio quieres ir?</h1>
        {cargandoNegocios && <p>Cargando negocios...</p>}
        <div className="selector-grid">
          {negocios.map(function (n) {
            return (
              <button
                key={n.id}
                className="selector-tarjeta"
                onClick={() => elegirNegocio(n)}
              >
                {n.icono_url ? (
                  <img
                    className="selector-icono"
                    src={urlRecurso(n.icono_url)}
                    alt={n.nombre}
                  />
                ) : (
                  <span className="selector-icono-fallback">💈</span>
                )}
                <span className="selector-nombre">{n.nombre}</span>
                <span className="selector-entrar">Entrar</span>
              </button>
            );
          })}
        </div>
        <button className="selector-salir" onClick={irACasa}>
          Volver a mis reservas
        </button>
        <button className="selector-salir" onClick={manejarLogout}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  // ---------- ADMIN SIN NEGOCIO (caso raro) ----------
  if (esAdmin && !negocio) {
    return (
      <div className="selector-contenedor">
        <p>
          No tienes ningún negocio todavía. Regístrate de nuevo con el código
          de admin para crear uno.
        </p>
        <button className="selector-salir" onClick={manejarLogout}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  // ---------- ADMIN CON NEGOCIO: PANEL ----------
  if (esAdmin && negocio) {
    return (
      <div className="app">
        <HeaderNegocio
          negocio={negocio}
          email={sesion.usuario.email}
          rolTexto="Administrador"
          esAdmin={true}
          onSalir={manejarLogout}
        />
        <Reservas
          usuario={sesion.usuario}
          negocio={negocio}
          onNegocioActualizado={function (n) {
            setNegocio(n);
            setNegocioState(n);
          }}
        />
      </div>
    );
  }

  // ---------- CLIENTE DENTRO DE UN NEGOCIO (solo reservar) ----------
  if (!esAdmin && vista === "negocio" && negocio) {
    return (
      <div className="app">
        <HeaderNegocio
          negocio={negocio}
          email={sesion.usuario.email}
          rolTexto="Cliente"
          esAdmin={false}
          onCambiar={irAlSelector}
          onCasa={irACasa}
          onSalir={manejarLogout}
        />
        <Reservas
          usuario={sesion.usuario}
          negocio={negocio}
          onReservaCreada={reservaCreada}
        />
      </div>
    );
  }

  // ---------- CASA DEL CLIENTE: MIS RESERVAS (por defecto) ----------
  return (
    <div className="app">
      <header className="navbar">
        <span className="navbar-marca">Reserva Local</span>
        <span className="navbar-usuario">
          {sesion.usuario.email} (Cliente)
        </span>
        <button className="navbar-cambiar" onClick={irAlSelector}>
          Hacer una reserva
        </button>
        <button className="navbar-logout" onClick={manejarLogout}>
          Cerrar sesión
        </button>
      </header>
      <MisReservas usuario={sesion.usuario} />
    </div>
  );
}

// ---------- Barra superior dentro de un negocio ----------
function HeaderNegocio({ negocio, email, rolTexto, esAdmin, onCambiar, onCasa, onSalir }) {
  return (
    <header className="navbar">
      {negocio.icono_url && (
        <img
          className="navbar-icono"
          src={urlRecurso(negocio.icono_url)}
          alt={negocio.nombre}
        />
      )}
      <span className="navbar-marca">{negocio.nombre}</span>
      <span className="navbar-usuario">
        {email} ({rolTexto})
      </span>
      {!esAdmin && (
        <React.Fragment>
          <button className="navbar-cambiar" onClick={onCambiar}>
            Cambiar de negocio
          </button>
          <button className="navbar-cambiar" onClick={onCasa}>
            Mis reservas
          </button>
        </React.Fragment>
      )}
      <button className="navbar-logout" onClick={onSalir}>
        Cerrar sesión
      </button>
    </header>
  );
}