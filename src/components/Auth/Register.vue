<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-4 pa-md-6" elevation="8" rounded="lg">
          <h2 class="text-h5 text-center font-weight-bold mb-6">ایجاد حساب کاربری</h2>
          
          <v-form @submit.prevent="registerUser">
            <v-text-field
              v-model="form.name"
              label="نام"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              required
              class="mb-3"
              :error-messages="errors.name"
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
              v-model="form.passwordConfirm"
              label="تکرار رمز عبور"
              type="password"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="outlined"
              required
              class="mb-3"
              :error-messages="errors.passwordConfirm"
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
import { api } from '@/stores/auth';

// تغییر 2: به‌روزرسانی مدل فرم برای هماهنگی با سریالایزر
const form = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '', // تغییر نام از password2 برای خوانایی بهتر
});

const loading = ref(false);
const errors = ref({}); 
const router = useRouter();

const registerUser = async () => {
  loading.value = true;
  errors.value = {}; // پاک کردن خطاهای قبلی

  // تغییر 3: اعتبارسنجی تکرار رمز عبور در سمت کلاینت
  if (form.value.password !== form.value.passwordConfirm) {
    errors.value = { passwordConfirm: ['رمزهای عبور با یکدیگر مطابقت ندارند.'] };
    loading.value = false;
    return; // متوقف کردن اجرای تابع
  }

  try {
    // تغییر 4: ساخت یک payload که فقط شامل فیلدهای مورد نیاز سریالایزر باشد
    const payload = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    };
    
    // فرض می‌شود اندپوینت صحیح است
    const response = await api.post('/accounts/create/', payload);
    
    console.log('Registration successful:', response.data);
    
    // هدایت کاربر به صفحه لاگین پس از ثبت نام موفق
    router.push('/login');

  } catch (error) {
    if (error.response && error.response.status === 400) {
      // خطاها از سمت سرور در state ذخیره می‌شوند
      errors.value = error.response.data;
    } else {
      // سایر خطاها
      errors.value = { non_field_errors: ['خطایی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.'] };
      console.error('Registration failed:', error);
    }
  } finally {
    loading.value = false;
  }
};
</script>