<template>
  <div class="bg-white shadow mb-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h2 class="text-xl font-semibold text-gray-900">Income Overview</h2>
      <div class="grid grid-cols-2 gap-6 sm:grid-cols-4 mt-4">
        <div class="bg-gray-50 p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-700">Expected Income</h3>
          <p class="text-2xl font-bold text-gray-900">
            ${{ formatAmount(expectedIncome) }}
          </p>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-700">Actual Income</h3>
          <p class="text-2xl font-bold text-gray-900">
            ${{ formatAmount(actualIncome) }}
          </p>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-700">Total Spent</h3>
          <p class="text-2xl font-bold text-gray-900">
            ${{ formatAmount(totalSpent) }}
          </p>
        </div>

        <button
          @click="$emit('add-income')"
          class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg
            class="mx-auto h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="mt-2 block text-sm font-medium text-gray-900">
            Add Paycheck
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  expectedIncome: number
  actualIncome: number
  totalSpent: number
}>()

defineEmits<{
  (e: 'add-income'): void
}>()

const formatAmount = (amount: number | undefined | null): string => {
  return typeof amount === 'number' ? amount.toFixed(2) : '0.00'
}
</script>
