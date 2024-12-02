<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="px-6 py-4">
      <!-- Header Row -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ category.name }}
        </h3>
        <div class="flex space-x-2">
          <button
            @click="$emit('edit', category)"
            class="text-blue-400 hover:text-blue-500 mr-2"
          >
            ✏️
          </button>
          <div class="flex space-x-2">
            <button
              @click="$emit('delete', category.id)"
              class="text-red-400 hover:text-red-500"
            >
              ❌
            </button>
          </div>
        </div>
      </div>

      <!-- Amount Row with Toggle -->
      <div class="flex justify-between items-center">
        <div class="flex-1 flex items-center">
          <div class="flex-shrink-0">
            <span class="text-sm font-medium text-gray-500">Budgeted</span>
            <p class="text-lg font-semibold text-gray-900">
              ${{ category.expected_amount.toFixed(2) }}
            </p>
          </div>
          <div class="w-px h-8 bg-gray-200 mx-4"></div>
          <div class="flex-shrink-0">
            <span class="text-sm font-medium text-gray-500">Spent</span>
            <p class="text-lg font-semibold text-gray-900">
              ${{ category.actual_amount.toFixed(2) }}
            </p>
          </div>
          <div class="w-px h-8 bg-gray-200 mx-4"></div>
          <div class="flex-shrink-0">
            <span class="text-sm font-medium text-gray-500">Remaining</span>
            <p class="text-lg font-semibold"
               :class="{
                 'text-green-600': category.expected_amount - category.actual_amount > 0,
                 'text-red-600': category.expected_amount - category.actual_amount < 0
               }">
              ${{ (category.expected_amount - category.actual_amount).toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Toggle Button -->
        <button
          @click="isExpanded = !isExpanded"
          class="ml-6 flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          View Details
          <svg
            :class="{'rotate-180': isExpanded}"
            class="ml-1 h-5 w-5 transform transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="border-t border-gray-200">
      <div class="px-6 py-4 space-y-4">
        <!-- Add Transaction Form -->
        <form @submit.prevent="handleSubmit" class="mb-6 p-4 bg-gray-200 rounded-lg">
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
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-200">
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
            <tr v-for="item in categoryLineItems" :key="item.id">
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
                  @click="handleDelete(item.id)"
                  class="text-red-600 hover:text-red-900"
                  type="button"
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import api from '@/config/api'

interface LineItem {
  id: number
  description: string
  amount: number
  date: string
  notes: string
}

const props = defineProps<{
  category: {
    id: number
    name: string
    expected_amount: number
    actual_amount: number
  }
}>()
const categoryLineItems = ref<LineItem[]>([])


const emit = defineEmits<{
  (e: 'delete', id: number): void
  (e: 'deleteLineItem', id: number): void
  (e: 'save', data: any): void
  (e: 'edit', category: { id: number; name: string; expected_amount: number }): void
}>()

const formData = ref({
  description: '',
  amount: 0,
  date: dayjs().format('YYYY-MM-DD'),
  notes: ''
})

const isExpanded = ref(false)

watch(isExpanded, async (newValue) => {
  if (newValue) {
    await fetchCategoryLineItems()
  }
})
const fetchCategoryLineItems = async () => {
  if (props.category) {
    try {
      const response = await api.get(`/categories/${props.category.id}/line-items`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      categoryLineItems.value = response.data
    } catch (error) {
      console.error('Error fetching line items:', error)
    }
  }
}

const handleSubmit = async () => {
  try {
    emit('save', {
      ...formData.value,
      category_id: props.category.id
    })

    // Reset form
    formData.value = {
      description: '',
      amount: 0,
      date: dayjs().format('YYYY-MM-DD'),
      notes: ''
    }

    // Wait a moment for the server to process, then fetch latest data
    setTimeout(async () => {
      await fetchCategoryLineItems()
    }, 100)

  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

// Add this function to handle delete
const handleDelete = async (itemId: number) => {
  try {
    emit('deleteLineItem', itemId)
    setTimeout(async () => {
      await fetchCategoryLineItems()
    }, 100)
  } catch (error) {
    console.error('Error deleting line item:', error)
  }
}
</script>
