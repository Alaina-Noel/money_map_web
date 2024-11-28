<template>
  <Modal @close="$emit('close')">
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-900">
        {{ category?.name }} - Transactions
      </h2>

      <!-- Add New Transaction Form -->
      <form @submit.prevent="handleSubmit" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <input
              v-model="formData.description"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <input
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <input
              v-model="formData.date"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <input
              v-model="formData.notes"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Add Transaction
          </button>
        </div>
      </form>

      <!-- Transactions List -->
      <div class="mt-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in lineItems" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ dayjs(item.date).format('MMM D, YYYY') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  :class="{'text-red-600': item.amount > 0, 'text-green-600': item.amount < 0}">
                ${{ Math.abs(item.amount).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.notes }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="$emit('delete', item.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'
import dayjs from 'dayjs'

const props = defineProps<{
  category: {
    id: number
    name: string
  }
  lineItems: Array<{
    id: number
    description: string
    amount: number
    date: string
    notes: string
  }>
}>()

const formData = ref({
  description: '',
  amount: 0,
  date: dayjs().format('YYYY-MM-DD'),
  notes: ''
})

const emit = defineEmits<{
  (e: 'save', data: typeof formData.value): void
  (e: 'delete', id: number): void
  (e: 'close'): void
}>()

const handleSubmit = () => {
  emit('save', formData.value)
  // Reset form
  formData.value = {
    description: '',
    amount: 0,
    date: dayjs().format('YYYY-MM-DD'),
    notes: ''
  }
}
</script>
