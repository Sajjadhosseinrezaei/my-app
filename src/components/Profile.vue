<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary">mdi-account-edit</v-icon>
            اطلاعات پروفایل
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleProfileUpdate">
              <v-text-field
                v-model="profileForm.username"
                label="نام کاربری"
                variant="outlined"
                readonly
                hint="نام کاربری قابل تغییر نیست."
                class="mb-4"
              />
              <v-text-field
                v-model="profileForm.email"
                label="ایمیل"
                type="email"
                variant="outlined"
                :error-messages="profileErrors.email"
                class="mb-4"
              />
              <v-btn
                type="submit"
                color="primary"
                variant="flat"
                :loading="profileLoading"
                block
              >
                ذخیره تغییرات
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="secondary">mdi-lock-reset</v-icon>
            تغییر رمز عبور
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handlePasswordChange">
              <v-text-field
                v-model="passwordForm.old_password"
                label="رمز عبور فعلی"
                type="password"
                variant="outlined"
                :error-messages="passwordErrors.old_password"
                class="mb-4"
              />
              <v-text-field
                v-model="passwordForm.new_password"
                label="رمز عبور جدید"
                type="password"
                variant="outlined"
                :error-messages="passwordErrors.new_password"
                class="mb-4"
              />
              <v-btn
                type="submit"
                color="secondary"
                variant="flat"
                :loading="passwordLoading"
                block
              >
                تغییر رمز عبور
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/stores/auth';

const authStore = useAuthStore();

// --- State for Profile Form ---
const profileForm = ref({
  username: '',
  email: '',
});
const profileLoading = ref(false);
const profileErrors = ref({});

// --- State for Password Form ---
const passwordForm = ref({
  old_password: '',
  new_password: '',
});
const passwordLoading = ref(false);
const passwordErrors = ref({});

// --- State for Snackbar ---
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
});

// Populate form with current user data when component mounts
onMounted(() => {
  if (authStore.user) {
    profileForm.value.username = authStore.user.username;
    profileForm.value.email = authStore.user.email;
  }
});

// --- Handlers ---
const handleProfileUpdate = async () => {
  profileLoading.value = true;
  profileErrors.value = {};
  try {
    const response = await api.patch('/accounts/profile/', { email: profileForm.value.email });
    // Update user info in the store to reflect changes everywhere
    authStore.updateUserData(response.data);
    showSnackbar('اطلاعات با موفقیت به‌روز شد.', 'success');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      profileErrors.value = err.response.data;
    } else {
      showSnackbar('خطا در به‌روزرسانی اطلاعات.', 'error');
    }
    console.error(err);
  } finally {
    profileLoading.value = false;
  }
};

const handlePasswordChange = async () => {
  passwordLoading.value = true;
  passwordErrors.value = {};
  try {
    await api.post('/accounts/profile/set_password/', passwordForm.value);
    showSnackbar('رمز عبور با موفقیت تغییر کرد.', 'success');
    // Clear password fields after successful change
    passwordForm.value.old_password = '';
    passwordForm.value.new_password = '';
  } catch (err) {
    if (err.response && err.response.status === 400) {
      passwordErrors.value = err.response.data;
    } else {
      showSnackbar('خطا در تغییر رمز عبور.', 'error');
    }
    console.error(err);
  } finally {
    passwordLoading.value = false;
  }
};

const showSnackbar = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};
</script>