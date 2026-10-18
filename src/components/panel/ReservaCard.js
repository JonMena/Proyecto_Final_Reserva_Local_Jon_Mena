import React, { useEffect, useState } from "react";
import { getHorariosDisponibles } from "../../api";

// --- Tarjeta de reserva con acciones según el rol ---
export default function ReservaCard({
  reserva,
  modo,
  negocioId,
  nombreServicio,
  onActualizar,
  onBorrar,
}) {
  const [cambiando, setCambiando] = useState(false);
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    setHora("");
    setSlots([]);
    if (!dia) return;
    getHorariosDisponibles(dia, negocioId)
      .then((resp) => setSlots(resp.data.slots))
      .catch(() => setSlots([]));
  }, [dia, negocioId]);

  const confirmarCambio = () => {
    if (!dia || !hora) return;
    onActualizar({ fecha: dia + " " + hora, estado: "pendiente" });
    setCambiando(false);
    setDia("");
    setHora("");
  };

  // Para cliente: solo un botón que borra (con confirmación)
  const cancelarReservaCliente = () => {
    if (
      window.confirm(
        "¿Seguro que quieres cancelar esta reserva? Se eliminará por completo."
      )
    ) {
      onBorrar();
    }
  };

  return (
    <article className="reserva-card">
      <div className="reserva-card-datos">
        <strong>{nombreServicio}</strong>
        <span>Cliente: {reserva.cliente}</span>
        <span>Fecha: {reserva.fecha}</span>
        <span className={"reserva-card-estado " + reserva.estado}>
          {reserva.estado}
        </span>
      </div>

      <div className="reserva-card-acciones">
        {modo === "admin" ? (
          // ---- ADMIN: todas las acciones ----
          <React.Fragment>
            {reserva.estado !== "confirmada" && (
              <button
                className="btn-confirmar"
                onClick={() => onActualizar({ estado: "confirmada" })}
              >
                Confirmar
              </button>
            )}
            {reserva.estado !== "cancelada" && (
              <button
                className="btn-cancelar"
                onClick={() => onActualizar({ estado: "cancelada" })}
              >
                Cancelar
              </button>
            )}
            {reserva.estado !== "cancelada" && (
              <button
                className="btn-cambiar"
                onClick={() => setCambiando(!cambiando)}
              >
                Cambiar hora
              </button>
            )}
            <button className="btn-borrar" onClick={onBorrar}>
              Eliminar
            </button>
          </React.Fragment>
        ) : (
          // ---- CLIENTE: solo un botón, "Cancelar reserva" ----
          reserva.estado !== "cancelada" && (
            <button className="btn-borrar" onClick={cancelarReservaCliente}>
              Cancelar reserva
            </button>
          )
        )}
      </div>

      {cambiando && (
        <div className="reserva-card-cambio">
          <input
            type="date"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          />
          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            disabled={!dia}
          >
            <option value="">Elige hora...</option>
            {slots.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <button
            className="btn-confirmar"
            onClick={confirmarCambio}
            disabled={!hora}
          >
            Guardar nueva hora
          </button>
        </div>
      )}
    </article>
  );
}