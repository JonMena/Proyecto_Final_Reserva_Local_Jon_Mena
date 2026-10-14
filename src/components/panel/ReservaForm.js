import React, { useEffect, useState } from "react";
import { getServicios, getHorariosDisponibles } from "../../api";

// --- Formulario de reserva del cliente: carga SUS PROPIOS servicios ---
export default function ReservaForm({ negocio, onCrear }) {
  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [errorServicios, setErrorServicios] = useState("");

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
          <p style={{ margin: 0, fontSize: 13, color: "#667788" }}>
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
              return (
                <option key={s.id} value={s.id}>
                  {s.nombre} - {s.precio} €
                </option>
              );
            })}
          </select>
        )}
      </label>

      {errorServicios && (
        <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>{errorServicios}</p>
      )}
      {!cargandoServicios && !errorServicios && servicios.length === 0 && (
        <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>
          Este negocio aún no tiene servicios. El admin debe crearlos primero.
        </p>
      )}

      <label>
        Día
        <input
          type="date"
          value={dia}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDia(e.target.value)}
          required
        />
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
        <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>{errorSlots}</p>
      )}
      {dia && !cargandoSlots && slots.length === 0 && !errorSlots && (
        <p style={{ margin: 0, fontSize: 13, color: "#b91c1c" }}>
          No quedan horas libres ese día. Prueba con otro día.
        </p>
      )}

      <button type="submit" disabled={!hora || !servicioId}>
        Reservar
      </button>
    </form>
  );
}