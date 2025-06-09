<template>
  <v-container fluid class="pa-0">
    <!-- نوار بالا -->
    <v-app-bar color="primary" dark>
      <v-toolbar-title>مدیریت پروژه من</v-toolbar-title>
      <v-spacer />
      <v-btn text to="/login">ورود</v-btn>
      <v-btn text to="/register">ثبت‌نام</v-btn>
    </v-app-bar>

    <!-- بخش معرفی -->
    <v-sheet class="hero-section" height="400">
      <v-container class="fill-height d-flex align-center justify-center text-center text-white">
        <div>
          <h1 class="display-1 font-weight-bold">به پلتفرم مدیریت پروژه خوش آمدید</h1>
          <p class="text-h6 mt-4">با ما، پروژه‌های خود را هوشمندانه مدیریت کنید</p>
          <v-btn color="secondary" size="large" class="mt-6" to="/dashboard">شروع کنید</v-btn>
        </div>
      </v-container>
    </v-sheet>

    <!-- ویژگی‌ها -->
    <v-container class="py-12">
      <v-row justify="center" align="center">
        <v-col cols="12" md="4" class="text-center">
          <v-icon size="48" color="primary">mdi-calendar-check</v-icon>
          <h3 class="text-h6 font-weight-bold mt-3">مدیریت تسک‌ها</h3>
          <p class="mt-2">ایجاد، پیگیری و بستن تسک‌ها با رابط کاربری ساده و روان</p>
        </v-col>
        <v-col cols="12" md="4" class="text-center">
          <v-icon size="48" color="primary">mdi-account-group</v-icon>
          <h3 class="text-h6 font-weight-bold mt-3">همکاری تیمی</h3>
          <p class="mt-2">سازمان‌دهی تیم، تعیین نقش‌ها و افزایش بهره‌وری پروژه</p>
        </v-col>
        <v-col cols="12" md="4" class="text-center">
          <v-icon size="48" color="primary">mdi-chart-line</v-icon>
          <h3 class="text-h6 font-weight-bold mt-3">تحلیل پیشرفت</h3>
          <p class="mt-2">نمایش نموداری پیشرفت پروژه برای تصمیم‌گیری بهتر</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- بخش پروژه‌ها -->
    <v-container class="py-8">
      <h2 class="text-h5 font-weight-bold mb-6 text-center">نمونه پروژه‌ها</h2>
      <v-row>
        <v-col cols="12" md="4" v-for="n in 3" :key="n">
          <v-card elevation="2">
            <v-img src="https://via.placeholder.com/400x200" height="200px" />
            <v-card-title>پروژه شماره {{ n }}</v-card-title>
            <v-card-subtitle>توضیح کوتاه درباره این پروژه برای آشنایی بیشتر</v-card-subtitle>
            <v-card-actions>
              <v-btn text color="primary">مشاهده</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- نظرات کاربران -->
    <v-container class="py-10">
      <h2 class="text-h6 font-weight-bold mb-6 text-center">نظر کاربران ما</h2>
      <v-row>
        <v-col cols="12" md="6" v-for="i in 2" :key="i">
          <v-card class="pa-4 mb-4" outlined>
            <v-avatar size="48" class="mb-2">
              <v-img :src="`https://i.pravatar.cc/150?img=${i}`"></v-img>
            </v-avatar>
            <p class="font-italic">این پلتفرم به من کمک کرد تا پروژه‌هایم را دقیق‌تر و سریع‌تر مدیریت کنم.</p>
            <strong class="mt-2 d-block">کاربر شماره {{ i }}</strong>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- پاورقی -->
    <v-footer color="grey-lighten-4" class="pa-6 text-center">
      <v-container>
        <p class="text-body-2">© 2025 تمامی حقوق محفوظ است | طراحی‌شده با ❤️ توسط تیم شما</p>
      </v-container>
    </v-footer>
  </v-container>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(to left, #1e88e5, #42a5f5);
  color: white;
}
</style>
