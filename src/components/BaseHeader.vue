<template>
  <v-app-bar
    app
    flat
    :color="isDark ? 'grey-darken-4' : 'primary'"
    class="header"
    elevate-on-scroll
  >
    <!-- لوگو و عنوان -->
    <div class="d-flex align-center">
      <v-img
        src="https://via.placeholder.com/36"
        max-width="36"
        class="me-2 rounded"
        alt="Logo"
      />
      <span class="text-h6 font-weight-medium">پنل مدیریت</span>
    </div>

    <!-- منوی همبرگری برای موبایل -->
    <v-app-bar-nav-icon
      @click="drawer = !drawer"
      class="d-lg-none"
      color="white"
    >
      <v-icon size="28">mdi-menu</v-icon>
    </v-app-bar-nav-icon>

    <!-- لینک‌های ناوبری دسکتاپ -->
    <v-spacer />
    <v-btn
      v-for="item in navItems"
      :key="item.title"
      :to="item.to"
      text
      class="d-none d-lg-flex mx-1 text-capitalize"
      :active="currentRoute === item.to"
      color="white"
    >
      <v-icon start size="20">{{ item.icon }}</v-icon>
      {{ item.title }}
    </v-btn>

    <!-- نوار جستجو -->
    <v-text-field
      v-model="searchQuery"
      placeholder="جستجو..."
      prepend-inner-icon="mdi-magnify"
      variant="solo"
      flat
      hide-details
      class="search-bar d-none d-md-flex mx-3"
      style="max-width: 250px;"
      @input="handleSearch"
    />

    <!-- منوی کاربر -->
    <v-menu bottom left offset-y transition="slide-y-transition">
      <template #activator="{ props }">
        <v-btn icon v-bind="props" class="mx-1">
          <v-avatar size="32" color="white">
            <span class="text-primary text-caption">{{ userInitials }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card min-width="180">
        <v-list dense>
          <v-list-item>
            <v-list-item-title class="text-subtitle-2">{{ userName }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item to="/profile">
            <v-list-item-icon><v-icon size="20">mdi-account</v-icon></v-list-item-icon>
            <v-list-item-title>پروفایل</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-icon><v-icon size="20">mdi-logout</v-icon></v-list-item-icon>
            <v-list-item-title>خروج</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- دکمه تغییر تم -->
    <v-btn icon class="mx-1" @click="toggleTheme">
      <v-icon size="24">{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent' }}</v-icon>
    </v-btn>
  </v-app-bar>

  <!-- منوی موبایل -->
  <v-navigation-drawer
    v-model="drawer"
    temporary
    right
    width="260"
    :color="isDark ? 'grey-darken-4' : 'white'"
    class="mobile-drawer"
  >
    <v-list dense nav class="pt-3">
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        :active="currentRoute === item.to"
        class="py-2"
        @click="drawer = false"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title class="text-body-1">{{ item.title }}</v-list-item-title>
      </v-list-item>
      <v-divider class="my-2" />
      <v-list-item to="/profile" @click="drawer = false">
        <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
        <v-list-item-title>پروفایل</v-list-item-title>
      </v-list-item>
      <v-list-item @click="logout">
        <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
        <v-list-item-title>خروج</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'

const drawer = ref(false)
const searchQuery = ref('')
const router = useRouter()
const route = useRoute()
const theme = useTheme()

const isDark = computed(() => theme.global.name.value === 'dark')
const currentRoute = computed(() => route.path)

const navItems = [
  { title: 'داشبورد', to: '/dashboard', icon: 'mdi-view-dashboard' },
  { title: 'کاربران', to: '/users', icon: 'mdi-account-group' },
  { title: 'پروژه‌ها', to: '/projects', icon: 'mdi-briefcase' },
  { title: 'تسک‌ها', to: '/tasks', icon: 'mdi-format-list-checkbox' }
]

const userName = ref('کاربر نمونه')
const userInitials = computed(() => {
  const names = userName.value.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
})

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const handleSearch = () => {
  console.log('جستجو:', searchQuery.value)
  // منطق جستجو باید اینجا پیاده‌سازی شود
}
</script>

<style scoped>
.header {
  background: linear-gradient(90deg, #0288d1, #26c6da);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-bar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.search-bar:hover {
  background: rgba(255, 255, 255, 0.3);
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.v-btn--active {
  background: rgba(255, 255, 255, 0.25);
}

.mobile-drawer {
  border-radius: 0 0 0 12px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}

.v-avatar:hover {
  transform: scale(1.05);
}
</style>