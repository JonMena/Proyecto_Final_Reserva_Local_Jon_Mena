import React, { useEffect, useState } from "react";
import { getServicios, getHorariosDisponibles, getReservas } from "../../api";

// --- Calcula "hoy + 1 mes natural" (ej: 31 ene -> 28/29 feb) ---
function fechaMaximaUnMes() {
  const hoy = new Date();
  const mesSig = hoy.getMonth() + 1;
  const anioSig = mesSig > 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const mesNorm = mesSig > 11 ? 0 : mesSig;
  const ultimoDiaMesSig = new Date(anioSig, mesNorm + 1, 0).getDate();
  const diaLimite = Math.min(hoy.getDate(), ultimoDiaMesSig);
  const maximo = new Date(anioSig, mesNorm, diaLimite);
  const y = maximo.getFullYear();
  const m = String(maximo.getMonth() + 1).padStart(2, "0");
  const d = String(maximo.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function fechaMinimaHoy() {
  return new Date().toISOString().split("T")[0];
}

// --- Formulario de reserva del cliente ---
export default function ReservaForm({ negocio, onCrear }) {
  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState("");
  const [serviciosReservados, setServiciosReservados] = useState([]);

  const [servicioId, setServicioId] = useState("");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [slots, setSlots] = useState([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState("");

  // Carga los servicios de ESTE negocio al montar
  useEffect(function () {
    setCargandoServicios(true);
    setErrorServicios("");
    getServicios(negocio.id)
      .then(function (resp) {
        setServicios(resp.data);
      })
      .catch(function () {
        setErrorServicios("No se pudieron cargar los servicios de este negocio.");
      })
      .finally(function () {
        setCargandoServicios(false);
      });
  }, [negocio.id]);

  // Carga las reservas ACTIVAS del cliente en este negocio para bloquear duplicados
  useEffect(function () {
    getReservas()
      .then(function (resp) {
        const activos = resp.data
          .filter(function (r) {
            return (
              r.negocio_id === negocio.id &&
              (r.estado === "pendiente" || r.estado === "confirmada")
            );
          })
          .map(function (r) {
            return r.servicio_id;
          });
        setServiciosReservados(activos);
      })
      .catch(function () {
        setServiciosReservados([]);
      });
  }, [negocio.id]);

  // Carga las horas libres al elegir día
  useEffect(function () {
    setHora("");
    setSlots([]);
    setErrorSlots("");
    if (!dia) return;
    setCargandoSlots(true);
    getHorariosDisponibles(dia, negocio.id)
      .then(function (resp) {
        if (resp.data.pasado) {
          setErrorSlots("Ese día ya pasó. Elige una fecha futura.");
        } else if (resp.data.cerrado) {
          setErrorSlots("El negocio está cerrado ese día. Elige otro.");
        } else {
          setSlots(resp.data.slots);
        }
      })
      .catch(function () {
        setErrorSlots("No se pudieron cargar las horas de ese día.");
      })
      .finally(function () {
        setCargandoSlots(false);
      });
  }, [dia, negocio.id]);

  const enviar = function (e) {
    e.preventDefault();
    onCrear({
      servicio_id: Number(servicioId),
      fecha: dia + " " + hora,
      negocio_id: negocio.id,
    });
    setHora("");
  };

  return (
    <form className="reserva-form" onSubmit={enviar}>
      <label>
        Servicio
        {cargandoServicios ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--texto-sec)" }}>
            Cargando servicios...
          </p>
        ) : (
          <select
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
            required
          >
            <option value="">Elige un servicio...</option>
            {servicios.map(function (s) {
              const yaReservado = serviciosReservados.indexOf(s.id) !== -1;
              return (
                <option key={s.id} value={s.id} disabled={yaReservado}>
                  {s.nombre} - {s.precio} €
                  {yaReservado ? " (ya reservado)" : ""}
                </option>
              );
            })}
          </select>
        )}
      </label>

      {errorServicios && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--error)" }}>{errorServicios}</p>
      )}
      {!cargandoServicios && !errorServicios && servicios.length === 0 && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--error)" }}>
          Este negocio aún no tiene servicios. El admin debe crearlos primero.
        </p>
      )}
      {!cargandoServicios &&
        servicios.length > 0 &&
        servicios.every(function (s) {
          return serviciosReservados.indexOf(s.id) !== -1;
        }) && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--texto-sec)" }}>
            Ya tienes una reserva activa de cada servicio de este negocio.
            Cancela alguna si quieres pedir otra cita.
          </p>
        )}

      <label>
        Día
        <input
          type="date"
          value={dia}
          min={fechaMinimaHoy()}
          max={fechaMaximaUnMes()}
          onChange={(e) => setDia(e.target.value)}
          required
        />
        <span style={{ fontSize: 12, color: "var(--texto-sec)", marginTop: 4 }}>
          Puedes reservar hasta 1 mes de antelación.
        </span>
      </label>

      <label>
        Hora disponible
        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          disabled={!dia || cargandoSlots || slots.length === 0}
          required
        >
          <option value="">
            {cargandoSlots
              ? "Cargando horas..."
              : dia
              ? "Elige una hora..."
              : "Elige primero un día"}
          </option>
          {slots.map(function (h) {
            return (
              <option key={h} value={h}>
                {h}
              </option>
            );
          })}
        </select>
      </label>

      {errorSlots && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--error)" }}>{errorSlots}</p>
      )}
      {dia && !cargandoSlots && slots.length === 0 && !errorSlots && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--error)" }}>
          No quedan horas libres ese día. Prueba con otro día.
        </p>
      )}

      <button type="submit" disabled={!hora || !servicioId}>
        Reservar
      </button>
    </form>
  );
}