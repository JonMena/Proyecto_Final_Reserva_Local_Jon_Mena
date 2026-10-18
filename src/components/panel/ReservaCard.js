import React, { useEffect, useState } from "react";
import { getHorariosDisponibles } from "../../api";

// --- Convierte "YYYY-MM-DD HH:MM" (formato interno) a "DD/MM/YYYY HH:MM" (España) ---
function formatearFechaEsp(fecha) {
  if (!fecha) return "";
  const partes = fecha.split(" ");
  const ymd = partes[0].split("-");
  if (ymd.length !== 3) return fecha;
  const anio = ymd[0];
  const mes = ymd[1];
  const dia = ymd[2];
  const hora = partes[1] ? " " + partes[1] : "";
  return dia + "/" + mes + "/" + anio + hora;
}

// --- Límites de fecha coherentes con el resto de la app ---
function fechaMaximaUnMes() {
  const hoy = new Date();
  const mesSig = hoy.getMonth() + 1;
  const anioSig = mesSig > 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const mesNorm = mesSig > 11 ? 0 : mesSig;
  const ultimoDiaMesSig = new Date(anioSig, mesNorm + 1, 0).getDate();
  const diaLimite = Math.min(hoy.getDate(), ultimoDiaMesSig);
  const maximo = new Date(anioSig, mesNorm, diaLimite);
  const y = maximo.getFullYear();
  const m = String(maximo.getMonth() + 1).padStart(2, "0");
  const d = String(maximo.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function fechaMinimaHoy() {
  return new Date().toISOString().split("T")[0];
}

// --- Tarjeta de reserva con acciones según el rol ---
// ADMIN: Confirmar / Cancelar / Eliminar (NUNCA cambia la fecha)
// CLIENTE: Cambiar hora + Cancelar (si activa) / Eliminar (si cancelada)
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
  const [cargandoSlots, setCargandoSlots] = useState(false);

  // Carga las horas libres del día elegido al cambiar la hora
  useEffect(() => {
    setHora("");
    setSlots([]);
    if (!dia) return;
    setCargandoSlots(true);
    getHorariosDisponibles(dia, negocioId)
      .then((resp) => {
        if (resp.data.pasado || resp.data.cerrado) {
          setSlots([]);
        } else {
          setSlots(resp.data.slots);
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setCargandoSlots(false));
  }, [dia, negocioId]);

  const confirmarCambio = () => {
    if (!dia || !hora) return;
    onActualizar({ fecha: dia + " " + hora, estado: "pendiente" });
    setCambiando(false);
    setDia("");
    setHora("");
  };

  const eliminarConConfirmacion = (mensaje) => {
    if (window.confirm(mensaje)) {
      onBorrar();
    }
  };

  const estado = reserva.estado;

  return (
    <article className="reserva-card">
      <div className="reserva-card-datos">
        <strong>{nombreServicio}</strong>
        <span>Cliente: {reserva.cliente}</span>
        <span>Fecha: {formatearFechaEsp(reserva.fecha)}</span>
        <span className={"reserva-card-estado " + estado}>{estado}</span>
      </div>

      <div className="reserva-card-acciones">
        {modo === "admin" ? (
          // ---- ADMIN: flujo por estado, sin tocar fecha ----
          <React.Fragment>
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
            {estado === "confirmada" && (
              <button
                className="btn-cancelar"
                onClick={() => onActualizar({ estado: "cancelada" })}
              >
                Cancelar
              </button>
            )}
            {estado === "cancelada" && (
              <React.Fragment>
                <button
                  className="btn-confirmar"
                  onClick={() => onActualizar({ estado: "confirmada" })}
                >
                  Confirmar
                </button>
                <button
                  className="btn-borrar"
                  onClick={() =>
                    eliminarConConfirmacion(
                      "¿Seguro que quieres eliminar esta reserva del todo?"
                    )
                  }
                >
                  Eliminar
                </button>
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          // ---- CLIENTE: cambiar hora / cancelar / eliminar ----
          <React.Fragment>
            {(estado === "pendiente" || estado === "confirmada") && (
              <React.Fragment>
                <button
                  className="btn-cambiar"
                  onClick={() => setCambiando(!cambiando)}
                >
                  {cambiando ? "Cerrar" : "Cambiar hora"}
                </button>
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
              </React.Fragment>
            )}
            {estado === "cancelada" && (
              <button
                className="btn-borrar"
                onClick={() =>
                  eliminarConConfirmacion(
                    "¿Seguro que quieres eliminar esta reserva del todo?"
                  )
                }
              >
                Eliminar
              </button>
            )}
          </React.Fragment>
        )}
      </div>

      {/* Selector de nueva fecha/hora (solo cliente) */}
      {cambiando && modo === "cliente" && (
        <div className="reserva-card-cambio">
          <input
            type="date"
            value={dia}
            min={fechaMinimaHoy()}
            max={fechaMaximaUnMes()}
            onChange={(e) => setDia(e.target.value)}
          />
          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            disabled={!dia || cargandoSlots || slots.length === 0}
          >
            <option value="">
              {cargandoSlots
                ? "Cargando horas..."
                : dia
                ? "Elige hora..."
                : "Elige primero un día"}
            </option>
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