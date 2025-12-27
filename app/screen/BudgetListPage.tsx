import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useDispatch } from 'react-redux'
import { useRouter, useFocusEffect } from 'expo-router'
import { expenseCategories } from '../utils/expenseCategories'
import * as Haptics from 'expo-haptics'
import { useAppSettings } from '../context/AppSettingsContext'
import { useTextSize } from '../utils/useTextSize'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

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

const BudgetListPage = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const dispatch = useDispatch()
  const router = useRouter()
  const { getFontSize } = useTextSize()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const hasFetchedInitialData = useRef(false)

  const fetchBudgets = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true)

    const currentCallbackId = uuidv4()
    console.log(`🔷 [BudgetListPage] Fetching budgets with callback ID: ${currentCallbackId}`)

    try {
      const filters: any = {}
      if (showActiveOnly) {
        filters.is_active = true
      }

      const callback = {
        success: (data: Budget[]) => {
          console.log(`✅ [BudgetListPage] Success callback ${currentCallbackId} received:`, {
            dataType: Array.isArray(data) ? 'array' : typeof data,
            count: Array.isArray(data) ? data.length : 'N/A',
          })
          setBudgets(data || [])
          setIsLoading(false)
          setIsRefreshing(false)
          console.log("✅ [BudgetListPage] Budgets state updated, count:", data?.length || 0)
        },
        failure: (error: any) => {
          console.error(`❌ [BudgetListPage] Failed to fetch budgets for callback ${currentCallbackId}:`, error)
          setIsLoading(false)
          setIsRefreshing(false)

          const isUnauthorized = error?.status === 401 ||
                                error?.data?.status === 401 ||
                                error?.data?.requiresLogin ||
                                (error?.response && error?.response?.status === 401)

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
            } else {
              Alert.alert('Error', error?.data?.message || error?.message || 'Failed to load budgets. Please try again.')
            }
          }, 100)
        }
      }

      console.log(`🚀 [BudgetListPage] Dispatching getBudgetsWithStatus with callback ID: ${currentCallbackId}`)
      dispatch({ type: 'getBudgetsWithStatus', payload: { filters, callback, callbackId: currentCallbackId } })
    } catch (error) {
      console.error(`❌ [BudgetListPage] Error dispatching getBudgetsWithStatus:`, error)
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [showActiveOnly, dispatch, router])

  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      console.log("🔷 [BudgetListPage] Initial useEffect triggered, fetching budgets...")
      fetchBudgets()
      hasFetchedInitialData.current = true
    } else {
      console.log("⚠️ [BudgetListPage] Initial useEffect skipped, data already fetched.")
    }
  }, [fetchBudgets])

  useFocusEffect(
    useCallback(() => {
      console.log("🔷 [BudgetListPage] useFocusEffect triggered, refreshing budgets...")
      const timer = setTimeout(() => {
        fetchBudgets(false)
      }, 100)

      return () => clearTimeout(timer)
    }, [fetchBudgets])
  )

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchBudgets(false)
  }, [fetchBudgets])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getCategoryIcon = (categoryId: string | null) => {
    if (!categoryId) return 'wallet'
    const category = expenseCategories.find(c => c.id === categoryId)
    return category?.icon || 'pricetag'
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Overall Budget'
    const category = expenseCategories.find(c => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  const getProgressColor = (percentageUsed: number, isOverBudget: boolean) => {
    if (isOverBudget) return theme.errorText
    if (percentageUsed >= 90) return theme.errorText
    if (percentageUsed >= 75) return '#FFA500' // Orange
    return theme.appPrimary
  }

  const handleDeleteBudget = (budgetId: string, budgetName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete "${budgetName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled')
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const callbackId = uuidv4()
            const callback = {
              success: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                fetchBudgets(false)
              },
              failure: (error: any) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                Alert.alert('Error', error?.data?.message || error?.message || 'Failed to delete budget. Please try again.')
              }
            }
            dispatch({ type: 'deleteBudget', payload: { id: budgetId, callback, callbackId } })
          }
        }
      ]
    )
  }

  const renderBudgetCard = (budget: Budget) => {
    const percentageUsed = budget.percentageUsed || 0
    const spending = budget.spending || 0
    const remaining = budget.remaining || 0
    const isOverBudget = budget.isOverBudget || false
    const shouldAlert = budget.shouldAlert || false
    const progressColor = getProgressColor(percentageUsed, isOverBudget)

    return (
      <Pressable
        key={budget._id}
        onPress={() => router.push({ pathname: '/screen/BudgetPage', params: { id: budget._id } })}
        style={[
          styles.budgetCard,
          {
            backgroundColor: isDark ? theme.primaryDark + 'E6' : theme.primary + 'F0',
            borderColor: isOverBudget ? theme.errorText : (isDark ? theme.textPrimary + '20' : theme.appPrimary + '40'),
            borderWidth: isOverBudget ? 2 : 1,
          }
        ]}
      >
        <View style={styles.budgetCardHeader}>
          <View style={styles.budgetCardHeaderLeft}>
            <View style={[styles.categoryIconContainer, { backgroundColor: theme.appPrimary + '20' }]}>
              <Ionicons
                name={getCategoryIcon(budget.category_id) as any}
                size={24}
                color={theme.appPrimary}
              />
            </View>
            <View style={styles.budgetCardHeaderText}>
              <Text style={[styles.budgetName, { color: theme.textPrimary }]} numberOfLines={1}>
                {budget.name}
              </Text>
              <Text style={[styles.budgetCategory, { color: theme.textPrimary + '80' }]}>
                {getCategoryName(budget.category_id)}
              </Text>
            </View>
          </View>
          {(shouldAlert || isOverBudget) && (
            <View style={[styles.alertBadge, { backgroundColor: theme.errorText }]}>
              <Ionicons name="warning" size={16} color="white" />
            </View>
          )}
        </View>

        <View style={styles.budgetAmountRow}>
          <View>
            <Text style={[styles.budgetLabel, { color: theme.textPrimary + '80' }]}>Budget</Text>
            <Text style={[styles.budgetAmount, { color: theme.textPrimary }]}>
              ₹{budget.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.budgetSpendingInfo}>
            <Text style={[styles.budgetLabel, { color: theme.textPrimary + '80' }]}>Spent</Text>
            <Text style={[styles.budgetSpending, { color: progressColor }]}>
              ₹{spending.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View>
            <Text style={[styles.budgetLabel, { color: theme.textPrimary + '80' }]}>Remaining</Text>
            <Text style={[
              styles.budgetRemaining,
              { color: remaining < 0 ? theme.errorText : theme.textPrimary }
            ]}>
              ₹{Math.abs(remaining).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: isDark ? theme.textPrimary + '20' : theme.background + '80' }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(percentageUsed, 100)}%`,
                  backgroundColor: progressColor,
                }
              ]}
            />
          </View>
          <Text style={[styles.progressPercentage, { color: progressColor }]}>
            {percentageUsed.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.budgetFooter}>
          <View style={styles.budgetPeriodInfo}>
            <Ionicons name="calendar" size={14} color={isDark ? theme.textPrimary + 'CC' : theme.textPrimary + '99'} />
            <Text style={[styles.budgetPeriodText, { color: theme.textPrimary + '80' }]}>
              {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} • {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
            </Text>
          </View>
          <Pressable
            onPress={() => handleDeleteBudget(budget._id, budget.name)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={theme.errorText} />
          </Pressable>
        </View>
      </Pressable>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Budgets
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.push('/screen/BudgetPage')
          }}
          style={[
            styles.createButton,
            {
              backgroundColor: theme.appPrimary,
              shadowColor: isDark ? '#000' : '#00000030',
            }
          ]}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </Pressable>
      </View>

      {/* Filter Tabs - Glassy Design */}
      <View style={styles.filterTabsContainer}>
        <View
          style={[
            styles.filterTabsWrapper,
            {
              backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
              borderColor: isDark ? theme.primarylight + '30' : theme.textPrimary + '40',
              shadowColor: isDark ? '#000' : '#00000040',
            }
          ]}
        >
          <Pressable
            onPress={() => {
              setShowActiveOnly(true)
              hasFetchedInitialData.current = false
            }}
            style={[
              styles.filterTab,
              {
                backgroundColor: showActiveOnly ? theme.appPrimary : 'transparent',
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              }
            ]}
          >
            <Text style={[
              styles.filterTabText,
              { color: showActiveOnly ? 'white' : theme.textPrimary + '80' }
            ]}>
              Active
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowActiveOnly(false)
              hasFetchedInitialData.current = false
            }}
            style={[
              styles.filterTab,
              {
                backgroundColor: !showActiveOnly ? theme.appPrimary : 'transparent',
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
              }
            ]}
          >
            <Text style={[
              styles.filterTabText,
              { color: !showActiveOnly ? 'white' : theme.textPrimary + '80' }
            ]}>
              All
            </Text>
          </Pressable>
        </View>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.appPrimary} />
        </View>
      ) : budgets.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        >
          <Ionicons name="wallet-outline" size={64} color={theme.textPrimary + '40'} />
          <Text style={[styles.emptyText, { color: theme.textPrimary + '80' }]}>
            No budgets found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textPrimary + '60' }]}>
            {showActiveOnly ? 'Create your first budget to start tracking!' : 'No budgets available'}
          </Text>
          <Pressable
            onPress={() => router.push('/screen/BudgetPage')}
            style={[styles.emptyButton, { backgroundColor: theme.appPrimary }]}
          >
            <Text style={styles.emptyButtonText}>Create Budget</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        >
          {budgets.map(renderBudgetCard)}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingTop: 8,
  },
  filterTabsWrapper: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  filterTabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetCardHeaderText: {
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  budgetCategory: {
    fontSize: 14,
  },
  alertBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  budgetSpendingInfo: {
    alignItems: 'center',
  },
  budgetSpending: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  budgetRemaining: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetPeriodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetPeriodText: {
    fontSize: 12,
    marginLeft: 6,
  },
  deleteButton: {
    padding: 8,
  },
})

export default BudgetListPage

