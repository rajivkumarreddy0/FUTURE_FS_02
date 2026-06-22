import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("crm_token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  me:    ()     => API.get("/auth/me"),
};

export const leadsAPI = {
  getAll:       (params) => API.get("/leads", { params }),
  getOne:       (id)     => API.get(`/leads/${id}`),
  create:       (data)   => API.post("/leads", data),
  update:       (id, data) => API.put(`/leads/${id}`, data),
  updateStatus: (id, status) => API.patch(`/leads/${id}/status`, { status }),
  delete:       (id)     => API.delete(`/leads/${id}`),
  getStats:     ()       => API.get("/leads/stats"),
};
