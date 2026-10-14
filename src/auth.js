// --- Sesión: el "carnet" guardado en el navegador (token + usuario + negocio) ---

const TOKEN_KEY = "rl_token";
const USER_KEY = "rl_user";
const NEGOCIO_KEY = "rl_negocio";

export function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  try {
    return { token: token, usuario: JSON.parse(userRaw) };
  } catch (e) {
    return null;
  }
}

export function saveSession(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function getNegocio() {
  const raw = localStorage.getItem(NEGOCIO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setNegocio(negocio) {
  localStorage.setItem(NEGOCIO_KEY, JSON.stringify(negocio));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(NEGOCIO_KEY);
}