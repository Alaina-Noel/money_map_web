<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">
          {{ category.name }}
        </h3>
        <div class="flex space-x-2">
          <button
            @click="$emit('edit', category)"
            class="text-gray-400 hover:text-gray-500"
          >
            ✏️
          </button>
          <button
            @click="$emit('delete', category.id)"
            class="text-red-400 hover:text-red-500"
          >
            ❌
          </button>
        </div>
      </div>
      <dl class="mt-2 divide-y divide-gray-200">
        <div class="py-2">
          <dt class="text-sm font-medium text-gray-500">Budgeted</dt>
          <dd class="mt-1 text-xl font-semibold text-gray-900">
            ${{ category.expected_amount.toFixed(2) }}
          </dd>
        </div>
        <div class="py-2">
          <dt class="text-sm font-medium text-gray-500">Spent</dt>
          <dd class="mt-1 text-xl font-semibold text-gray-900">
            ${{ category.actual_amount.toFixed(2) }}
          </dd>
        </div>
        <div class="py-2">
          <dt class="text-sm font-medium text-gray-500">Remaining</dt>
          <dd class="mt-1 text-xl font-semibold"
              :class="{
                'text-green-600': category.expected_amount - category.actual_amount > 0,
                'text-red-600': category.expected_amount - category.actual_amount < 0
              }">
            ${{ (category.expected_amount - category.actual_amount).toFixed(2) }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  category: {
    id: number
    name: string
    expected_amount: number
    actual_amount: number
  }
}>()

defineEmits<{
  (e: 'edit', category: any): void
  (e: 'delete', id: number): void
}>()
</script>
