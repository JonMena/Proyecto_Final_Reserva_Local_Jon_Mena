import React, { useState } from "react";
import { crearReserva } from "../api";

export default function ReservaForm({ servicioSeleccionado, onCreada }) {
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");

  const enviar = async (e) => {
    e.preventDefault();
    if (!servicioSeleccionado) {
      alert("Primero selecciona un servicio de la lista");
      return;
    }
    if (!cliente || !fecha) {
      alert("Completa todos los campos");
      return;
    }
    try {
      await crearReserva({
        cliente,
        servicio_id: servicioSeleccionado.id,
        fecha,
      });
      setCliente("");
      setFecha("");
      onCreada && onCreada();
    } catch (err) {
      console.error(err);
      alert("Error al crear la reserva");
    }
  };

  return (
    <form onSubmit={enviar}>
      <h2>Reservar: {servicioSeleccionado ? servicioSeleccionado.nombre : "(selecciona un servicio)"}</h2>
      <input placeholder="Tu nombre" value={cliente} onChange={(e) => setCliente(e.target.value)} />
      <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      <button type="submit">Reservar</button>
    </form>
  );
}