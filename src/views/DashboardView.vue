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
      @close="showIncomeModal = false"
      @fetchDashboardData="fetchDashboardData"
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
const selectedCategory = ref<Category | null>(null);
const lineItems = ref([])
const newCategory = ref({ name: '', expected_amount: 0 })
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
    await api.delete(`/line-items/${lineItemId}`);

    if (selectedCategory.value) {
      await fetchLineItems(selectedCategory.value.id);
      await fetchDashboardData();
    }
  } catch (error) {
    console.error('Error deleting line item:', error);
  }
};

const viewLineItems = async (category: Category) => {
  selectedCategory.value = category
  showLineItemsModal.value = true
  await fetchLineItems(category.id)
}

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

interface NewCategory {
  name: string;
  expected_amount: number;
  budget_month?: string;
}

const saveCategory = async (categoryData: NewCategory) => {
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
interface LineItemData {
  name: string;
  amount: number;
  due_date?: string;
  notes?: string;
}
// Update saveLineItem to include proper headers
const saveLineItem = async (itemData: LineItemData) => {
  try {
    if (!selectedCategory.value) {
      console.error('No category selected');
      return;
    }
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
const editCategory = (category: Category) => {
  viewLineItems(category)
}

const deleteCategory = async (categoryId: number) => {
  try {
    //todo: make this on the backend
    await api.delete(`/categories/${categoryId}`, getAuthHeaders());
    await fetchDashboardData();
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

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
