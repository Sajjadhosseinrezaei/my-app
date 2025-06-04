export const authStore = {
  login(token) {
    localStorage.setItem('token', token)
  },
  logout() {
    localStorage.removeItem('token')
  },
  getToken() {
    return localStorage.getItem('token')
  },
}
