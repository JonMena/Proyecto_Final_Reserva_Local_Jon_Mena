import React from "react";

// --- Tarjeta de reserva con acciones según el rol ---
// ADMIN: Confirmar / Cancelar / Eliminar  (NUNCA cambiar la fecha)
// CLIENTE: Cancelar reserva (la elimina tras confirmar)
export default function ReservaCard({
  reserva,
  modo,
  nombreServicio,
  onActualizar,
  onBorrar,
}) {
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
            <button className="btn-borrar" onClick={onBorrar}>
              Eliminar
            </button>
          </React.Fragment>
        ) : (
          reserva.estado !== "cancelada" && (
            <button className="btn-borrar" onClick={cancelarReservaCliente}>
              Cancelar reserva
            </button>
          )
        )}
      </div>
    </article>
  );
}