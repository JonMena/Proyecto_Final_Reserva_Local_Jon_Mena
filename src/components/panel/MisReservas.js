import React, { useCallback, useEffect, useState } from "react";
import {
  getReservas,
  getNegocios,
  getServicios,
  actualizarReserva,
  borrarReserva,
} from "../../api";
import ReservaCard from "./ReservaCard";

// --- Casa del cliente: todas sus reservas, de todos los negocios ---
export default function MisReservas({ usuario }) {
  const [reservas, setReservas] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [toasts, setToasts] = useState([]);

  const pushToast = function (mensaje, tipo) {
    const id = Date.now() + Math.random();
    const nuevo = { id: id, mensaje: mensaje, tipo: tipo };
    setToasts(function (t) {
      return t.concat([nuevo]);
    });
    setTimeout(function () {
      setToasts(function (t) {
        return t.filter(function (x) {
          return x.id !== id;
        });
      });
    }, 3000);
  };

  const cargar = useCallback(async function () {
    try {
      const resultados = await Promise.all([getReservas(), getNegocios()]);
      setReservas(resultados[0].data);
      setNegocios(resultados[1].data);
    } catch (e) {
      pushToast("No se pudieron cargar tus reservas.", "error");
    }
  }, []);

  useEffect(function () {
    cargar();
  }, [cargar]);

  // Carga los servicios de los negocios que aparecen en las reservas
  useEffect(function () {
    const ids = [];
    reservas.forEach(function (r) {
      if (ids.indexOf(r.negocio_id) === -1) ids.push(r.negocio_id);
    });
    if (ids.length === 0) {
      setServicios([]);
      return;
    }
    Promise.all(
      ids.map(function (id) {
        return getServicios(id).catch(function () {
          return { data: [] };
        });
      })
    ).then(function (resps) {
      const todos = [];
      resps.forEach(function (resp) {
        resp.data.forEach(function (s) {
          todos.push(s);
        });
      });
      setServicios(todos);
    });
  }, [reservas]);

  const nombreNegocio = function (id) {
    const n = negocios.find(function (x) {
      return x.id === id;
    });
    return n ? n.nombre : "Negocio " + id;
  };

  const nombreServicio = function (id) {
    const s = servicios.find(function (x) {
      return x.id === id;
    });
    return s ? s.nombre : "Servicio " + id;
  };

  const manejarActualizar = async function (id, datos) {
    try {
      await actualizarReserva(id, datos);
      pushToast("Reserva actualizada.", "ok");
      cargar();
    } catch (e) {
      pushToast("No se pudo actualizar la reserva.", "error");
    }
  };

  const manejarBorrar = async function (id) {
    try {
      await borrarReserva(id);
      pushToast("Reserva eliminada.", "ok");
      cargar();
    } catch (e) {
      pushToast("No se pudo eliminar la reserva.", "error");
    }
  };

  return (
    <main className="panel">
      <div className="toast-contenedor">
        {toasts.map(function (t) {
          return (
            <div key={t.id} className={"toast toast-" + t.tipo}>
              {t.mensaje}
            </div>
          );
        })}
      </div>

      <section className="panel-seccion">
        <h2>Mis reservas (todos los negocios)</h2>
        <div className="panel-lista">
          {reservas.length === 0 && (
            <p>
              Todavía no tienes reservas. Pulsa "Hacer una reserva" para
              empezar.
            </p>
          )}
          {reservas.map(function (r) {
            return (
              <React.Fragment key={r.id}>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#2563eb",
                  }}
                >
                  {nombreNegocio(r.negocio_id)}
                </p>
                <ReservaCard
                  reserva={r}
                  modo="cliente"
                  negocioId={r.negocio_id}
                  nombreServicio={nombreServicio(r.servicio_id)}
                  onActualizar={(datos) => manejarActualizar(r.id, datos)}
                  onBorrar={() => manejarBorrar(r.id)}
                />
              </React.Fragment>
            );
          })}
        </div>
      </section>
    </main>
  );
}