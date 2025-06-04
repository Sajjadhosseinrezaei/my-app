<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-4">
          <v-card-title class="text-h6 text-center">ثبت‌نام</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="registerUser">
              <v-text-field
                v-model="form.username"
                label="نام کاربری"
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
              <v-text-field
                v-model="form.email"
                label="ایمیل"
                type="email"
                prepend-inner-icon="mdi-email"
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
              >
                ثبت‌نام
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
            <v-alert
              v-if="success"
              type="success"
              class="mt-4"
              dense
              text
            >
              ثبت‌نام موفق! حالا وارد شوید.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import API from '../../services/api'

const form = ref({
  username: '',
  password: '',
  email: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const registerUser = async () => {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    await API.post('/accounts/manager/', form.value)
    success.value = true
    form.value = {email: '', password: '' }
  } catch (err) {
    error.value = 'خطا در ثبت‌نام. لطفاً اطلاعات را بررسی کنید.'
  } finally {
    loading.value = false
  }
}
</script>
