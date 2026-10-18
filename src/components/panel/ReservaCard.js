import React from "react";

// --- Tarjeta de reserva con acciones según el rol ---
// ADMIN: flujo Confirmar -> Cancelar -> Confirmar/Eliminar
// CLIENTE: Cancelar reserva (si no está cancelada) / Eliminar (si ya está cancelada)
export default function ReservaCard({
  reserva,
  modo,
  nombreServicio,
  onActualizar,
  onBorrar,
}) {
  const eliminarConConfirmacion = () => {
    if (
      window.confirm(
        "¿Seguro que quieres eliminar esta reserva del todo?"
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
          // ---- ADMIN: flujo por estado ----
          <React.Fragment>
            {/* PENDIENTE: confirmar o cancelar */}
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

            {/* CONFIRMADA: solo cancelar */}
            {estado === "confirmada" && (
              <button
                className="btn-cancelar"
                onClick={() => onActualizar({ estado: "cancelada" })}
              >
                Cancelar
              </button>
            )}

            {/* CANCELADA: reactivar o eliminar del todo */}
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
          // ---- CLIENTE: Cancelar si está activa, Eliminar si ya está cancelada ----
          <React.Fragment>
            {(estado === "pendiente" || estado === "confirmada") && (
              <button
                className="btn-cancelar"
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Seguro que quieres cancelar esta reserva? Quedará marcada como cancelada."
                    )
                  ) {
                    onActualizar({ estado: "cancelada" });
                  }
                }}
              >
                Cancelar reserva
              </button>
            )}
            {estado === "cancelada" && (
              <button className="btn-borrar" onClick={eliminarConConfirmacion}>
                Eliminar
              </button>
            )}
          </React.Fragment>
        )}
      </div>
    </article>
  );
}