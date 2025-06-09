<template>
  <v-container class="fill-height" fluid style="background-color: #f5f5f5;">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-4 pa-md-6" elevation="8" rounded="lg">
          <div class="text-center mb-6">
            <v-icon size="64" color="primary">mdi-shield-lock-outline</v-icon>
            <h2 class="text-h5 font-weight-bold mt-3">ورود به پنل مدیریت</h2>
          </div>

          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                label="ایمیل"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                required
                class="mb-4"
                :error-messages="error ? ' ' : ''"
              />
              <v-text-field
                v-model="form.password"
                label="رمز عبور"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                required
                :error-messages="error ? ' ' : ''"
              />

              <v-alert
                v-if="error"
                type="error"
                class="mb-4"
                density="compact"
                variant="tonal"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
                :disabled="loading"
                class="mt-2"
              >
                ورود
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-actions class="justify-center mt-2">
            <a href="#" class="text-caption text-grey-darken-1 text-decoration-none">فراموشی رمز عبور</a>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // مسیر store را بررسی کنید

// State for the form
const form = ref({
  email: '',
  password: '',
})

// State for UI feedback
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

// Services
const router = useRouter()
const authStore = useAuthStore()

// Login handler function
const handleLogin = async () => {
  // Reset previous state
  loading.value = true
  error.value = ''

  // Call the login action from the Pinia store
  const loggedIn = await authStore.login(form.value.email, form.value.password)

  if (loggedIn) {
    // On successful login, redirect to the dashboard
    // The router guard will now allow access
    router.push('/dashboard')
  } else {
    // If login fails, show an error message
    error.value = 'ایمیل یا رمز عبور وارد شده صحیح نمی‌باشد.'
  }

  // Stop loading indicator
  loading.value = false
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>