<template>
  <v-container fluid class="pa-6">
    <v-row>
      <!-- کارت خوش‌آمدگویی -->
      <v-col cols="12">
        <v-card class="pa-6 glass-effect" elevation="4">
          <v-row align="center">
            <v-col cols="12" md="8">
              <v-card-title class="text-h5 font-weight-bold">
                خوش آمدید، {{ userName }}!
              </v-card-title>
              <v-card-subtitle class="text-body-1 mt-2">
                داشبورد مدیریتی شما برای پیگیری تسک‌ها و پروژه‌ها
              </v-card-subtitle>
            </v-col>
            <v-col cols="12" md="4" class="text-end">
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                to="/projects/new"
              >
                پروژه جدید
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- کارت آمار تسک‌ها -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-5" color="blue-lighten-5" elevation="3">
          <v-card-title class="text-h6 text-blue-darken-3 d-flex align-center">
            <v-icon class="me-2" color="blue">mdi-chart-box</v-icon>
            آمار تسک‌ها
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="6">
                <v-sheet class="pa-4 text-center" color="green-lighten-4" rounded="lg">
                  <v-icon size="32" color="green">mdi-check-circle</v-icon>
                  <div class="mt-2 text-caption">تسک‌های انجام شده</div>
                  <div class="text-h5 font-weight-bold">{{ dashboard.completed_tasks }}</div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="pa-4 text-center" color="orange-lighten-4" rounded="lg">
                  <v-icon size="32" color="orange">mdi-progress-clock</v-icon>
                  <div class="mt-2 text-caption">تسک‌های در حال انجام</div>
                  <div class="text-h5 font-weight-bold">{{ dashboard.pending_tasks }}</div>
                </v-sheet>
              </v-col>
            </v-row>
            <!-- نمودار دایره‌ای -->
            <v-sheet class="mt-4" color="transparent">
              <div class="chart-container">
                <chartjs :config="taskChartConfig" />
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- کارت پروژه‌های فعال -->
      <v-col cols="12" md="6" lg="8">
        <v-card class="pa-5" color="purple-lighten-5" elevation="3">
          <v-card-title class="text-h6 text-purple-darken-3 d-flex align-center">
            <v-icon class="me-2" color="purple">mdi-folder</v-icon>
            پروژه‌های فعال
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="projectFilter"
              placeholder="جستجوی پروژه..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              flat
              hide-details
              class="mb-4"
            />
            <v-list v-if="filteredProjects.length > 0" class="pa-0">
              <v-list-item
                v-for="project in filteredProjects"
                :key="project.id"
                class="mb-3 project-item"
                rounded="lg"
                elevation="1"
                @click="viewProject(project.id)"
              >
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">
                    {{ project.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ project.description }}
                  </v-list-item-subtitle>
                  <v-progress-linear
                    :model-value="project.progress"
                    color="primary"
                    height="6"
                    class="mt-2"
                    rounded
                  />
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon small>
                    <v-icon color="primary">mdi-chevron-left</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-alert
              v-else
              type="info"
              variant="outlined"
              text
              class="mt-2"
            >
              پروژه‌ای برای نمایش وجود ندارد.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- کارت فعالیت‌های اخیر -->
      <v-col cols="12">
        <v-card class="pa-5" color="grey-lighten-4" elevation="3">
          <v-card-title class="text-h6 text-grey-darken-3 d-flex align-center">
            <v-icon class="me-2" color="grey-darken-2">mdi-history</v-icon>
            فعالیت‌های اخیر
          </v-card-title>
          <v-card-text>
            <v-timeline dense side="end">
              <v-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :dot-color="activity.color"
                small
              >
                <v-card class="pa-3" elevation="0">
                  <div class="text-body-2">{{ activity.text }}</div>
                  <div class="text-caption text-grey">{{ activity.time }}</div>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import API from '../services/api'

const dashboard = ref({
  completed_tasks: 0,
  pending_tasks: 0,
  projects: [],
})

const userName = ref('کاربر نمونه')
const projectFilter = ref('')
const router = useRouter()

const recentActivities = ref([
  { id: 1, text: 'تسک "طراحی UI" تکمیل شد', time: '۱ ساعت پیش', color: 'green' },
  { id: 2, text: 'پروژه جدید "وب‌سایت فروش" اضافه شد', time: '۲ ساعت پیش', color: 'blue' },
  { id: 3, text: 'کاربر جدید به تیم اضافه شد', time: 'دیروز', color: 'purple' },
])

const filteredProjects = computed(() => {
  if (!projectFilter.value) return dashboard.value.projects
  return dashboard.value.projects.filter(project =>
    project.title.toLowerCase().includes(projectFilter.value.toLowerCase()) ||
    project.description.toLowerCase().includes(projectFilter.value.toLowerCase())
  )
})

const taskChartConfig = computed(() => ({
  type: 'doughnut',
  data: {
    labels: ['تسک‌های انجام شده', 'تسک‌های در حال انجام'],
    datasets: [{
      data: [dashboard.value.completed_tasks, dashboard.value.pending_tasks],
      backgroundColor: ['#4CAF50', '#FF9800'],
      borderWidth: 1,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#424242',
          font: { size: 12 },
        },
      },
    },
  },
}))

const fetchDashboard = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await API.get('/dashboard/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    dashboard.value = response.data
  } catch (error) {
    console.error('خطا در دریافت اطلاعات داشبورد', error)
  }
}

const viewProject = (id) => {
  router.push(`/projects/${id}`)
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.glass-effect {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.project-item {
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 200px;
  position: relative;
}

.v-card {
  border-radius: 12px;
}

.v-btn {
  border-radius: 8px;
}
</style>