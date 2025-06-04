<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            مدیریت کاربران
            <v-spacer />
            <v-btn color="primary" @click="showForm = true">
              کاربر جدید
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>

            <v-progress-linear
              v-if="loading"
              indeterminate
              color="primary"
              class="mb-3"
            />

            <v-table v-if="!loading && users.length">
              <thead>
                <tr>
                  <th>نام کاربری</th>
                  <th>ایمیل</th>
                  <th>نقش</th>
                  <th>اقدامات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.role || '---' }}</td>
                  <td>
                    <v-btn icon color="blue" @click="editUser(user)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="red" @click="deleteUser(user.id)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Form Dialog -->
    <v-dialog v-model="showForm" max-width="500px">
      <v-card>
        <v-card-title>{{ form.id ? 'ویرایش کاربر' : 'کاربر جدید' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.username" label="نام کاربری" required />
          <v-text-field v-model="form.email" label="ایمیل" required />
          <v-text-field
            v-if="!form.id"
            v-model="form.password"
            label="رمز عبور"
            type="password"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showForm = false">لغو</v-btn>
          <v-btn color="primary" @click="saveUser">ذخیره</v-btn>
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
  try {
    if (form.value.id) {
      await API.put(`/accounts/manager/${form.value.id}/`, {
        username: form.value.username,
        email: form.value.email,
      })
    } else {
      await API.post('/accounts/manager/', form.value)
    }
    showForm.value = false
    form.value = { id: null, username: '', email: '', password: '' }
    fetchUsers()
  } catch {
    error.value = 'خطا در ذخیره کاربر'
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
  if (confirm('آیا مطمئنی می‌خواهی کاربر را حذف کنی؟')) {
    try {
      await API.delete(`/accounts/manager/${id}/`)
      fetchUsers()
    } catch {
      error.value = 'خطا در حذف کاربر'
    }
  }
}

onMounted(fetchUsers)
</script>
