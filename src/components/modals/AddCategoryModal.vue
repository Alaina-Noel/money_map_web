<template>
  <Modal @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Budgeted Amount
          </label>
          <input
            v-model.number="formData.expected_amount"
            type="number"
            step="0.01"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
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
            {{ initialData?.id ? 'Update' : 'Create' }} Category
          </button>
        </div>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Modal from './Modal.vue'

interface CategoryData {
  id?: number
  name: string
  expected_amount: number
}

const props = defineProps<{
  initialData?: CategoryData
}>()

const formData = ref<CategoryData>({
  id: props.initialData?.id,
  name: props.initialData?.name ?? '',
  expected_amount: props.initialData?.expected_amount ?? 0
})

const emit = defineEmits<{
  (e: 'save', data: CategoryData): void
  (e: 'close'): void
}>()

const handleSubmit = () => {
  if (formData.value.expected_amount < 0) {
    console.error('Expected amount cannot be negative')
    return
  }

  emit('save', {
    id: formData.value.id,
    name: formData.value.name.trim(),
    expected_amount: formData.value.expected_amount
  })
}

onMounted(() => {
  if (props.initialData) {
    formData.value = { ...props.initialData }
  }
})
</script>
