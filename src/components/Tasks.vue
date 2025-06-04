<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            مدیریت وظایف
            <v-spacer />
            <v-btn color="primary" @click="showForm = true">
              وظیفه جدید
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

            <v-table v-if="!loading && tasks.length">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>پروژه</th>
                  <th>وضعیت</th>
                  <th>اقدامات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in tasks" :key="task.id">
                  <td>{{ task.title }}</td>
                  <td>{{ task.project_title }}</td>
                  <td>{{ task.status }}</td>
                  <td>
                    <v-btn icon color="blue" @click="editTask(task)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="red" @click="deleteTask(task.id)">
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
    <v-dialog v-model="showForm" max-width="600px">
      <v-card>
        <v-card-title>{{ form.id ? 'ویرایش وظیفه' : 'وظیفه جدید' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" label="عنوان وظیفه" required />
          <v-select
            v-model="form.project"
            :items="projects"
            item-title="title"
            item-value="id"
            label="پروژه"
            required
          />
          <v-select
            v-model="form.status"
            :items="['To Do', 'In Progress', 'Done']"
            label="وضعیت"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showForm = false">لغو</v-btn>
          <v-btn color="primary" @click="saveTask">ذخیره</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import API from '../services/api'

const tasks = ref([])
const projects = ref([])
const loading = ref(false)
const error = ref('')
const showForm = ref(false)

const form = ref({
  id: null,
  title: '',
  project: null,
  status: 'To Do',
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await API.get('/task-manager/')
    tasks.value = res.data.map(task => ({
      ...task,
      project_title: task.project?.title || '---',
    }))
  } catch {
    error.value = 'خطا در دریافت وظایف'
  } finally {
    loading.value = false
  }
}

const fetchProjects = async () => {
  try {
    const res = await API.get('/project-manager/')
    projects.value = res.data
  } catch {
    error.value = 'خطا در دریافت پروژه‌ها'
  }
}

const saveTask = async () => {
  try {
    if (form.value.id) {
      await API.put(`/task-manager/${form.value.id}/`, form.value)
    } else {
      await API.post('/task-manager/', form.value)
    }
    showForm.value = false
    form.value = { id: null, title: '', project: null, status: 'To Do' }
    fetchTasks()
  } catch {
    error.value = 'خطا در ذخیره وظیفه'
  }
}

const editTask = (task) => {
  form.value = {
    id: task.id,
    title: task.title,
    project: task.project,
    status: task.status,
  }
  showForm.value = true
}

const deleteTask = async (id) => {
  if (confirm('آیا از حذف وظیفه مطمئنی؟')) {
    try {
      await API.delete(`/task-manager/${id}/`)
      fetchTasks()
    } catch {
      error.value = 'خطا در حذف وظیفه'
    }
  }
}

onMounted(() => {
  fetchProjects()
  fetchTasks()
})
</script>
