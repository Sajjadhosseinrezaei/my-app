<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <v-card elevation="3" class="rounded-lg">
          <v-card-title class="bg-primary text-white d-flex justify-space-between">
            <span>مدیریت کاربران</span>
            <v-btn color="white" variant="outlined" @click="showForm = true" prepend-icon="mdi-account-plus">
              کاربر جدید
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>

            <v-progress-linear
              v-if="loading"
              indeterminate
              color="primary"
              class="mb-4"
            />

            <v-table v-if="!loading && users.length" class="elevation-1 rounded-lg">
              <thead class="bg-grey-lighten-3">
                <tr>
                  <th class="text-right">نام</th>
                  <th class="text-right">ایمیل</th>
                  <th class="text-right">نقش</th>
                  <th class="text-right">اقدامات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.is_staff ? 'ادمین' : 'کاربر' }}</td>
                  <td>
                    <v-btn icon variant="text" color="blue-darken-2" @click="editUser(user)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon variant="text" color="red-darken-2" @click="deleteUser(user.id)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-alert v-else type="info" class="mt-4">کاربری یافت نشد.</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showForm" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="text-h6">
          {{ form.id ? 'ویرایش کاربر' : 'افزودن کاربر جدید' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="نام"
            prepend-inner-icon="mdi-account"
            required
            class="mb-2"
          />
          <v-text-field
            v-model="form.email"
            label="ایمیل"
            prepend-inner-icon="mdi-email"
            required
            class="mb-2"
          />
          <v-text-field
            v-model="form.password"
            :label="form.id ? 'رمز عبور جدید' : 'رمز عبور'"
            prepend-inner-icon="mdi-lock"
            type="password"
            :required="!form.id"
            :hint="form.id ? 'برای عدم تغییر، خالی بگذارید' : ''"
            persistent-hint
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="closeForm">لغو</v-btn>
          <v-btn color="primary" @click="saveUser" :loading="saving">
            ذخیره
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/stores/auth'

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const showForm = ref(false)

const form = ref({
  id: null,
  name: '', // اصلاح شده از username
  email: '',
  password: ''
})

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/accounts/manager/')
    users.value = res.data
  } catch (err) {
    error.value = 'خطا در دریافت کاربران'
    console.error(err);
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    // تغییر ۲: منطق ذخیره کاربر ویرایش شده
    if (form.value.id) {
      // ساخت یک payload برای ارسال فقط فیلدهای مورد نیاز
      const payload = {
        name: form.value.name,
        email: form.value.email,
      };
      // اگر فیلد پسورد پر شده بود، آن را هم به payload اضافه کن
      if (form.value.password) {
        payload.password = form.value.password;
      }
      // استفاده از متد PATCH که برای آپدیت‌های جزیی مناسب‌تر است
      await api.patch(`/accounts/manager/${form.value.id}/`, payload)
    } else {
      // این بخش برای ساخت کاربر جدید بدون تغییر باقی می‌ماند
      await api.post('/accounts/manager/', form.value)
    }
    closeForm()
    await fetchUsers()
  } catch(err) {
    error.value = 'خطا در ذخیره کاربر'
    console.error(err);
  } finally {
    saving.value = false
  }
}

const editUser = (user) => {
  form.value = {
    id: user.id,
    name: user.name, // اصلاح شده از username
    email: user.email,
    password: ''
  }
  showForm.value = true
}

const deleteUser = async (id) => {
  // بهتر است از یک کتابخانه برای نمایش دیالوگ تایید استفاده کنید
  if (confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) {
    try {
      await api.delete(`/accounts/manager/${id}/`)
      await fetchUsers()
    } catch {
      error.value = 'خطا در حذف کاربر'
    }
  }
}

const closeForm = () => {
  showForm.value = false
  form.value = { id: null, name: '', email: '', password: '' }
}

onMounted(fetchUsers)
</script>