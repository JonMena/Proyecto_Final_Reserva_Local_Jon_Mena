import React, { useEffect, useState } from "react";
import ServiciosList from "../components/ServiciosList";
import ReservaForm from "../components/ReservaForm";
import ReservaCard from "../components/ReservaCard";
import { getReservas } from "../api";

export default function Reservas() {
  const [servicio, setServicio] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const recargar = () => {
    getReservas().then((r) => setReservas(r.data)).catch(console.error);
  };

  useEffect(() => {
    recargar();
  }, []);

  const texto = busqueda.trim().toLowerCase();

  const reservasFiltradas = reservas.filter((r) => {
    const coincideTexto =
      texto === "" ||
      r.cliente.toLowerCase().includes(texto) ||
      r.fecha.includes(texto);
    const coincideEstado =
      filtroEstado === "todos" || r.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  return (
    <div className="contenedor">
      <h1>ReservaLocal</h1>

      <ServiciosList onSeleccionar={setServicio} busqueda={texto} />

      <ReservaForm servicioSeleccionado={servicio} onCreada={recargar} />

      <h2>Mis reservas</h2>
      <div className="filtros">
        <input
          placeholder="Buscar por nombre o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="confirmada">Confirmadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {reservasFiltradas.length === 0 && (
        <p>No hay reservas que coincidan con la búsqueda.</p>
      )}
      {reservasFiltradas.map((r) => (
        <ReservaCard key={r.id} reserva={r} onChange={recargar} />
      ))}
    </div>
  );
}