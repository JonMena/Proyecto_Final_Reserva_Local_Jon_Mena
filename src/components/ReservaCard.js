import React from "react";
import { actualizarReserva, borrarReserva } from "../api";

export default function ReservaCard({ reserva, onChange }) {
  const confirmar = async () => {
    await actualizarReserva(reserva.id, { estado: "confirmada" });
    onChange && onChange();
  };

  const cancelar = async () => {
    await actualizarReserva(reserva.id, { estado: "cancelada" });
    onChange && onChange();
  };

  const eliminar = async () => {
    if (!confirm("¿Seguro que quieres borrar esta reserva?")) return;
    await borrarReserva(reserva.id);
    onChange && onChange();
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, margin: 8 }}>
      <p><b>{reserva.cliente}</b> — {reserva.fecha}</p>
      <p>Estado: <i>{reserva.estado}</i></p>
      {reserva.estado === "pendiente" && (
        <div>
          <button onClick={confirmar}>Confirmar</button>{" "}
          <button onClick={cancelar}>Cancelar</button>{" "}
        </div>
      )}
      <button onClick={eliminar}>Borrar</button>
    </div>
  );
}