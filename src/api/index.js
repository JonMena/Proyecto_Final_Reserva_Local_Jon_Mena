import axios from "axios";

// --- Cable inteligente: local en desarrollo, servidor en producción ---
const baseURL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://jonmena.pythonanywhere.com";

const API = axios.create({
  baseURL: baseURL,
});

// Portero automático: añade el token a TODAS las peticiones
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("rl_token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
});

// Convierte rutas relativas (/uploads/...) en URLs completas
export const urlRecurso = (ruta) => {
  if (!ruta) return "";
  if (ruta.startsWith("http")) return ruta;
  return baseURL + ruta;
};

// ---------- Negocios ----------
export const getNegocios = () => API.get("/negocios");
export const getMisNegocios = () => API.get("/negocios/mios");
export const actualizarNegocio = (id, datos) => API.put(`/negocios/${id}`, datos);
export const subirIcono = (negocioId, formData) =>
  API.post(`/negocios/${negocioId}/foto`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const quitarIcono = (negocioId) => API.delete(`/negocios/${negocioId}/foto`);

// ---------- Servicios ----------
export const getServicios = (negocioId) =>
  API.get(`/servicios?negocio_id=${negocioId}`);
export const crearServicio = (datos) => API.post("/servicios", datos);
export const actualizarServicio = (id, datos) => API.put(`/servicios/${id}`, datos);
export const borrarServicio = (id) => API.delete(`/servicios/${id}`);

// ---------- Reservas ----------
export const getReservas = (negocioId) =>
  API.get(negocioId ? `/reservas?negocio_id=${negocioId}` : "/reservas");
export const crearReserva = (datos) => API.post("/reservas", datos);
export const actualizarReserva = (id, datos) => API.put(`/reservas/${id}`, datos);
export const borrarReserva = (id) => API.delete(`/reservas/${id}`);

// ---------- Horarios ----------
export const getHorario = (negocioId) => API.get(`/horario?negocio_id=${negocioId}`);
export const actualizarHorario = (datos) => API.put("/horario", datos);
export const getHorariosDisponibles = (fecha, negocioId) =>
  API.get(`/horarios/disponibles?fecha=${fecha}&negocio_id=${negocioId}`);

// ---------- Auth ----------
export const login = (email, password) =>
  API.post("/login", { email, password });

export const logout = (token) => API.post("/logout", { token });

export const registro = (datos) => API.post("/registro", datos);