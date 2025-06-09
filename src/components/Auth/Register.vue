<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-4 pa-md-6" elevation="8" rounded="lg">
          <h2 class="text-h5 text-center font-weight-bold mb-6">ایجاد حساب کاربری</h2>
          
          <v-form @submit.prevent="registerUser">
            <v-text-field
              v-model="form.username"
              label="نام کاربری"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              required
              class="mb-3"
              :error-messages="errors.username"
            />
            
            <v-text-field
              v-model="form.email"
              label="ایمیل"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              required
              class="mb-3"
              :error-messages="errors.email"
            />

            <v-text-field
              v-model="form.password"
              label="رمز عبور"
              type="password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              required
              class="mb-3"
              :error-messages="errors.password"
            />

            <v-text-field
              v-model="form.password2"
              label="تکرار رمز عبور"
              type="password"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="outlined"
              required
              class="mb-3"
              :error-messages="errors.password2"
            />
            
            <v-alert v-if="errors.non_field_errors" type="error" density="compact" variant="tonal" class="mb-4">
              {{ errors.non_field_errors.join(', ') }}
            </v-alert>

            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              ثبت نام
            </v-btn>
            
            <div class="text-center mt-4">
              <router-link to="/login" class="text-body-2 text-decoration-none">
                قبلاً ثبت‌نام کرده‌اید؟ وارد شوید
              </router-link>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 1. ایمپورت صحیح نمونه api به صورت نام‌گذاری شده (named import)
import { api } from '@/stores/auth';

const form = ref({
  username: '',
  email: '',
  password: '',
  password2: '', // فیلد تکرار رمز عبور اضافه شد
});

const loading = ref(false);
// 2. آبجکتی برای نگهداری خطاهای هر فیلد که از سمت سرور می‌آید
const errors = ref({}); 
const router = useRouter(); // 3. برای هدایت کاربر پس از ثبت نام

const registerUser = async () => {
  loading.value = true;
  errors.value = {}; // پاک کردن خطاهای قبلی

  try {
    // 4. اندپوینت خود را اینجا قرار دهید
    const response = await api.post('/accounts/manager/', form.value);
    
    console.log('Registration successful:', response.data);
    
    // 5. بهبود تجربه کاربری: پس از ثبت نام موفق، کاربر را به صفحه لاگین هدایت کن
    router.push('/login');

  } catch (error) {
    // 6. مدیریت هوشمند خطاها
    if (error.response && error.response.status === 400) {
      // اگر خطای Validation (400) از سمت سرور آمد، آن را در state ذخیره کن
      // با این کار خطاها زیر فیلدهای مربوطه نمایش داده می‌شوند
      errors.value = error.response.data;
    } else {
      // سایر خطاها (مثل خطای سرور 500 یا عدم اتصال)
      errors.value = { non_field_errors: ['خطایی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.'] };
      console.error('Registration failed:', error);
    }
  } finally {
    loading.value = false;
  }
};
</script>