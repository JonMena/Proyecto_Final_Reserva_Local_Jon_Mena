import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getServicios,
  getReservas,
  crearReserva,
  actualizarReserva,
  borrarReserva,
  crearServicio,
  actualizarServicio,
  borrarServicio,
  getHorario,
  actualizarHorario,
  actualizarNegocio,
  subirIcono,
  quitarIcono,
  urlRecurso,
} from "../api";
import ReservaForm from "../components/panel/ReservaForm";
import ReservaCard from "../components/panel/ReservaCard";
import ServiciosList from "../components/panel/ServiciosList";
import "../style/paneles.scss";

export default function Reservas({ usuario, negocio, onReservaCreada, onNegocioActualizado }) {
  const esAdmin = usuario.rol === "admin";

  const [servicios, setServicios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [horario, setHorario] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [toasts, setToasts] = useState([]);
  const [nombreNegocio, setNombreNegocio] = useState(negocio.nombre);
  const [archivo, setArchivo] = useState(null);

  useEffect(function () {
    setNombreNegocio(negocio.nombre);
  }, [negocio.nombre]);

  const pushToast = function (mensaje, tipo) {
    const id = Date.now() + Math.random();
    const nuevo = { id: id, mensaje: mensaje, tipo: tipo };
    setToasts(function (t) {
      return t.concat([nuevo]);
    });
    setTimeout(function () {
      setToasts(function (t) {
        return t.filter(function (x) {
          return x.id !== id;
        });
      });
    }, 3000);
  };

  const errorDe = function (e, porDefecto) {
    const msg = e.response && e.response.data && e.response.data.error;
    return msg || porDefecto;
  };

  const cargarTodo = useCallback(async function () {
    try {
      const resultados = await Promise.all([
        getServicios(negocio.id),
        getReservas(negocio.id),
      ]);
      setServicios(resultados[0].data);
      setReservas(resultados[1].data);
    } catch (e) {
      pushToast("No se pudieron cargar los datos.", "error");
    }
  }, [negocio.id]);

  useEffect(function () {
    cargarTodo();
  }, [cargarTodo]);

  useEffect(function () {
    getHorario(negocio.id)
      .then(function (h) { setHorario(h.data); })
      .catch(function () { setHorario(null); });
  }, [negocio.id]);

  const nombreServicio = function (id) {
    const s = servicios.find(function (x) { return x.id === id; });
    return s ? s.nombre : "Servicio " + id;
  };

  const reservasPorTexto = useMemo(function () {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return reservas;
    return reservas.filter(function (r) {
      return (
        r.cliente.toLowerCase().includes(texto) ||
        r.fecha.toLowerCase().includes(texto) ||
        nombreServicio(r.servicio_id).toLowerCase().includes(texto)
      );
    });
  }, [busqueda, reservas, servicios]);

  const estadosDisponibles = useMemo(function () {
    const vistos = reservasPorTexto.map(function (r) { return r.estado; });
    const unicos = [];
    vistos.forEach(function (v) {
      if (unicos.indexOf(v) === -1) unicos.push(v);
    });
    return ["todos"].concat(unicos);
  }, [reservasPorTexto]);

  const reservasVisibles = useMemo(function () {
    if (!esAdmin) return reservas;
    if (filtroEstado === "todos") return reservasPorTexto;
    return reservasPorTexto.filter(function (r) {
      return r.estado === filtroEstado;
    });
  }, [reservasPorTexto, filtroEstado, esAdmin, reservas]);

  useEffect(function () {
    if (filtroEstado !== "todos" && estadosDisponibles.indexOf(filtroEstado) === -1) {
      setFiltroEstado("todos");
    }
  }, [estadosDisponibles, filtroEstado]);

  const manejarCrearReserva = async function (datos) {
    try {
      await crearReserva(datos);
      if (onReservaCreada) {
        onReservaCreada();
      } else {
        pushToast("Reserva creada correctamente.", "ok");
        cargarTodo();
      }
    } catch (e) {
      pushToast(errorDe(e, "No se pudo crear la reserva."), "error");
    }
  };

  const manejarActualizarReserva = async function (id, datos) {
    try {
      await actualizarReserva(id, datos);
      pushToast("Reserva actualizada.", "ok");
      cargarTodo();
    } catch (e) {
      pushToast(errorDe(e, "No se pudo actualizar la reserva."), "error");
    }
  };

  const manejarBorrarReserva = async function (id) {
    try {
      await borrarReserva(id);
      pushToast("Reserva eliminada.", "ok");
      cargarTodo();
    } catch (e) {
      pushToast(errorDe(e, "No se pudo eliminar la reserva."), "error");
    }
  };

  const manejarCrearServicio = async function (datos) {
    try {
      const payload = {
        nombre: datos.nombre,
        precio: datos.precio,
        negocio_id: negocio.id,
      };
      await crearServicio(payload);
      pushToast("Servicio creado.", "ok");
      cargarTodo();
    } catch (e) {
      pushToast(errorDe(e, "No se pudo crear el servicio."), "error");
    }
  };

  const manejarEditarServicio = async function (id, datos) {
    try {
      await actualizarServicio(id, datos);
      pushToast("Servicio actualizado.", "ok");
      cargarTodo();
    } catch (e) {
      pushToast(errorDe(e, "No se pudo editar el servicio."), "error");
    }
  };

  const manejarBorrarServicio = async function (id) {
    try {
      await borrarServicio(id);
      pushToast("Servicio eliminado.", "ok");
      cargarTodo();
    } catch (e) {
      pushToast(errorDe(e, "No se pudo eliminar el servicio."), "error");
    }
  };

  const manejarHorario = async function (datos) {
    try {
      const payload = {
        negocio_id: negocio.id,
        dias: datos.dias,
      };
      const h = await actualizarHorario(payload);
      setHorario(h.data);
      pushToast("Horario semanal guardado con éxito.", "ok");
    } catch (e) {
      pushToast(errorDe(e, "No se pudo guardar el horario."), "error");
    }
  };

  const manejarNombreNegocio = async function () {
    try {
      const resp = await actualizarNegocio(negocio.id, { nombre: nombreNegocio });
      if (onNegocioActualizado) onNegocioActualizado(resp.data);
      pushToast("Nombre del negocio actualizado.", "ok");
    } catch (e) {
      pushToast(errorDe(e, "No se pudo cambiar el nombre."), "error");
    }
  };

  const manejarSubirIcono = async function () {
    if (!archivo) {
      pushToast("Elige primero una imagen.", "error");
      return;
    }
    const fd = new FormData();
    fd.append("foto", archivo);
    try {
      const resp = await subirIcono(negocio.id, fd);
      if (onNegocioActualizado) onNegocioActualizado(resp.data);
      pushToast("Icono del negocio actualizado.", "ok");
      setArchivo(null);
    } catch (e) {
      pushToast(errorDe(e, "No se pudo subir el icono."), "error");
    }
  };

  const manejarQuitarIcono = async function () {
    try {
      const resp = await quitarIcono(negocio.id);
      if (onNegocioActualizado) onNegocioActualizado(resp.data);
      pushToast("Icono eliminado.", "ok");
    } catch (e) {
      pushToast(errorDe(e, "No se pudo quitar el icono."), "error");
    }
  };

  return (
    <main className="panel">
      <div className="toast-contenedor">
        {toasts.map(function (t) {
          return (
            <div key={t.id} className={"toast toast-" + t.tipo}>
              {t.mensaje}
            </div>
          );
        })}
      </div>

      {esAdmin && (
        <section className="panel-busqueda">
          <input
            type="search"
            placeholder="Buscar por cliente, fecha o servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            {estadosDisponibles.map(function (est) {
              return (
                <option key={est} value={est}>
                  {est === "todos" ? "Todos los estados" : est}
                </option>
              );
            })}
          </select>
        </section>
      )}

      {esAdmin ? (
        <React.Fragment>
          <section className="panel-seccion">
            <h2>Agenda del negocio (todas las reservas)</h2>
            <div className="panel-lista">
              {reservasVisibles.length === 0 && (
                <p>No hay reservas que coincidan.</p>
              )}
              {reservasVisibles.map(function (r) {
                return (
                  <ReservaCard
                    key={r.id}
                    reserva={r}
                    modo="admin"
                    negocioId={negocio.id}
                    nombreServicio={nombreServicio(r.servicio_id)}
                    onActualizar={(datos) => manejarActualizarReserva(r.id, datos)}
                    onBorrar={() => manejarBorrarReserva(r.id)}
                  />
                );
              })}
            </div>
          </section>

          <section className="panel-seccion">
            <h2>Servicios del negocio</h2>
            <ServiciosList
              modo="admin"
              servicios={servicios}
              onCrear={manejarCrearServicio}
              onEditar={manejarEditarServicio}
              onBorrar={manejarBorrarServicio}
            />
          </section>

          <section className="panel-seccion">
            <h2>Horario semanal del negocio</h2>
            {horario && horario.length > 0 ? (
              <FormHorarioSemana horario={horario} onGuardar={manejarHorario} />
            ) : (
              <p>Cargando horario semanal...</p>
            )}
          </section>

          <section className="panel-seccion">
            <h2>Perfil del negocio</h2>
            <div className="fotos-subida" style={{ marginBottom: 14 }}>
              <input
                type="text"
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                placeholder="Nombre del negocio"
              />
              <button onClick={manejarNombreNegocio}>Guardar nombre</button>
            </div>
            <div className="fotos-galeria">
              {negocio.icono_url ? (
                <div className="foto-marco">
                  <img src={urlRecurso(negocio.icono_url)} alt={"Icono de " + negocio.nombre} />
                </div>
              ) : (
                <p>Sin icono todavía. Sube una imagen cuadrada para tu negocio.</p>
              )}
            </div>
            <div className="fotos-subida">
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={(e) => setArchivo(e.target.files[0])}
              />
              <button onClick={manejarSubirIcono}>Subir icono</button>
              {negocio.icono_url && (
                <button
                  onClick={manejarQuitarIcono}
                  style={{ background: "var(--error)", color: "#450a0a" }}
                >
                  Quitar icono
                </button>
              )}
            </div>
          </section>
        </React.Fragment>
      ) : (
        <section className="panel-seccion">
          <h2>Haz tu reserva en {negocio.nombre}</h2>
          <ReservaForm
            negocio={negocio}
            onCrear={manejarCrearReserva}
          />
        </section>
      )}
    </main>
  );
}

// ---------- Editor de SEMANA: una fila por día (MODO OSCURO) ----------
function FormHorarioSemana({ horario, onGuardar }) {
  const [dias, setDias] = useState(horario);

  const cambiarDia = function (indice, campo, valor) {
    setDias(function (prev) {
      const copia = prev.slice();
      const nuevo = Object.assign({}, copia[indice]);
      nuevo[campo] = valor;
      copia[indice] = nuevo;
      return copia;
    });
  };

  const estiloFila = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1px solid var(--borde)",
  };

  const estiloInput = {
    height: 38,
    padding: "0 10px",
    border: "1px solid var(--borde)",
    borderRadius: 10,
    fontSize: 14,
    background: "var(--superficie-2)",
    color: "var(--texto)",
    colorScheme: "dark",
  };

  return (
    <form
      className="horario-semana"
      onSubmit={function (e) {
        e.preventDefault();
        onGuardar({ dias: dias });
      }}
    >
      {dias.map(function (d, i) {
        return (
          <div style={estiloFila} key={d.dia}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: 140,
                fontSize: 14,
                fontWeight: 700,
                color: "var(--texto)",
                textTransform: "capitalize",
              }}
            >
              <input
                type="checkbox"
                checked={d.abierto}
                onChange={(e) => cambiarDia(i, "abierto", e.target.checked)}
              />
              {d.nombre_dia}
            </label>

            {d.abierto ? (
              <React.Fragment>
                <input
                  type="time"
                  style={estiloInput}
                  value={d.hora_apertura}
                  onChange={(e) => cambiarDia(i, "hora_apertura", e.target.value)}
                />
                <span style={{ color: "var(--texto-sec)" }}>a</span>
                <input
                  type="time"
                  style={estiloInput}
                  value={d.hora_cierre}
                  onChange={(e) => cambiarDia(i, "hora_cierre", e.target.value)}
                />
                <span style={{ color: "var(--texto-sec)", fontSize: 13 }}>cada</span>
                <input
                  type="number"
                  style={Object.assign({}, estiloInput, { width: 72 })}
                  min="5"
                  max="240"
                  step="5"
                  value={d.intervalo_minutos}
                  onChange={(e) => cambiarDia(i, "intervalo_minutos", e.target.value)}
                />
                <span style={{ color: "var(--texto-sec)", fontSize: 13 }}>min</span>
              </React.Fragment>
            ) : (
              <span style={{ color: "var(--texto-dim)", fontSize: 13, fontStyle: "italic" }}>
                Cerrado todo el día
              </span>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        style={{
          height: 42,
          padding: "0 18px",
          border: "none",
          borderRadius: 10,
          background: "var(--primario)",
          color: "#0f172a",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Guardar semana
      </button>
    </form>
  );
}