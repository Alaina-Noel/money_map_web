<template>
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <button
          class="text-gray-500 hover:text-gray-700"
          @click="$emit('previous')"
          :disabled="isFirstMonth"
        >
          <span class="text-xl">←</span>
        </button>

        <h2 class="text-2xl font-semibold text-gray-900">
          {{ currentMonth }}
        </h2>

        <button
          class="text-gray-500 hover:text-gray-700"
          @click="$emit('next')"
        >
          <span class="text-xl">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  currentMonth: string
}>()

const isFirstMonth = computed(() => {
  const current = dayjs(props.currentMonth, 'MMMM YYYY')
  const now = dayjs()
  return current.isSame(now, 'month')
})

defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
}>()
</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
