<template>
  <div class="dashboard">
    <h1>Dashboard Page</h1>
    <button
      @click="handleLogout"
      class="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
    >
      Logout
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
