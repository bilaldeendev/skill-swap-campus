const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  me: (token) => request("/auth/me", { token }),

  browseUsers: (token, q, campus) =>
    request(`/users?${q ? `q=${encodeURIComponent(q)}&` : ""}${campus ? `campus=${encodeURIComponent(campus)}` : ""}`, { token }),
  getUser: (token, id) => request(`/users/${id}`, { token }),
  updateProfile: (token, body) => request("/users/me/update", { method: "PATCH", body, token }),

  mySessions: (token) => request("/sessions/mine", { token }),
  createSession: (token, body) => request("/sessions", { method: "POST", body, token }),
  updateSessionStatus: (token, id, status) =>
    request(`/sessions/${id}/status`, { method: "PATCH", body: { status }, token }),

  conversations: (token) => request("/messages", { token }),
  thread: (token, userId) => request(`/messages/${userId}`, { token }),
  sendMessage: (token, body) => request("/messages", { method: "POST", body, token }),

  userReviews: (token, userId) => request(`/reviews/${userId}`, { token }),
  createReview: (token, body) => request("/reviews", { method: "POST", body, token }),
};
