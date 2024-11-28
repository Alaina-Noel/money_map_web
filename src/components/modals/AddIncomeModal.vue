<template>
  <Modal @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900">Add Paycheck</h2>
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
          <label class="block text-sm font-medium text-gray-700">Pay Date</label>
          <input
            v-model="formData.pay_date"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Source (Optional)</label>
          <input
            v-model="formData.source"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            v-model="formData.notes"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'
import dayjs from 'dayjs'

const formData = ref({
  amount: 0,
  pay_date: dayjs().format('YYYY-MM-DD'),
  source: '',
  notes: ''
})

const emit = defineEmits<{
  (e: 'save', data: typeof formData.value): void
  (e: 'close'): void
}>()

const handleSubmit = () => {
  emit('save', formData.value)
}
</script>
