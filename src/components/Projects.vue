<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg">
          <v-card-title class="d-flex align-center">
            <span>مدیریت پروژه‌ها</span>
            <v-spacer />
            <v-btn color="primary" variant="flat" @click="openNewProjectForm">
              <v-icon start>mdi-plus</v-icon>
              پروژه جدید
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>

            <v-progress-linear
              v-if="loading"
              indeterminate
              color="primary"
              class="mb-3"
            />

            <v-table v-if="!loading && projects.length" class="elevation-1">
              <thead class="bg-grey-lighten-4">
                <tr>
                  <th class="text-right font-weight-bold">عنوان</th>
                  <th class="text-right font-weight-bold">توضیحات</th>
                  <th class="text-center font-weight-bold">اعضا</th>
                  <th class="text-center font-weight-bold">اقدامات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in projects" :key="project.id">
                  <td>{{ project.title }}</td>
                  <td>{{ project.description.slice(0, 50) + '...' }}</td>
                  <td class="text-center">
                    <v-avatar-group>
                      <v-avatar v-for="member in project.members.slice(0, 3)" :key="member.id" size="32">
                        <v-img :src="`https://i.pravatar.cc/40?u=${member.email}`" :alt="member.name">
                           <v-tooltip activator="parent" location="top">{{ member.name }}</v-tooltip>
                        </v-img>
                      </v-avatar>
                      <v-avatar v-if="project.members.length > 3" color="grey-lighten-1" size="32">
                        <span class="text-caption">+{{ project.members.length - 3 }}</span>
                      </v-avatar>
                    </v-avatar-group>
                  </td>
                  <td class="text-center">
                    <v-btn icon="mdi-pencil" variant="text" size="small" color="blue" @click="editProject(project)" />
                    <v-btn icon="mdi-delete" variant="text" size="small" color="red" @click="confirmDelete(project)" />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showFormDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title>{{ form.id ? 'ویرایش پروژه' : 'پروژه جدید' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" label="عنوان پروژه" variant="outlined" required class="mb-4"/>
          <v-textarea v-model="form.description" label="توضیحات" variant="outlined" class="mb-4"/>
          
          <v-select
            v-model="form.members"
            :items="allUsers"
            item-title="name"
            item-value="id"
            label="اعضای پروژه"
            variant="outlined"
            multiple
            chips
            closable-chips
            prepend-inner-icon="mdi-account-multiple-plus"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeForm">لغو</v-btn>
          <v-btn color="primary" @click="saveProject" :loading="saving">ذخیره</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/stores/auth'

const projects = ref([])
const allUsers = ref([]) // <-- برای نگهداری لیست همه کاربران
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const showFormDialog = ref(false)

// تغییر ۳: افزودن members به فرم
const initialFormData = {
  id: null,
  title: '',
  description: '',
  members: [], // <-- اعضا به صورت یک آرایه از ID ها
}
const form = ref({ ...initialFormData })

const fetchProjects = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/project-manager/')
    // فرض می‌شود بک‌اند لیست اعضا را به همراه هر پروژه برمی‌گرداند
    projects.value = Array.isArray(res.data) ? res.data : res.data.results;
  } catch (err) {
    error.value = 'خطا در دریافت پروژه‌ها'
  } finally {
    loading.value = false
  }
}

// تغییر ۴: تابع جدید برای گرفتن لیست کاربران
const fetchUsers = async () => {
    try {
        const res = await api.get('/accounts/manager/'); // آدرس لیست کاربران
        allUsers.value = Array.isArray(res.data) ? res.data : res.data.results;
    } catch (err) {
        error.value = 'خطا در دریافت لیست کاربران برای انتخاب اعضا'
    }
}

const saveProject = async () => {
  saving.value = true
  try {
    // payload اکنون شامل `members` هم هست
    const payload = form.value;
    
    if (payload.id) {
      await api.patch(`/project-manager/${payload.id}/`, payload)
    } else {
      await api.post('/project-manager/', payload)
    }
    closeForm()
    await fetchProjects()
  } catch(err) {
    error.value = 'خطا در ذخیره پروژه'
    console.error(err)
  } finally {
    saving.value = false
  }
}

const editProject = (project) => {
  // تغییر ۵: مقداردهی اولیه اعضا در حالت ویرایش
  form.value = { 
      id: project.id,
      title: project.title,
      description: project.description,
      // map برای استخراج id اعضا از آبجکت‌هایشان
      members: project.members.map(member => member.id)
  }
  showFormDialog.value = true
}

const deleteProject = async (id) => {
  if (confirm('آیا از حذف این پروژه اطمینان دارید؟')) {
    try {
      await api.delete(`/project-manager/${id}/`)
      await fetchProjects()
    } catch {
      error.value = 'خطا در حذف پروژه'
    }
  }
}

const openNewProjectForm = () => {
    form.value = { ...initialFormData };
    showFormDialog.value = true;
}

const closeForm = () => {
    showFormDialog.value = false;
}

onMounted(async () => {
    // هر دو لیست پروژه‌ها و کاربران را در ابتدا فراخوانی می‌کنیم
    await fetchUsers();
    await fetchProjects();
})
</script>