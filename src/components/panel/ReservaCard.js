import React from "react";

// --- Tarjeta de reserva con acciones según el rol ---
// ADMIN: flujo lógico Confirmar -> Cancelar -> Confirmar/Eliminar
// CLIENTE: solo Cancelar reserva (la elimina tras confirmar)
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

  const estado = reserva.estado;

  return (
    <article className="reserva-card">
      <div className="reserva-card-datos">
        <strong>{nombreServicio}</strong>
        <span>Cliente: {reserva.cliente}</span>
        <span>Fecha: {reserva.fecha}</span>
        <span className={"reserva-card-estado " + estado}>
          {estado}
        </span>
      </div>

      <div className="reserva-card-acciones">
        {modo === "admin" ? (
          <React.Fragment>
            {/* PENDIENTE: puede confirmar o cancelar */}
            {estado === "pendiente" && (
              <React.Fragment>
                <button
                  className="btn-confirmar"
                  onClick={() => onActualizar({ estado: "confirmada" })}
                >
                  Confirmar
                </button>
                <button
                  className="btn-cancelar"
                  onClick={() => onActualizar({ estado: "cancelada" })}
                >
                  Cancelar
                </button>
              </React.Fragment>
            )}

            {/* CONFIRMADA: solo puede cancelar */}
            {estado === "confirmada" && (
              <button
                className="btn-cancelar"
                onClick={() => onActualizar({ estado: "cancelada" })}
              >
                Cancelar
              </button>
            )}

            {/* CANCELADA: puede reactivar (confirmar) o eliminar del todo */}
            {estado === "cancelada" && (
              <React.Fragment>
                <button
                  className="btn-confirmar"
                  onClick={() => onActualizar({ estado: "confirmada" })}
                >
                  Confirmar
                </button>
                <button className="btn-borrar" onClick={onBorrar}>
                  Eliminar
                </button>
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          estado !== "cancelada" && (
            <button className="btn-borrar" onClick={cancelarReservaCliente}>
              Cancelar reserva
            </button>
          )
        )}
      </div>
    </article>
  );
}