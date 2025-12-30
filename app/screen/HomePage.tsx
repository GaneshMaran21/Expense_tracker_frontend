import React, { useState, useEffect, useCallback } from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useDispatch } from 'react-redux'
import { useRouter, useFocusEffect } from 'expo-router'
import { expenseCategories } from '../utils/expenseCategories'
import * as Haptics from 'expo-haptics'
import { useTextSize } from '../utils/useTextSize'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated'

interface Expense {
  _id: string
  amount: number
  category_id: string
  category_name?: string
  date: string
  description?: string
  payment_method: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

interface CategoryBreakdown {
  category_id: string
  category_name: string
  total: number
  count: number
  icon: string
}

interface Budget {
  _id: string
  name: string
  category_id: string | null
  amount: number
  period: string
  start_date: string
  end_date: string
  alert_threshold: number
  is_active: boolean
  spending?: number
  remaining?: number
  percentageUsed?: number
  isOverBudget?: boolean
  shouldAlert?: boolean
  isOverThreshold?: boolean
}

const HomePage = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const dispatch = useDispatch()
  const router = useRouter()
  const { getFontSize } = useTextSize()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Animation values for stats (number counters)
  const [animatedStats, setAnimatedStats] = useState({
    totalExpenses: 0,
    todaySpending: 0,
    monthSpending: 0,
    averageDaily: 0,
  })

  const fetchBudgets = useCallback(async () => {
    try {
      const filters = { is_active: true }
      const callbackId = uuidv4()
      const callback = {
        success: (data: Budget[]) => {
          setBudgets(data || [])
        },
        failure: (error: any) => {
          console.error('Failed to fetch budgets:', error)
          // Don't show error alert for budgets, just log it
        }
      }
      dispatch({ type: 'getBudgetsWithStatus', payload: { filters, callback, callbackId } })
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }, [dispatch])

  const fetchExpenses = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true)
    
    try {
      // Fetch all expenses for dashboard
      const filters: any = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
      
      const callback = {
        success: (data: Expense[]) => {
          setExpenses(data || [])
          setIsLoading(false)
          setIsRefreshing(false)
        },
        failure: (error: any) => {
          console.error('Failed to fetch expenses:', error)
          setIsLoading(false)
          setIsRefreshing(false)
          
          const isUnauthorized = error?.status === 401 || 
                                error?.data?.status === 401 || 
                                error?.data?.requiresLogin ||
                                (error?.response && error?.response?.status === 401)
          
          const isTimeout = error?.code === 'ECONNABORTED' || 
                           error?.message?.includes('timeout')
          
          setTimeout(() => {
            if (isUnauthorized) {
              Alert.alert(
                'Session Expired',
                'Your session has expired. Please login again.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/profile')
                  }
                ],
                { cancelable: false }
              )
            } else if (isTimeout) {
              Alert.alert(
                'Request Timeout',
                error?.message || 'Request timed out. Please check:\n\n1. Backend server is running\n2. Device is on the same network\n3. Backend URL is correct',
                [
                  {
                    text: 'Retry',
                    onPress: () => fetchExpenses(false)
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ],
                { cancelable: false }
              )
            } else {
              Alert.alert('Error', error?.data?.message || error?.message || 'Failed to load expenses. Please try again.')
            }
          }, 100)
        }
      }
      
      dispatch({ type: 'getExpenses', payload: { filters, callback } })
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [dispatch, router])

  useEffect(() => {
    fetchExpenses()
    fetchBudgets()
  }, [fetchExpenses, fetchBudgets])

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        fetchExpenses(false)
        fetchBudgets()
      }, 100)
      return () => clearTimeout(timer)
    }, [fetchExpenses, fetchBudgets])
  )

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchExpenses(false)
    fetchBudgets()
  }, [fetchExpenses, fetchBudgets])

  // Calculate statistics - memoize date calculations to prevent flickering
  const calculateStats = useCallback(() => {
    const now = new Date()
    // Create date boundaries once and reuse
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    // Cache daysInMonth to prevent recalculation on every render
    const daysInMonth = now.getDate()

    let totalExpenses = 0
    let todaySpending = 0
    let monthSpending = 0

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      const expenseAmount = expense.amount || 0
      
      totalExpenses += expenseAmount
      
      // Check if expense is today
      if (expenseDate >= today) {
        todaySpending += expenseAmount
      }
      
      // Check if expense is this month
      if (expenseDate >= monthStart) {
        monthSpending += expenseAmount
      }
    })

    // Calculate average daily spending (this month)
    const averageDaily = daysInMonth > 0 ? monthSpending / daysInMonth : 0

    return {
      totalExpenses,
      todaySpending,
      monthSpending,
      averageDaily
    }
  }, [expenses])

  // Animate stats when they change - with proper cleanup to prevent flickering
  useEffect(() => {
    const stats = calculateStats()
    const duration = 1500
    const timers: NodeJS.Timeout[] = []
    
    // Animate each stat value with smooth counting
    const animateValue = (start: number, end: number, callback: (val: number) => void) => {
      // If start and end are the same, set immediately without animation
      if (Math.abs(start - end) < 0.01) {
        callback(end)
        return null
      }
      
      const steps = 60
      const increment = (end - start) / steps
      let current = start
      let step = 0
      
      const timer = setInterval(() => {
        step++
        current += increment
        if (step >= steps) {
          current = end
          callback(current)
          clearInterval(timer)
        } else {
          callback(current)
        }
      }, duration / steps)
      
      return timer
    }
    
    // Clean up previous animations by immediately setting to target values
    // This prevents flickering when expenses change rapidly
    const timer1 = animateValue(animatedStats.totalExpenses, stats.totalExpenses, (val) => {
      setAnimatedStats(prev => ({ ...prev, totalExpenses: val }))
    })
    if (timer1) timers.push(timer1)
    
    const timer2 = animateValue(animatedStats.todaySpending, stats.todaySpending, (val) => {
      setAnimatedStats(prev => ({ ...prev, todaySpending: val }))
    })
    if (timer2) timers.push(timer2)
    
    const timer3 = animateValue(animatedStats.monthSpending, stats.monthSpending, (val) => {
      setAnimatedStats(prev => ({ ...prev, monthSpending: val }))
    })
    if (timer3) timers.push(timer3)
    
    const timer4 = animateValue(animatedStats.averageDaily, stats.averageDaily, (val) => {
      setAnimatedStats(prev => ({ ...prev, averageDaily: val }))
    })
    if (timer4) timers.push(timer4)
    
    // Cleanup function to cancel all animations if component unmounts or expenses change
    return () => {
      timers.forEach(timer => {
        if (timer) clearInterval(timer)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses])

  // Get recent expenses (last 5)
  const getRecentExpenses = () => {
    return expenses.slice(0, 5)
  }

  // Calculate category breakdown
  const getCategoryBreakdown = (): CategoryBreakdown[] => {
    const categoryMap = new Map<string, { total: number; count: number; category_name: string }>()

    expenses.forEach(expense => {
      const categoryId = expense.category_id
      const categoryName = expense.category_name || expenseCategories.find(c => c.id === categoryId)?.name || 'Other'
      const amount = expense.amount || 0

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!
        existing.total += amount
        existing.count += 1
      } else {
        categoryMap.set(categoryId, {
          total: amount,
          count: 1,
          category_name: categoryName
        })
      }
    })

    const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => {
        const category = expenseCategories.find(c => c.id === categoryId)
        return {
          category_id: categoryId,
          category_name: data.category_name,
          total: data.total,
          count: data.count,
          icon: category?.icon || 'ellipsis-horizontal'
        }
      })
      .sort((a, b) => b.total - a.total) // Sort by total descending
      .slice(0, 6) // Top 6 categories

    return breakdown
  }

  const stats = calculateStats()
  const recentExpenses = getRecentExpenses()
  const categoryBreakdown = getCategoryBreakdown()

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      timeZone: 'Asia/Kolkata'
    })
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId)
    return category?.icon || 'pricetag'
  }

  // Animated Stat Card Component
  const AnimatedStatCard = ({ title, value, icon, color, delay = 0 }: {
    title: string
    value: number
    icon: string
    color?: string
    delay?: number
  }) => {
    const progress = useSharedValue(0)
    const scale = useSharedValue(0.8)
    
    useEffect(() => {
      progress.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 150 }))
      scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 150 }))
    }, [delay])
    
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [
        { scale: scale.value },
        { translateY: interpolate(progress.value, [0, 1], [20, 0], Extrapolate.CLAMP) }
      ],
    }))
    
    const borderColor = isDark ? theme.primarylight + '30' : theme.textPrimary + '40'
    const shadowColor = isDark ? '#000' : '#00000040'
    
    // Get animated value for this card
    let animatedValue = 0
    if (title === 'Total Expenses') animatedValue = animatedStats.totalExpenses
    else if (title === "Today's Spending") animatedValue = animatedStats.todaySpending
    else if (title === 'This Month') animatedValue = animatedStats.monthSpending
    else if (title === 'Avg Daily') animatedValue = animatedStats.averageDaily
    
    return (
      <Animated.View style={[styles.statCard, animatedStyle, {
        backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.15,
        shadowRadius: 8,
        elevation: 5,
      }]}>
        <View style={[styles.statIconContainer, { backgroundColor: (color || theme.appPrimary) + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color || theme.appPrimary} />
        </View>
        <Text style={[styles.statValue, { color: theme.textPrimary, fontSize: getFontSize(20) }]}>
          ₹{animatedValue.toFixed(2)}
        </Text>
        <Text style={[styles.statTitle, { color: theme.textPrimary + 'CC' }]}>
          {title}
        </Text>
      </Animated.View>
    )
  }

  const renderRecentExpense = (expense: Expense, index: number) => {
    const borderColor = isDark ? theme.primarylight + '30' : theme.textPrimary + '40'

    return (
      <Animated.View
        key={expense._id}
        entering={FadeInDown.delay(index * 100).springify().damping(15)}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.push(`/screen/ListPage`)
          }}
          style={[
            styles.recentExpenseCard,
            {
              backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
              borderWidth: 1,
              borderColor: borderColor,
            }
          ]}
        >
          <View style={[styles.categoryIconContainer, { backgroundColor: theme.appPrimary + '20' }]}>
            <Ionicons
              name={getCategoryIcon(expense.category_id) as any}
              size={20}
              color={theme.appPrimary}
            />
          </View>
          <View style={styles.recentExpenseInfo}>
            <Text style={[styles.recentExpenseCategory, { color: theme.textPrimary }]} numberOfLines={1}>
              {expense.category_name || expenseCategories.find(c => c.id === expense.category_id)?.name || expense.category_id}
            </Text>
            <Text style={[styles.recentExpenseDate, { color: theme.textPrimary + '80' }]}>
              {formatDate(expense.date)}
            </Text>
          </View>
          <Text style={[styles.recentExpenseAmount, { color: theme.textPrimary }]}>
            ₹{expense.amount.toFixed(2)}
          </Text>
        </Pressable>
      </Animated.View>
    )
  }

  // Animated Progress Bar Component
  const AnimatedProgressBar = ({ percentage, color }: { percentage: number; color: string }) => {
    const progress = useSharedValue(0)
    
    useEffect(() => {
      progress.value = withSpring(percentage / 100, {
        damping: 15,
        stiffness: 100,
      })
    }, [percentage])
    
    const animatedStyle = useAnimatedStyle(() => ({
      width: `${progress.value * 100}%`,
    }))
    
    return (
      <View style={[styles.categoryProgressBar, { backgroundColor: color + '30' }]}>
        <Animated.View
          style={[
            styles.categoryProgressFill,
            {
              backgroundColor: color,
            },
            animatedStyle,
          ]}
        />
      </View>
    )
  }

  const renderCategoryItem = (category: CategoryBreakdown, index: number) => {
    const borderColor = isDark ? theme.primarylight + '30' : theme.textPrimary + '40'
    const totalAll = categoryBreakdown.reduce((sum, c) => sum + c.total, 0)
    const percentage = totalAll > 0 ? (category.total / totalAll) * 100 : 0

    return (
      <Animated.View
        key={category.category_id}
        entering={FadeInUp.delay(index * 80).springify().damping(15)}
        style={[
          styles.categoryItem,
          {
            backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
            borderWidth: 1,
            borderColor: borderColor,
          }
        ]}
      >
        <View style={[styles.categoryIconContainer, { backgroundColor: theme.appPrimary + '20' }]}>
          <Ionicons name={category.icon as any} size={20} color={theme.appPrimary} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: theme.textPrimary }]} numberOfLines={1}>
            {category.category_name}
          </Text>
          <View style={styles.categoryProgress}>
            <AnimatedProgressBar percentage={percentage} color={theme.appPrimary} />
          </View>
        </View>
        <View style={styles.categoryAmount}>
          <Text style={[styles.categoryTotal, { color: theme.textPrimary }]}>
            ₹{category.total.toFixed(2)}
          </Text>
          <Text style={[styles.categoryCount, { color: theme.textPrimary + '80' }]}>
            {category.count} {category.count === 1 ? 'expense' : 'expenses'}
          </Text>
        </View>
      </Animated.View>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.appPrimary} />
          <Text style={[styles.loadingText, { color: theme.textPrimary }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.appPrimary}
            colors={[theme.appPrimary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.springify().damping(15)}
          style={styles.header}
        >
          <Text style={[styles.title, { color: theme.textPrimary, fontSize: getFontSize(28) }]}>
            Dashboard
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push('/screen/MainPage')
            }}
            style={[styles.addButton, { backgroundColor: theme.appPrimary }]}
          >
            <Ionicons name="add" size={24} color={theme.primarylight} />
          </Pressable>
        </Animated.View>

        {/* Summary Cards */}
        <View style={styles.statsContainer}>
          <AnimatedStatCard 
            title="Total Expenses" 
            value={stats.totalExpenses} 
            icon="wallet" 
            color={theme.appPrimary}
            delay={0}
          />
          <AnimatedStatCard 
            title="Today's Spending" 
            value={stats.todaySpending} 
            icon="today" 
            color="#4CAF50"
            delay={30}
          />
          <AnimatedStatCard 
            title="This Month" 
            value={stats.monthSpending} 
            icon="calendar" 
            color="#2196F3"
            delay={60}
          />
          <AnimatedStatCard 
            title="Avg Daily" 
            value={stats.averageDaily} 
            icon="trending-up" 
            color="#FF9800"
            delay={90}
          />
        </View>

        {/* Budget Alerts */}
        {(() => {
          const alertBudgets = budgets.filter(b => (b.isOverThreshold || b.isOverBudget) && b.is_active)
          if (alertBudgets.length === 0) return null

          return (
            <Animated.View 
              entering={FadeInUp.delay(120).springify().damping(15)}
              style={styles.section}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Ionicons name="warning" size={20} color={theme.errorText} style={{ marginRight: 8 }} />
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: getFontSize(20) }]}>
                    Budget Alerts
                  </Text>
                </View>
                {alertBudgets.length > 2 && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      router.push('/screen/BudgetListPage')
                    }}
                  >
                    <Text style={[styles.viewAll, { color: theme.appPrimary }]}>View All</Text>
                  </Pressable>
                )}
              </View>

              {alertBudgets.slice(0, 2).map((budget, index) => {
                const percentageUsed = budget.percentageUsed || 0
                const spending = budget.spending || 0
                const remaining = budget.remaining || 0
                const isOverBudget = budget.isOverBudget || false
                const progressColor = isOverBudget ? theme.errorText : percentageUsed >= 90 ? theme.errorText : '#FFA500'
                
                // Calculate over-budget amount: when over budget, it's spending - budget amount
                const overBudgetAmount = isOverBudget ? spending - budget.amount : 0

                return (
                  <Animated.View
                    key={budget._id}
                    entering={FadeInUp.delay(150 + index * 50).springify().damping(15)}
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        router.push({ pathname: '/screen/BudgetPage', params: { id: budget._id } })
                      }}
                      style={[
                        styles.budgetAlertCard,
                        {
                          backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
                          borderColor: progressColor,
                          borderWidth: 2,
                        }
                      ]}
                    >
                      <View style={styles.budgetAlertHeader}>
                        <View style={styles.budgetAlertHeaderLeft}>
                          <View style={[styles.budgetAlertIconContainer, { backgroundColor: progressColor + '20' }]}>
                            <Ionicons name="wallet" size={20} color={progressColor} />
                          </View>
                          <View style={styles.budgetAlertInfo}>
                            <Text style={[styles.budgetAlertName, { color: theme.textPrimary }]} numberOfLines={1}>
                              {budget.name}
                            </Text>
                            <Text style={[styles.budgetAlertAmount, { color: theme.textPrimary + '80' }]}>
                              ₹{spending.toFixed(2)} / ₹{budget.amount.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.budgetAlertPercentage}>
                          <Text style={[styles.budgetAlertPercentageText, { color: progressColor }]}>
                            {percentageUsed.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.budgetAlertProgressBar, { backgroundColor: isDark ? theme.textPrimary + '20' : theme.background + '80' }]}>
                        <Animated.View
                          style={[
                            styles.budgetAlertProgressFill,
                            {
                              width: `${Math.min(percentageUsed, 100)}%`,
                              backgroundColor: progressColor,
                            }
                          ]}
                        />
                      </View>
                      {isOverBudget && (
                        <View style={styles.budgetAlertOverBudget}>
                          <Ionicons name="alert-circle" size={14} color={theme.errorText} />
                          <Text style={[styles.budgetAlertOverBudgetText, { color: theme.errorText }]}>
                            Over budget by ₹{overBudgetAmount.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                )
              })}
            </Animated.View>
          )
        })()}

        {/* Recent Expenses */}
        <Animated.View 
          entering={FadeInUp.delay(150).springify().damping(15)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: getFontSize(20) }]}>
              Recent Expenses
            </Text>
            {expenses.length > 5 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  router.push('/screen/ListPage')
                }}
              >
                <Text style={[styles.viewAll, { color: theme.appPrimary }]}>View All</Text>
              </Pressable>
            )}
          </View>

          {recentExpenses.length === 0 ? (
            <Animated.View 
              entering={FadeIn.delay(200)}
              style={styles.emptyContainer}
            >
              <Ionicons name="receipt-outline" size={48} color={theme.textPrimary + '40'} />
              <Text style={[styles.emptyText, { color: theme.textPrimary + '80' }]}>
                No expenses yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textPrimary + '60' }]}>
                Add your first expense to get started
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push('/screen/MainPage')
                }}
                style={[styles.addButtonLarge, { backgroundColor: theme.appPrimary }]}
              >
                <Ionicons name="add" size={20} color={theme.primarylight} style={{ marginRight: 8 }} />
                <Text style={[styles.addButtonText, { color: theme.primarylight }]}>
                  Add Expense
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <View style={styles.recentExpensesList}>
              {recentExpenses.map((expense, index) => renderRecentExpense(expense, index))}
            </View>
          )}
        </Animated.View>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <Animated.View 
            entering={FadeInUp.delay(200).springify().damping(15)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontSize: getFontSize(20) }]}>
                Top Categories
              </Text>
            </View>
            <View style={styles.categoryList}>
              {categoryBreakdown.map((category, index) => renderCategoryItem(category, index))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentExpensesList: {
    gap: 12,
  },
  recentExpenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentExpenseInfo: {
    flex: 1,
  },
  recentExpenseCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentExpenseDate: {
    fontSize: 12,
  },
  recentExpenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryTotal: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  budgetAlertCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  budgetAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetAlertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetAlertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetAlertInfo: {
    flex: 1,
  },
  budgetAlertName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetAlertAmount: {
    fontSize: 13,
  },
  budgetAlertPercentage: {
    alignItems: 'flex-end',
  },
  budgetAlertPercentageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  budgetAlertProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  budgetAlertProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetAlertOverBudget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  budgetAlertOverBudgetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
