// src/main.js - روش صحیح

// ۱. وارد کردن ماژول‌های اصلی
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// ۲. وارد کردن و تنظیم Vuetify
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { fa } from 'vuetify/locale'

// ۳. ساختن نمونه‌های Vue و پلاگین‌ها
const app = createApp(App)
const pinia = createPinia()
const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  locale: {
    locale: 'fa',
    messages: { fa },
    rtl: {
      fa: true,
    },
  },
})

// ۴. نصب پلاگین‌ها (با ترتیب درست)
//    اول Pinia، چون router در Navigation Guard به آن نیاز دارد.
app.use(pinia)
//    سپس router.
app.use(router)
//    سپس Vuetify.
app.use(vuetify)

// ۵. مانت کردن اپلیکیشن (مرحله نهایی)
app.mount('#app')