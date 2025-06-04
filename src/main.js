import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import router from './router'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { fa } from 'vuetify/locale'

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
      fa: true, // همین خط باعث راست‌چین شدن همه چیز میشه
    },
  },
})

createApp(App).use(router).use(vuetify).mount('#app')
