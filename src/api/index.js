import axios from "axios";

const API = axios.create({
  baseURL: "https://jonmena.pythonanywhere.com",
});

export const getServicios = () => API.get("/servicios");
export const getReservas = () => API.get("/reservas");
export const crearReserva = (datos) => API.post("/reservas", datos);
export const actualizarReserva = (id, datos) => API.put(`/reservas/${id}`, datos);
export const borrarReserva = (id) => API.delete(`/reservas/${id}`);