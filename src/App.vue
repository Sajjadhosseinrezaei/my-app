<template>
  <v-app>
    <BaseHeader/>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
  //
  import BaseHeader from './components/BaseHeader.vue';
</script>
<style>
html, body {
  direction: rtl;
  font-family: 'Tahoma', sans-serif;
}
</style>
