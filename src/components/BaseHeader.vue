<template>
  <v-app-bar
    app
    flat
    :color="isDark ? 'grey-darken-4' : 'primary'"
    class="header"
    elevate-on-scroll
  >
    <div class="d-flex align-center">
      <v-img
        src="https://via.placeholder.com/36"
        max-width="36"
        class="me-2 rounded"
        alt="Logo"
      />
      <span class="text-h6 font-weight-medium">پنل مدیریت</span>
    </div>

    <v-app-bar-nav-icon
      @click="drawer = !drawer"
      class="d-lg-none"
      color="white"
    >
      <v-icon size="28">mdi-menu</v-icon>
    </v-app-bar-nav-icon>

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

    <v-spacer /> <v-menu bottom left offset-y transition="slide-y-transition">
      <template #activator="{ props }">
        <v-btn icon v-bind="props" class="mx-1">
          <v-avatar size="32" color="white">
            <span class="text-primary text-caption">{{ userInitials }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card min-width="200">
        <v-list dense nav>
          <v-list-item class="mb-2">
            <v-list-item-title class="font-weight-bold">{{ userName }}</v-list-item-title>
            <v-list-item-subtitle v-if="isAdmin" class="text-caption text-primary">ادمین سیستم</v-list-item-subtitle>
          </v-list-item>
          <v-divider />
          <v-list-item to="/profile" prepend-icon="mdi-account-outline" title="پروفایل" />
          <v-list-item @click="handleLogout" prepend-icon="mdi-logout" title="خروج" />
        </v-list>
      </v-card>
    </v-menu>

    <v-btn icon class="mx-1" @click="toggleTheme">
      <v-icon size="24">{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waxing-crescent' }}</v-icon>
    </v-btn>
  </v-app-bar>

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
        :prepend-icon="item.icon"
        :title="item.title"
        :active="currentRoute === item.to"
        class="py-2"
        @click="drawer = false"
      />
      <v-divider class="my-2" />
      <v-list-item to="/profile" prepend-icon="mdi-account-outline" title="پروفایل" @click="drawer = false" />
      <v-list-item @click="handleLogout" prepend-icon="mdi-logout" title="خروج" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'

const drawer = ref(false)
// متغیر searchQuery حذف شد
const router = useRouter()
const route = useRoute()
const theme = useTheme()
const authStore = useAuthStore()

// خواندن اطلاعات از Store
const isAdmin = computed(() => authStore.isAdmin)
// اصلاح شد تا از 'name' استفاده کند
const userName = computed(() => authStore.user?.name || 'کاربر مهمان')
const isDark = computed(() => theme.global.name.value === 'dark')
const currentRoute = computed(() => route.path)

const userInitials = computed(() => {
  if (!userName.value || userName.value === 'کاربر مهمان') return '؟'
  const names = userName.value.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
})

// لیست کامل آیتم‌های منو
const allNavItems = [
  { title: 'داشبورد', to: '/dashboard', icon: 'mdi-view-dashboard', requiresAdmin: true },
  { title: 'کاربران', to: '/users', icon: 'mdi-account-group', requiresAdmin: true },
  { title: 'پروژه‌ها', to: '/projects', icon: 'mdi-briefcase', requiresAdmin: false },
  { title: 'تسک‌ها', to: '/tasks', icon: 'mdi-format-list-checkbox', requiresAdmin: false }
]

// فیلتر کردن منوها بر اساس نقش کاربر
const navItems = computed(() => {
  return allNavItems.filter(item => !item.requiresAdmin || isAdmin.value)
})

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// تابع handleSearch حذف شد
</script>

<style scoped>
.header {
  background: linear-gradient(90deg, #0288d1, #26c6da);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
/* استایل‌های search-bar حذف شدند */
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