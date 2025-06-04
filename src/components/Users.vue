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
                  <th class="text-right">نام کاربری</th>
                  <th class="text-right">ایمیل</th>
                  <th class="text-right">نقش</th>
                  <th class="text-right">اقدامات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.role || '---' }}</td>
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

    <!-- فرم افزودن / ویرایش کاربر -->
    <v-dialog v-model="showForm" max-width="500px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="text-h6">
          {{ form.id ? 'ویرایش کاربر' : 'افزودن کاربر جدید' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.username"
            label="نام کاربری"
            prepend-inner-icon="mdi-account"
            required
          />
          <v-text-field
            v-model="form.email"
            label="ایمیل"
            prepend-inner-icon="mdi-email"
            required
          />
          <v-text-field
            v-if="!form.id"
            v-model="form.password"
            label="رمز عبور"
            prepend-inner-icon="mdi-lock"
            type="password"
            required
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
import API from '../services/api'

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const showForm = ref(false)

const form = ref({
  id: null,
  username: '',
  email: '',
  password: ''
})

const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await API.get('/accounts/manager/')
    users.value = res.data
  } catch (err) {
    error.value = 'خطا در دریافت کاربران'
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    if (form.value.id) {
      await API.put(`/accounts/manager/${form.value.id}/`, {
        username: form.value.username,
        email: form.value.email,
      })
    } else {
      await API.post('/accounts/manager/', form.value)
    }
    closeForm()
    fetchUsers()
  } catch {
    error.value = 'خطا در ذخیره کاربر'
  } finally {
    saving.value = false
  }
}

const editUser = (user) => {
  form.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: ''
  }
  showForm.value = true
}

const deleteUser = async (id) => {
  if (confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) {
    try {
      await API.delete(`/accounts/manager/${id}/`)
      fetchUsers()
    } catch {
      error.value = 'خطا در حذف کاربر'
    }
  }
}

const closeForm = () => {
  showForm.value = false
  form.value = { id: null, username: '', email: '', password: '' }
}

onMounted(fetchUsers)
</script>
