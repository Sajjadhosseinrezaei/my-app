<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-2">
          <v-card-title class="d-flex align-center">
            <v-icon start color="secondary">mdi-format-list-checks</v-icon>
            مدیریت وظایف
            <v-spacer />
            <v-btn color="primary" variant="flat" @click="openNewTaskForm">
              <v-icon start>mdi-plus</v-icon>
              وظیفه جدید
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />
            <v-alert v-if="error" type="error" variant="tonal" dense class="mb-4">{{ error }}</v-alert>
            <v-table v-if="!loading && tasks.length">
              <thead>
                <tr>
                  <th class="text-right">عنوان</th>
                  <th class="text-right">پروژه</th>
                  <th class="text-right">وضعیت</th>
                  <th class="text-right">اولویت</th>
                  <th class="text-center">اقدامات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in tasks" :key="task.id" class="task-row">
                  <td>{{ task.title }}</td>
                  <td>{{ task.project_title }}</td>
                  <td><v-chip :color="getStatusColor(task.status)" variant="elevated" size="small">{{ getStatusLabel(task.status) }}</v-chip></td>
                  <td><v-chip :color="getPriorityColor(task.priority)" variant="elevated" size="small">{{ getPriorityLabel(task.priority) }}</v-chip></td>
                  <td class="text-center">
                    <v-btn icon="mdi-pencil" variant="text" size="small" color="blue" @click="openEditTaskForm(task)" />
                    <v-btn icon="mdi-delete" variant="text" size="small" color="red" @click="openDeleteDialog(task)" />
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-if="!loading && !tasks.length && !error" type="info" variant="outlined">هیچ وظیفه‌ای برای نمایش وجود ندارد.</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showFormDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h6">{{ form.id ? 'ویرایش وظیفه' : 'ایجاد وظیفه جدید' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveTask">
            <v-text-field v-model="form.title" label="عنوان وظیفه" variant="outlined" :error-messages="formErrors.title" class="mb-4" />
            <v-textarea v-model="form.description" label="توضیحات" variant="outlined" :error-messages="formErrors.description" class="mb-4" />
            <v-select v-model="form.project" :items="projects" item-title="title" item-value="id" label="پروژه" variant="outlined" :error-messages="formErrors.project" class="mb-4" />
            <v-menu v-model="showDeadlineMenu" :close-on-content-click="false" transition="scale-transition" offset-y>
              <template v-slot:activator="{ props }">
                <v-text-field :model-value="formattedDeadline" label="مهلت انجام" prepend-inner-icon="mdi-calendar" readonly variant="outlined" v-bind="props" :error-messages="formErrors.deadline" class="mb-4" />
              </template>
              <v-card max-width="400">
                <v-date-picker v-model="pickerDate" show-adjacent-months hide-header></v-date-picker>
                <v-row class="px-4 py-2">
                  <v-col><v-select label="ساعت" :items="hours" v-model="pickerHour"></v-select></v-col>
                  <v-col><v-select label="دقیقه" :items="minutes" v-model="pickerMinute"></v-select></v-col>
                </v-row>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="showDeadlineMenu = false">بستن</v-btn>
                  <v-btn color="primary" @click="setDeadline">تایید</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
            <v-row>
              <v-col cols="6"><v-select v-model="form.status" :items="statusChoices" item-title="title" item-value="value" label="وضعیت" variant="outlined" :error-messages="formErrors.status" /></v-col>
              <v-col cols="6"><v-select v-model="form.priority" :items="priorityChoices" item-title="title" item-value="value" label="اولویت" variant="outlined" :error-messages="formErrors.priority" /></v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeFormDialog">لغو</v-btn>
          <v-btn color="primary" variant="flat" @click="saveTask" :loading="formLoading">ذخیره</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400px">
        <v-card>
            <v-card-title class="text-h6">تایید حذف</v-card-title>
            <v-card-text>آیا از حذف وظیفه "<strong>{{ taskToDelete?.title }}</strong>" اطمینان دارید؟</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="showDeleteDialog = false">خیر</v-btn>
                <v-btn color="red" variant="flat" @click="confirmDelete">بله، حذف کن</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '@/stores/auth';

// --- State های اصلی ---
const tasks = ref([]);
const projects = ref([]);
const loading = ref(true);
const error = ref('');
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const formLoading = ref(false);
const taskToDelete = ref(null);

const initialFormData = {
  id: null,
  title: '',
  description: '',
  project: null,
  status: 'pending',
  priority: 'medium',
  deadline: null,
};
const form = ref({ ...initialFormData });
const formErrors = ref({});

// --- State های جدید برای منوی انتخاب‌گر تاریخ و زمان ---
const showDeadlineMenu = ref(false);
const pickerDate = ref(null);
const pickerHour = ref(null);
const pickerMinute = ref(null);

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

const statusChoices = [
  { title: 'در انتظار', value: 'pending', color: 'grey' },
  { title: 'در حال انجام', value: 'in_progress', color: 'orange' },
  { title: 'تکمیل‌شده', value: 'completed', color: 'green' }
];
const priorityChoices = [
  { title: 'کم', value: 'low', color: 'blue-grey' },
  { title: 'متوسط', value: 'medium', color: 'blue' },
  { title: 'زیاد', value: 'high', color: 'red' }
];

const formattedDeadline = computed(() => {
  if (!form.value.deadline) return '';
  const date = new Date(form.value.deadline);
  return date.toLocaleString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
});

const getStatusLabel = (statusValue) => statusChoices.find(c => c.value === statusValue)?.title || statusValue;
const getStatusColor = (statusValue) => statusChoices.find(c => c.value === statusValue)?.color || 'grey';
const getPriorityLabel = (priorityValue) => priorityChoices.find(c => c.value === priorityValue)?.title || priorityValue;
const getPriorityColor = (priorityValue) => priorityChoices.find(c => c.value === priorityValue)?.color || 'grey';

const fetchTasks = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/task-manager/');
    const tasksList = Array.isArray(res.data) ? res.data : res.data.results;
    tasks.value = tasksList.map(task => ({ ...task, project_title: task.project?.title || 'بدون پروژه' }));
  } catch (err) {
    error.value = 'خطا در دریافت لیست وظایف.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchProjects = async () => {
  try {
    const res = await api.get('/project-manager/');
    projects.value = Array.isArray(res.data) ? res.data : res.data.results;
  } catch (err) {
    console.error('خطا در دریافت لیست پروژه‌ها.', err);
  }
};

const saveTask = async () => {
  formLoading.value = true;
  formErrors.value = {};
  try {
    const payload = { ...form.value };
    if (form.value.id) {
      await api.patch(`/task-manager/${form.value.id}/`, payload);
    } else {
      await api.post('/task-manager/', payload);
    }
    closeFormDialog();
    await fetchTasks();
  } catch (err) {
    if (err.response && err.response.status === 400) {
      formErrors.value = err.response.data;
    } else {
      formErrors.value = { non_field_errors: ['خطایی در ذخیره وظیفه رخ داد.'] };
    }
    console.error(err);
  }
  finally {
    formLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!taskToDelete.value) return;
  try {
    await api.delete(`/task-manager/${taskToDelete.value.id}/`);
    showDeleteDialog.value = false;
    taskToDelete.value = null;
    await fetchTasks();
  } catch (err) {
    error.value = 'خطا در حذف وظیفه.';
    console.error(err);
  }
};

const openNewTaskForm = () => {
  form.value = { ...initialFormData };
  const now = new Date();
  pickerDate.value = now;
  pickerHour.value = now.getHours().toString().padStart(2, '0');
  pickerMinute.value = '00';
  formErrors.value = {};
  showFormDialog.value = true;
};

const openEditTaskForm = (task) => {
  form.value = { ...task, project: task.project?.id || null };
  const d = task.deadline ? new Date(task.deadline) : new Date();
  pickerDate.value = d;
  pickerHour.value = d.getHours().toString().padStart(2, '0');
  pickerMinute.value = d.getMinutes().toString().padStart(2, '0');
  formErrors.value = {};
  showFormDialog.value = true;
};

const openDeleteDialog = (task) => {
  taskToDelete.value = task;
  showDeleteDialog.value = true;
};

const closeFormDialog = () => { showFormDialog.value = false; };

const setDeadline = () => {
    if (!pickerDate.value) return;
    const date = new Date(pickerDate.value);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    form.value.deadline = `${year}-${month}-${day}T${pickerHour.value}:${pickerMinute.value}`;
    showDeadlineMenu.value = false;
};

onMounted(() => {
  fetchProjects();
  fetchTasks();
});
</script>

<style scoped>
.task-row:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}
</style>