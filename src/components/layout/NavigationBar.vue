<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="text-xl font-bold text-gray-900">Money Map</div>
        <button
          @click="$emit('logout')"
          class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-900 focus:outline-none"
        >
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'logout'): void
}>()
</script>
