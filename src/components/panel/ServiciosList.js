import React, { useState } from "react";

// --- Lista de servicios: lectura para cliente, CRUD para admin ---
export default function ServiciosList({
  modo,
  servicios,
  onCrear,
  onEditar,
  onBorrar,
}) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState("");

  const empezarEdicion = (s) => {
    setEditandoId(s.id);
    setEditNombre(s.nombre);
    setEditPrecio(String(s.precio));
  };

  const guardarEdicion = (id) => {
    onEditar(id, { nombre: editNombre, precio: Number(editPrecio) });
    setEditandoId(null);
  };

  const crear = (e) => {
    e.preventDefault();
    if (!nuevoNombre || nuevoPrecio === "") return;
    onCrear({ nombre: nuevoNombre, precio: Number(nuevoPrecio) });
    setNuevoNombre("");
    setNuevoPrecio("");
  };

  return (
    <div className="servicios-list">
      {servicios.length === 0 && <p>Todavía no hay servicios.</p>}
      {servicios.map((s) => (
        <div className="servicio-item" key={s.id}>
          {modo === "admin" && editandoId === s.id ? (
            <React.Fragment>
              <input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />
              <input
                type="number"
                step="0.5"
                value={editPrecio}
                onChange={(e) => setEditPrecio(e.target.value)}
              />
              <button className="btn-guardar" onClick={() => guardarEdicion(s.id)}>
                Guardar
              </button>
              <button className="btn-borrar" onClick={() => setEditandoId(null)}>
                Cancelar
              </button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span className="servicio-nombre">{s.nombre}</span>
              <span className="servicio-precio">{s.precio} €</span>
              {modo === "admin" && (
                <React.Fragment>
                  <button className="btn-editar" onClick={() => empezarEdicion(s)}>
                    Editar
                  </button>
                  <button className="btn-borrar" onClick={() => onBorrar(s.id)}>
                    Eliminar
                  </button>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>
      ))}

      {modo === "admin" && (
        <form className="servicio-form" onSubmit={crear}>
          <input
            type="text"
            placeholder="Nombre del servicio nuevo"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder="Precio (€)"
            value={nuevoPrecio}
            onChange={(e) => setNuevoPrecio(e.target.value)}
            required
          />
          <button type="submit">Añadir servicio</button>
        </form>
      )}
    </div>
  );
}