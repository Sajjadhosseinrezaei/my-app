import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Auth/Login.vue'
import Register from '../components/Auth/Register.vue'
import Dashboard from '../components/Dashboard.vue'
import Users from '../components/Users.vue'
import Projects from '../components/Projects.vue'
import Tasks from '../components/Tasks.vue'
import Home from '@/components/Home.vue'
import Profile from '@/components/Profile.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard },
  { path: '/users', component: Users },
  { path: '/projects', component: Projects },
  { path: '/tasks', component: Tasks },
  { path: '/profile', component: Profile,  meta: { requiresAuth: true }},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
