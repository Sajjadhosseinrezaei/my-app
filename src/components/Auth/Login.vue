<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-4">
          <v-card-title class="text-h6 text-center">ورود</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="loginUser">
              <v-text-field
                v-model="form.email"
                label="ایمیل"
                prepend-inner-icon="mdi-account"
                required
              />
              <v-text-field
                v-model="form.password"
                label="رمز عبور"
                type="password"
                prepend-inner-icon="mdi-lock"
                required
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
              >
                ورود
              </v-btn>
            </v-form>
            <v-alert
              v-if="error"
              type="error"
              class="mt-4"
              dense
              text
            >
              {{ error }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import API from '../../services/api'

const form = ref({
  email: '',
  password: '',
})
const error = ref('')
const loading = ref(false)
const router = useRouter()

const loginUser = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await API.post('/token/', form.value)
    const token = response.data.access
    localStorage.setItem('token', token)
    router.push('/dashboard')
  } catch (err) {
    error.value = 'نام کاربری یا رمز اشتباه است'
  } finally {
    loading.value = false
  }
}
</script>
