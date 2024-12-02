<template>
  <div class="bg-white shadow mb-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h2 class="text-xl font-semibold text-gray-900">Income Overview</h2>

      <!-- Income Grid -->
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

      <!-- Monthly Progress Section -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Monthly Progress</h3>
          <div class="text-right text-sm">
            <div class="mb-1">
              <span class="text-gray-500">Budget Planning:</span>
              <span :class="budgetPlanningStatus.color" class="ml-2 font-medium">
                {{ budgetPlanningStatus.message }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">Spending Status:</span>
              <span :class="spendingStatus.color" class="ml-2 font-medium">
                {{ spendingStatus.message }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stacked Progress Bars -->
        <!-- Original Progress Bars section -->
        <div class="mt-6 grid grid-cols-3 gap-6">
          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>Month Progress</span>
              <span>{{ formatPercent(monthProgress) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full"
                :style="{ width: `${monthProgress}%` }"
              ></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>Budget Allocated</span>
              <span>{{ formatPercent(budgetAllocationPercent) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                :class="budgetAllocationPercent > 100 ? 'bg-yellow-500' : 'bg-green-500'"
                class="h-2 rounded-full"
                :style="{ width: `${Math.min(budgetAllocationPercent, 100)}%` }"
              ></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>Budget Spent</span>
              <span>{{ formatPercent(spentPercent) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="bg-purple-500 h-2 rounded-full"
                :style="{ width: `${spentPercent}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  expectedIncome: number
  actualIncome: number
  totalSpent: number
  totalBudgeted: number
  currentMonthDisplay: string
}>()

defineEmits<{
  (e: 'add-income'): void
}>()

const formatAmount = (amount: number | undefined | null): string => {
  return typeof amount === 'number' ? amount.toFixed(2) : '0.00'
}

const formatPercent = (value: number): string => {
  return value.toFixed(1)
}

const budgetAllocationPercent = computed(() => {
  if (props.actualIncome === 0) return 0
  return (props.totalBudgeted / props.actualIncome) * 100
})

const spentPercent = computed(() => {
  if (props.totalBudgeted === 0) return 0
  return (props.totalSpent / props.totalBudgeted) * 100
})

const remainingToSpend = computed(() => {
  return props.totalBudgeted - props.totalSpent
})

const budgetPlanningStatus = computed(() => {
  const diff = props.actualIncome - props.totalBudgeted
  if (Math.abs(diff) < 0.01) return {
    message: 'Budget Balanced',
    color: 'text-green-600'
  }
  if (diff > 0) return {
    message: `${formatAmount(diff)} Unallocated`,
    color: 'text-yellow-600'
  }
  return {
    message: `${formatAmount(Math.abs(diff))} Overallocated`,
    color: 'text-red-600'
  }
})

const monthProgress = computed(() => {
  const now = dayjs()
  const daysInMonth = now.daysInMonth()
  const currentDay = now.date()
  return (currentDay / daysInMonth) * 100
})

const spendingStatus = computed(() => {
  if (props.totalSpent === 0) return {
    message: 'No Spending Yet',
    color: 'text-gray-600'
  }
  const diff = props.totalBudgeted - props.totalSpent
  if (diff > 0) return {
    message: `Under Budget`,
    color: 'text-green-600'
  }
  if (diff < 0) return {
    message: `Over Budget`,
    color: 'text-red-600'
  }
  return {
    message: 'On Budget',
    color: 'text-green-600'
  }
})

const getRemainingColor = (budgeted: number, remaining: number) => {
  if (remaining < 0) return 'text-red-600'
  if (remaining < (budgeted * 0.1)) return 'text-amber-600' // More readable than yellow
  return 'text-green-600'
}
</script>
