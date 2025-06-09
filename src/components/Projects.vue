<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            مدیریت پروژه‌ها
            <v-spacer />
            <v-btn color="primary" @click="showForm = true">
              پروژه جدید
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

            <v-table v-if="!loading && projects.length">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>توضیحات</th>
                  <th>اقدامات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in projects" :key="project.id">
                  <td>{{ project.title }}</td>
                  <td>{{ project.description }}</td>
                  <td>
                    <v-btn icon color="blue" @click="editProject(project)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="red" @click="deleteProject(project.id)">
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
        <v-card-title>{{ form.id ? 'ویرایش پروژه' : 'پروژه جدید' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" label="عنوان پروژه" required />
          <v-textarea v-model="form.description" label="توضیحات" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showForm = false">لغو</v-btn>
          <v-btn color="primary" @click="saveProject">ذخیره</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/stores/auth'

const projects = ref([])
const loading = ref(false)
const error = ref('')
const showForm = ref(false)
const form = ref({
  id: null,
  title: '',
  description: ''
})

const fetchProjects = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/project-manager/')
    projects.value = res.data
  } catch (err) {
    error.value = 'خطا در دریافت پروژه‌ها'
  } finally {
    loading.value = false
  }
}

const saveProject = async () => {
  try {
    if (form.value.id) {
      await api.put(`/project-manager/${form.value.id}/`, form.value)
    } else {
      await api.post('/project-manager/', form.value)
    }
    showForm.value = false
    form.value = { id: null, title: '', description: '' }
    fetchProjects()
  } catch {
    error.value = 'خطا در ذخیره پروژه'
  }
}

const editProject = (project) => {
  form.value = { ...project }
  showForm.value = true
}

const deleteProject = async (id) => {
  if (confirm('آیا مطمئنی که می‌خواهی حذف کنی؟')) {
    try {
      await api.delete(`/project-manager/${id}/`)
      fetchProjects()
    } catch {
      error.value = 'خطا در حذف پروژه'
    }
  }
}

onMounted(fetchProjects)
</script>
