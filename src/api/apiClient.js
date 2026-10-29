const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("token");
}

export function setAuth({ token, user }) {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function safeParseJson(res) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await res.json();
  }

  const text = await res.text();
  return text ? { message: text } : null;
}

async function request(path, { method = "GET", body, headers } = {}) {
  const token = getToken();
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body !== undefined
      ? { body: isFormData ? body : JSON.stringify(body) }
      : {}),
  });

  if (res.status === 204) return null;

  const data = await safeParseJson(res);

  if (!res.ok) {
    const message = data?.message || `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  health: () => request("/api/health"),

  login: (payload) =>
    request("/api/auth/login", { method: "POST", body: payload }),

  register: (payload) =>
    request("/api/auth/register", { method: "POST", body: payload }),

  me: () => request("/api/auth/me"),

  logout: () => request("/api/auth/logout", { method: "POST" }),

  forgotPassword: (payload) =>
    request("/api/auth/forgot-password", { method: "POST", body: payload }),

  resetPassword: (payload) =>
    request("/api/auth/reset-password", { method: "POST", body: payload }),

  joinRequestMe: () => request("/api/join-request/me"),
  joinRequests: () => request("/api/join-requests"),

  adminJoinRequests: (status = "pending") =>
    request(`/api/admin/join-requests?status=${encodeURIComponent(status)}`),

  adminApproveJoinRequest: (id) =>
    request(`/api/admin/join-requests/${id}/approve`, { method: "POST" }),

  adminRejectJoinRequest: (id) =>
    request(`/api/admin/join-requests/${id}/reject`, { method: "POST" }),

  adminStats: () => request("/api/admin/stats"),
  adminUsers: () => request("/api/admin/users"),

  adminDeleteUser: (id) =>
    request(`/api/admin/users/${id}`, { method: "DELETE" }),

  adminUpdateUserRole: (id, role) =>
    request(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: { role },
    }),

  adminPing: () => request("/api/admin/ping"),

  feedPosts: (page = 1) => request(`/api/feed/posts?page=${page}`),
  getPost: (postId) => request(`/api/feed/posts/${postId}`),

  createPost: (formData) =>
    request("/api/feed/posts", { method: "POST", body: formData }),

  toggleLike: (postId) =>
    request(`/api/feed/posts/${postId}/like`, { method: "POST" }),

  postComments: (postId) =>
    request(`/api/feed/posts/${postId}/comments`),

  addComment: (postId, payload) =>
    request(`/api/feed/posts/${postId}/comments`, {
      method: "POST",
      body: payload,
    }),

  adminDeletePost: (postId) =>
    request(`/api/admin/posts/${postId}`, { method: "DELETE" }),

  adminDeleteComment: (commentId) =>
    request(`/api/admin/comments/${commentId}`, { method: "DELETE" }),

  profile: () => request("/api/profile"),

  updateProfile: (formData) =>
    request("/api/profile", { method: "POST", body: formData }),

  clinicSetup: (formData) =>
    request("/api/clinic/setup", { method: "POST", body: formData }),

  clinics: (page = 1) => request(`/api/clinics?page=${page}`),
  clinicDetails: (id) => request(`/api/clinics/${id}`),

  clinicSlotsPublic: (clinicId) =>
    request(`/api/clinics/${clinicId}/slots`),

  clinicSlots: (clinicId) =>
    request(`/api/clinics/${clinicId}/slots`),

  createBooking: (payload) =>
    request("/api/bookings", {
      method: "POST",
      body: payload,
    }),

  getDoctorDashboard: () => request("/api/doctor/dashboard"),
  doctorSlots: () => request("/api/doctor/slots"),

  createDoctorSlot: (payload) =>
    request("/api/doctor/slots", { method: "POST", body: payload }),

  deleteDoctorSlot: (id) =>
    request(`/api/doctor/slots/${id}`, { method: "DELETE" }),

  doctorAppointments: (status) =>
    request(
      `/api/doctor/appointments${
        status ? `?status=${encodeURIComponent(status)}` : ""
      }`
    ),

  updateAppointmentStatus: (id, status) =>
    request(`/api/doctor/appointments/${id}`, {
      method: "PATCH",
      body: { status },
    }),

  myActivities: () => request("/api/my/activities"),

  storeSetup: (formData) =>
  request("/api/store/setup", { method: "POST", body: formData }),

  stores: (page = 1) => request(`/api/stores?page=${page}`),
  storeDetails: (id) => request(`/api/stores/${id}`),
  storeProductsPublic: (storeId) => request(`/api/stores/${storeId}/products`),

  getStoreDashboard: () => request("/api/store/dashboard"),
  storeProducts: () => request("/api/store/products"),

  createStoreProduct: (formData) =>
    request("/api/store/products", { method: "POST", body: formData }),

  deleteStoreProduct: (id) =>
    request(`/api/store/products/${id}`, { method: "DELETE" }),

  storeOrders: () => request("/api/store/orders"),

  updateStoreOrderStatus: (id, status) =>
    request(`/api/store/orders/${id}`, {
      method: "PATCH",
      body: { status },
    }),

  createStoreOrder: (productId, payload) =>
    request(`/api/store/products/${productId}/order`, {
      method: "POST",
      body: payload,
    }),

      // shelters
    shelterSetup: (formData) =>
      request("/api/shelter/setup", { method: "POST", body: formData }),

    shelters: (page = 1) => request(`/api/shelters?page=${page}`),
    shelterDetails: (id) => request(`/api/shelters/${id}`),
    shelterAnimalsPublic: (shelterId) => request(`/api/shelters/${shelterId}/animals`),
    shelterDonationRequestsPublic: (shelterId) =>
      request(`/api/shelters/${shelterId}/donation-requests`),

    getShelterDashboard: () => request("/api/shelter/dashboard"),

    shelterAnimals: () => request("/api/shelter/animals"),
    createShelterAnimal: (formData) =>
      request("/api/shelter/animals", { method: "POST", body: formData }),

    shelterDonationRequests: () => request("/api/shelter/donation-requests"),
    createShelterDonationRequest: (payload) =>
      request("/api/shelter/donation-requests", { method: "POST", body: payload }),
      deleteShelterDonationRequest: (id) =>
      request(`/api/shelter/donation-requests/${id}`, { method: "DELETE" }),

    createShelterDonationSubmission: (requestId, payload) =>
      request(`/api/shelter/donation-requests/${requestId}/donate`, {
        method: "POST",
        body: payload,
      }),

  shelterDonationSubmissions: () => request("/api/shelter/donation-submissions"),

  updateShelterDonationSubmissionStatus: (id, status) =>
    request(`/api/shelter/donation-submissions/${id}`, {
      method: "PATCH",
      body: { status },
    }),

    createShelterAdoptionRequest: (animalId, payload) =>
      request(`/api/shelter/animals/${animalId}/adopt`, {
        method: "POST",
        body: payload,
      }),

    shelterAdoptionRequests: () => request("/api/shelter/adoption-requests"),
    updateShelterAdoptionRequestStatus: (id, status) =>
      request(`/api/shelter/adoption-requests/${id}`, {
        method: "PATCH",
        body: { status },
      }),

      savedPosts: () => request("/api/saved-posts"),

      toggleSavePost: (postId) =>
        request(`/api/feed/posts/${postId}/save`, {
          method: "POST",
        }),
};

export default api;

