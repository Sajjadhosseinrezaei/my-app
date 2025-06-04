// plugins/vuetify.js

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { fa } from 'vuetify/locale'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides

export default createVuetify({
  locale: {
    locale: 'fa',
    messages: { fa },
    rtl: {
      fa: true, // این خط باعث راست‌چین شدن کامل میشه
    },
  },
  defaults: {
    global: {
      ripple: true,
    },
  },
})
