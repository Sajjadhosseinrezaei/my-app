<template>
  <v-container fluid class="pa-6">
    <v-row>
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
                  <div class="mt-2 text-body-2">تسک‌های انجام شده</div>
                  <div class="text-h5 font-weight-bold">{{ dashboardData.completed_tasks }}</div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="pa-4 text-center" color="orange-lighten-4" rounded="lg">
                  <v-icon size="32" color="orange">mdi-progress-clock</v-icon>
                  <div class="mt-2 text-body-2">تسک‌های در حال انجام</div>
                  <div class="text-h5 font-weight-bold">{{ dashboardData.pending_tasks }}</div>
                </v-sheet>
              </v-col>
            </v-row>
            <v-sheet class="mt-4 chart-container" color="transparent">
              </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>

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
            <v-list v-if="filteredProjects.length > 0" class="pa-0 bg-transparent">
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
                  <v-list-item-subtitle class="text-body-2">
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
                  <v-btn icon small variant="text">
                    <v-icon color="primary">mdi-chevron-left</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="outlined" text class="mt-2">
              پروژه‌ای برای نمایش وجود ندارد.
              <v-btn to="/projects/new" variant="text" color="primary">افزودن پروژه جدید</v-btn>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="pa-5" color="grey-lighten-4" elevation="3">
          <v-card-title class="text-h6 text-grey-darken-3 d-flex align-center">
            <v-icon class="me-2" color="grey-darken-2">mdi-history</v-icon>
            فعالیت‌های اخیر
          </v-card-title>
          <v-card-text>
            <v-timeline dense side="end" truncate-line="both">
              <v-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :dot-color="activity.color || 'grey'"
                size="small"
              >
                <v-card class="pa-3" elevation="0" color="transparent">
                  <div class="text-body-2">{{ activity.text }}</div>
                  <div class="text-caption text-grey">{{ activity.time }}</div>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="loading" persistent width="auto">
      <v-card class="pa-4 text-center" rounded="lg">
        <v-progress-circular indeterminate color="primary" class="mb-3" />
        <div>در حال بارگذاری اطلاعات...</div>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/stores/auth' 

const router = useRouter()
const authStore = useAuthStore() 

const userName = computed(() => authStore.user?.username || 'کاربر')
const projectFilter = ref('')
const loading = ref(true)

// این ref برای نگهداری تمام داده‌های دریافتی از اندپوینت داشبورد است
const dashboardData = ref({
  completed_tasks: 0,
  pending_tasks: 0,
  projects: [],
  recent_activities: [], // اگر از API نیامد، خالی می‌ماند
})

// این computed property ها بدون تغییر باقی می‌مانند چون به dashboardData وابسته هستند
const filteredProjects = computed(() => {
  return (dashboardData.value.projects || []).filter(project => {
    const title = project.title?.toLowerCase() || ''
    const desc = project.description?.toLowerCase() || ''
    const search = projectFilter.value.toLowerCase()
    return title.includes(search) || desc.includes(search)
  })
})

const recentActivities = computed(() => dashboardData.value.recent_activities)

// --- تابع اصلی که ساده‌سازی و اصلاح شده است ---
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // ۱. فقط یک درخواست به اندپوینت اصلی داشبورد ارسال می‌شود
    const response = await api.get('/dashboard/');
    
    // ۲. داده‌های دریافت شده مستقیماً در state قرار می‌گیرند
    //    استفاده از || [] و || 0 باعث می‌شود اگر کلیدی در پاسخ نبود، برنامه خطا ندهد
    dashboardData.value = {
      completed_tasks: response.data.completed_tasks || 0,
      pending_tasks: response.data.pending_tasks || 0,
      projects: response.data.projects || [],
      recent_activities: response.data.recent_activities || [] 
    };

  } catch (error) {
    console.error('خطا در دریافت اطلاعات داشبورد:', error)
  } finally {
    loading.value = false
  }
}

const viewProject = (id) => {
  router.push(`/project-manager/${id}`)
}

onMounted(fetchDashboardData)
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