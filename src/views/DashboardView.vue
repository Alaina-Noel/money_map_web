<template>
  <div class="min-h-screen bg-gray-100">
    <NavigationBar @logout="handleLogout" />
    <MonthNavigation
      :current-month="currentMonthDisplay"
      @next="nextMonth"
      @previous="previousMonth"
    />

    <IncomeOverview
      :expected-income="expectedIncome"
      :actual-income="actualIncome"
      :total-spent="totalSpent"
      :total-budgeted="totalBudgeted"
      @add-income="showIncomeModal = true"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CategoryGrid>
        <CategoryCard
          v-for="category in categories"
          :key="category.id"
          :category="category"
          @delete="deleteCategory"
          @edit="editCategory"
          @delete-line-item="deleteLineItem"
          @save="saveLineItem"
        />
        <AddCategoryButton @click="handleAddCategory" />
      </CategoryGrid>
    </div>

    <AddIncomeModal
      v-if="showIncomeModal"
      :initial-data="newPaycheck"
      @close="showIncomeModal = false"
      @fetchDashboardData="fetchDashboardData"
    />

    <AddCategoryModal
      v-if="showAddCategoryModal"
      :initial-data="selectedCategory"
      @save="handleCategorySubmit"
      @close="handleCloseModal"
    />

    <LineItemsModal
      v-if="showLineItemsModal"
      :category="selectedCategory"
      :line-items="lineItems"
      @save="saveLineItem"
      @delete="deleteLineItem"
      @close="showLineItemsModal = false"
    />

    <CopyCategoriesModal
      :is-open="showCopyModal"
      :month-display="currentMonthDisplay"
      @copy-previous="copyPreviousMonth"
      @start-fresh="handleStartFresh"
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
import CopyCategoriesModal from '@/components/modals/CopyCategoriesModal.vue'
import { useAuthStore } from '@/stores/auth'

interface Category {
  id: number;
  name: string;
  expected_amount: number;
  actual_amount: number;
}

interface DashboardData {
  current_month: {
    expected_income: number;
    actual_income: number;
    total_budgeted: number;
    total_spent: number;
    remaining_budget: number;
  };
  spending_by_category: Category[];
}

interface Category {
  id: number;
  name: string;
  expected_amount: number;
  actual_amount: number;
}

// State management
const router = useRouter()
const currentMonth = ref(dayjs())
const categories = ref<Category[]>([])
const dashboardData = ref<DashboardData | null>(null);
const showAddCategoryModal = ref(false)
const showIncomeModal = ref(false)
const showLineItemsModal = ref(false)
const selectedCategory = ref<{ id?: number; name: string; expected_amount: number } | null>(null)
const lineItems = ref([])
const newPaycheck = ref({ amount: 0, pay_date: '', source: '', notes: '' })
const showCopyModal = ref(false)

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

const totalBudgeted = computed(() => {
  return dashboardData.value?.current_month?.total_budgeted ?? 0
})

const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

// API methods
const fetchDashboardData = async () => {
  try {
    const response = await api.get(
      `/budgets/${currentMonth.value.format('YYYY-MM')}/dashboard`,
      getAuthHeaders()
    );
    console.log('response.data',response.data)
    dashboardData.value = response.data;
    categories.value = response.data.spending_by_category;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};
const previousMonth = () => {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
  fetchDashboardData()
}

const nextMonth = async () => {
  currentMonth.value = currentMonth.value.add(1, 'month');
  await fetchDashboardData();

  // If no categories exist for this month, show the modal
  if (dashboardData.value?.spending_by_category.length === 0) {
    showCopyModal.value = true;
  }
};

const handleStartFresh = () => {
  showCopyModal.value = false;
};

const deleteLineItem = async (lineItemId: number) => {
  try {
    await api.delete(`/line-items/${lineItemId}`, getAuthHeaders());
    await fetchDashboardData();
    return true;
  } catch (error) {
    console.error('Error deleting line item:', error);
    return false;
  }
};

const viewLineItems = async (category: Category) => {
  selectedCategory.value = category;
  showLineItemsModal.value = true;

  try {
    const response = await api.get(`/categories/${category.id}/line-items`, getAuthHeaders());
    lineItems.value = response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

const fetchLineItems = async (categoryId: number) => {
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

const handleAddCategory = () => {
  selectedCategory.value = {
    name: '',
    expected_amount: 0
  }
  showAddCategoryModal.value = true
}

const editCategory = (category: Category) => {
  selectedCategory.value = {
    id: category.id,
    name: category.name,
    expected_amount: category.expected_amount
  }
  showAddCategoryModal.value = true
}

const handleCategorySubmit = async (categoryData: { id?: number; name: string; expected_amount: number }) => {
  try {
    if (categoryData.id) {
      await api.put(`/categories/${categoryData.id}`, {
        name: categoryData.name,
        expected_amount: categoryData.expected_amount
      }, getAuthHeaders())
    } else {
      const response = await api.post('/categories', {
        name: categoryData.name,
        expected_amount: categoryData.expected_amount,
        budget_month: currentMonth.value.format('YYYY-MM-DD')
      }, getAuthHeaders())

      console.log('Category creation response:', response.data)
    }

    showAddCategoryModal.value = false
    selectedCategory.value = null
    await fetchDashboardData()
  } catch (error: any) {
    console.error('Error saving category:', error.response?.data || error)
  }
}
interface LineItemData {
  description: string;
  amount: number;
  date: string;
  notes?: string;
  category_id?: number;
}
const saveLineItem = async (itemData: LineItemData & { category_id: number }) => {
  try {
    await api.post('/line-items', itemData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    // Fetch updated data
    await fetchDashboardData()
    return Promise.resolve(true)
  } catch (error) {
    console.error('Error saving line item:', error)
    return Promise.resolve(false)
  }
}

const deleteCategory = async (categoryId: number) => {
  try {
    await api.delete(`/categories/${categoryId}`, getAuthHeaders());
    await fetchDashboardData();
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

const handleCloseModal = () => {
  showAddCategoryModal.value = false
  selectedCategory.value = null
}

const copyPreviousMonth = async () => {
  try {
    await api.post(
      `/budgets/${currentMonth.value.format('YYYY-MM')}/copy-previous`,
      {},
      getAuthHeaders()
    );
    await fetchDashboardData();
    showCopyModal.value = false;
  } catch (error) {
    console.error('Error copying categories:', error);
  }
};

const handleLogout = async () => {
  const authStore = useAuthStore()
  await authStore.logout()
  await router.push('/login')
}

onMounted(() => {
  fetchDashboardData()
})
</script>
