// src/stores/auth.js - نسخه نهایی، صحیح و مرتب‌شده

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// ۱. ایجاد و صدور نمونه api
export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api'
});

// ۲. تعریف و صدور store
export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null')) // افزودن 'null' برای جلوگیری از خطای JSON.parse
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value && user.value.is_staff)

  // --- ACTIONS ---
  function setAuthData(userData, access, refresh) {
    user.value = userData
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

// src/stores/auth.js

function updateUserData(newUserData) {
    // اگر user.value نال بود، از یک آبجکت خالی استفاده کن
    user.value = { ...(user.value || {}), ...newUserData };
    localStorage.setItem('user', JSON.stringify(user.value));
}

  async function login(email, password) {
    try {
      const response = await api.post('/token/', { email, password })
      setAuthData(response.data.user, response.data.access, response.data.refresh)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      logout()
      return false
    }
  }
  
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      return false
    }
    try {
      const response = await api.post('/token/refresh/', { refresh: refreshToken.value })
      accessToken.value = response.data.access
      localStorage.setItem('accessToken', response.data.access)
      return true
    } catch (error) {
      console.error('Failed to refresh token:', error)
      logout()
      return false
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('token');
  }

  return { user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshAccessToken,
    setAuthData,
    updateUserData
  }
});


// ۳. اتصال رهگیرها (Interceptors) بعد از تعریف کامل همه اجزا

// رهگیر درخواست (Request Interceptor)
api.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

// رهگیر پاسخ (Response Interceptor)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await authStore.refreshAccessToken();
        if (refreshed) {
          processQueue(null, authStore.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
          return api(originalRequest);
        } else {
          processQueue(new Error('Unable to refresh token'), null);
          return Promise.reject(error);
        }
      } finally {
        isRefreshing = false; // <-- راه‌حل اصلی: این خط باید در finally باشد تا همیشه اجرا شود
      }
    }
    return Promise.reject(error);
  }
);