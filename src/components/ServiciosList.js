import React, { useEffect, useState } from "react";
import { getServicios } from "../api";

export default function ServiciosList({ onSeleccionar, busqueda = "" }) {
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    getServicios().then((res) => setServicios(res.data)).catch(console.error);
  }, []);

  const visibles = servicios.filter(
    (s) => busqueda === "" || s.nombre.toLowerCase().includes(busqueda)
  );

  return (
    <div>
      <h2>Nuestros servicios</h2>
      <ul>
        {visibles.map((s) => (
          <li
            key={s.id}
            onClick={() => onSeleccionar && onSeleccionar(s)}
            style={{ cursor: "pointer" }}
          >
            {s.nombre} — {s.precio} €
          </li>
        ))}
      </ul>
    </div>
  );
}