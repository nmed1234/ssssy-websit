import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Send the httpOnly token cookies on every cross-origin request to the backend.
  withCredentials: true,
});

// No request interceptor needed: the httpOnly accessToken cookie is attached
// automatically by the browser via withCredentials. We no longer read
// localStorage for tokens.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // The httpOnly refreshToken cookie is sent automatically with withCredentials.
        // POST to /auth/refresh with an empty body — no token needed in the body.
        await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // New cookies have been set by the backend. Retry the original request;
        // withCredentials will send the updated accessToken cookie automatically.
        return api(originalRequest);
      } catch {
        // Refresh failed — clear the user profile and redirect to login.
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
