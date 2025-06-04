<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-card color="success" dark>
          <v-card-title>تسک‌های انجام شده</v-card-title>
          <v-card-text class="text-h4">{{ data.completed_tasks }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="warning" dark>
          <v-card-title>تسک‌های در حال انجام</v-card-title>
          <v-card-text class="text-h4">{{ data.pending_tasks }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" v-if="data.projects && data.projects.length">
        <v-card color="primary" dark>
          <v-card-title>تعداد پروژه‌ها</v-card-title>
          <v-card-text class="text-h4">{{ data.projects.length }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="data.projects && data.projects.length">
      <v-col cols="12" md="6" v-for="project in data.projects" :key="project.id">
        <v-card>
          <v-card-title>{{ project.title }}</v-card-title>
          <v-card-subtitle class="text-caption">شناسه: {{ project.id }}</v-card-subtitle>
          <v-card-text>
            {{ project.description }}
            <br />
            اعضا: {{ project.members.join(', ') }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-else
      type="info"
      class="mt-5"
      title="نیاز به ورود"
      text="برای مشاهده پروژه‌های خود لطفاً وارد شوید."
    />
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import API from '../services/api'

const data = ref({
  completed_tasks: 0,
  pending_tasks: 0,
  projects: null
})

const fetchDashboard = async () => {
  try {
    const res = await API.get('/dashboard')
    data.value = res.data
  } catch (err) {
    console.error('خطا در دریافت داده‌های داشبورد', err)
  }
}

onMounted(fetchDashboard)
</script>
