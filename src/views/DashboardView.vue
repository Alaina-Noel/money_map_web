<template>
  <div class="min-h-screen bg-gray-100">
    <NavigationBar @logout="handleLogout" />
    <MonthNavigation
      :current-month="currentMonthDisplay"
      @next="nextMonth"
    />

    <IncomeOverview
      :expected-income="expectedIncome"
      :actual-income="actualIncome"
      :total-spent="totalSpent"
      @add-income="showIncomeModal = true"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CategoryGrid>
        <CategoryCard
          v-for="category in categories"
          :key="category.id"
          :category="category"
          @edit="editCategory"
          @delete="deleteCategory"
        />
        <AddCategoryButton @click="showAddCategoryModal = true" />
      </CategoryGrid>
    </div>

    <AddIncomeModal
      v-if="showIncomeModal"
      :initial-data="newPaycheck"
      @save="savePaycheck"
      @close="showIncomeModal = false"
    />

    <AddCategoryModal
      v-if="showAddCategoryModal"
      :initial-data="newCategory"
      @save="saveCategory"
      @close="showAddCategoryModal = false"
    />

    <LineItemsModal
      v-if="showLineItemsModal"
      :category="selectedCategory"
      :line-items="lineItems"
      @save="saveLineItem"
      @delete="deleteLineItem"
      @close="showLineItemsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import api from '@/config/api'

// Import components
import NavigationBar from '@/components/layout/NavigationBar.vue'
import MonthNavigation from '@/components/layout/MonthNavigation.vue'
import IncomeOverview from '@/components/dashboard/IncomeOverview.vue'
import CategoryGrid from '@/components/dashboard/CategoryGrid.vue'
import CategoryCard from '@/components/dashboard/CategoryCard.vue'
import AddCategoryButton from '@/components/dashboard/AddCategoryButton.vue'
import AddIncomeModal from '@/components/modals/AddIncomeModal.vue'
import AddCategoryModal from '@/components/modals/AddCategoryModal.vue'
import LineItemsModal from '@/components/modals/LineItemsModal.vue'
import { useAuthStore } from '@/stores/auth'

// Remove duplicate state declarations
// Keep only one instance of each ref/computed

// State management
const router = useRouter()
const currentMonth = ref(dayjs())
const categories = ref([])
const dashboardData = ref(null)
const showAddCategoryModal = ref(false)
const showIncomeModal = ref(false)
const showLineItemsModal = ref(false)
const selectedCategory = ref(null)
const lineItems = ref([])
const newCategory = ref({ name: '', expected_amount: 0 })
const newPaycheck = ref({ amount: 0, pay_date: '', source: '', notes: '' })

const currentMonthDisplay = computed(() => currentMonth.value.format('MMMM YYYY'))

const expectedIncome = computed(() => {
  return dashboardData.value?.current_month?.expected_income ?? 0
})

const actualIncome = computed(() => {
  return dashboardData.value?.current_month?.actual_income ?? 0
})

const totalSpent = computed(() => {
  return dashboardData.value?.current_month?.total_spent ?? 0
})

const newLineItem = ref({
  description: '',
  amount: 0,
  date: dayjs().format('YYYY-MM-DD'),
  notes: ''
})

const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

// API methods
const fetchDashboardData = async () => {
  try {
    console.log('fetching data')
    const response = await api.get(
      `/budgets/${currentMonth.value.format('YYYY-MM')}/dashboard`,
      getAuthHeaders()
    );
    console.log('response',response)
    console.log('response.data',response.data)
    dashboardData.value = response.data;
    console.log('response.data.spending_by_category',response.data.spending_by_category)
    categories.value = response.data.spending_by_category;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

const savePaycheck = async () => {
  try {
    await api.post('/paychecks', {
      ...newPaycheck.value,
      pay_date: dayjs(newPaycheck.value.pay_date).format('YYYY-MM-DD')
    })

    showIncomeModal.value = false
    newPaycheck.value = { amount: 0, pay_date: '', source: '', notes: '' }
    await fetchDashboardData()
  } catch (error) {
    console.error('Error saving paycheck:', error)
  }
}

const nextMonth = () => {
  currentMonth.value = currentMonth.value.add(1, 'month')
  fetchDashboardData()
}

const deleteLineItem = async (lineItemId) => {
  try {
    await api.delete(`/line-items/${lineItemId}`)
    await fetchLineItems(selectedCategory.value.id)
    await fetchDashboardData() // Refresh category totals
  } catch (error) {
    console.error('Error deleting line item:', error)
  }
}

const viewLineItems = async (category) => {
  selectedCategory.value = category
  showLineItemsModal.value = true
  await fetchLineItems(category.id)
}

const fetchLineItems = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}/line-items`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    lineItems.value = response.data
  } catch (error) {
    console.error('Error fetching line items:', error)
  }
}

const saveCategory = async (categoryData) => {
  try {
    await api.post('/categories', {
      ...categoryData,
      budget_month: currentMonth.value.format('YYYY-MM-DD')
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    showAddCategoryModal.value = false
    newCategory.value = { name: '', expected_amount: 0 }
    await fetchDashboardData()
  } catch (error) {
    console.error('Error saving category:', error)
  }
}

// Update saveLineItem to include proper headers
const saveLineItem = async (itemData) => {
  try {
    await api.post('/line-items', {
      ...itemData,
      category_id: selectedCategory.value.id
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    await fetchLineItems(selectedCategory.value.id)
    await fetchDashboardData()
  } catch (error) {
    console.error('Error saving line item:', error)
  }
}

// Add a click handler to view transactions
const editCategory = (category) => {
  viewLineItems(category)
}

const handleLogout = async () => {
  const authStore = useAuthStore()
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchDashboardData()
})
</script>
