import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useDispatch } from 'react-redux'
import { useRouter, useFocusEffect } from 'expo-router'
import { expenseCategories, paymentMethods } from '../utils/expenseCategories'
import * as Haptics from 'expo-haptics'
import { useAppSettings } from '../context/AppSettingsContext'
import { useTextSize } from '../utils/useTextSize'

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

const ListPage = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const dispatch = useDispatch()
  const router = useRouter()
  const { getFontSize } = useTextSize()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('today')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const filterScrollRef = useRef<ScrollView>(null)
  const categoryScrollRef = useRef<ScrollView>(null)
  const filterButtonLayouts = useRef<{ [key: string]: number }>({})
  const categoryButtonLayouts = useRef<{ [key: string]: number }>({})
  
  const fetchExpenses = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true)
    
    try {
      const filters: any = {}
      
      // Date filters
      // The backend stores dates as UTC equivalent of midnight IST
      // So we need to convert our filter dates to the same format
      const now = new Date()
      if (selectedFilter === 'today') {
        // Get today's date components
        const year = now.getFullYear()
        const month = now.getMonth()
        const day = now.getDate()
        
        // Create UTC midnight for today, then subtract 5:30 to get UTC equivalent of midnight IST
        const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
        const istMidnightAsUTC = new Date(utcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)
        
        // End of today: tomorrow's midnight IST minus 1ms
        const tomorrowUtcMidnight = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0))
        const tomorrowIstMidnightAsUTC = new Date(tomorrowUtcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)
        const endOfToday = new Date(tomorrowIstMidnightAsUTC.getTime() - 1)
        
        filters.start_date = istMidnightAsUTC.toISOString()
        filters.end_date = endOfToday.toISOString()
      } else if (selectedFilter === 'week') {
        // Get date 7 days ago
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        const year = weekAgo.getFullYear()
        const month = weekAgo.getMonth()
        const day = weekAgo.getDate()
        
        // Start of week: 7 days ago midnight IST
        const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
        const istMidnightAsUTC = new Date(utcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)
        
        // End: today's end (tomorrow midnight IST minus 1ms)
        const todayYear = now.getFullYear()
        const todayMonth = now.getMonth()
        const todayDay = now.getDate()
        const tomorrowUtcMidnight = new Date(Date.UTC(todayYear, todayMonth, todayDay + 1, 0, 0, 0, 0))
        const tomorrowIstMidnightAsUTC = new Date(tomorrowUtcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)
        const endOfToday = new Date(tomorrowIstMidnightAsUTC.getTime() - 1)
        
        filters.start_date = istMidnightAsUTC.toISOString()
        filters.end_date = endOfToday.toISOString()
      } else if (selectedFilter === 'month') {
        // Start of current month
        const year = now.getFullYear()
        const month = now.getMonth()
        const day = 1
        
        // Start of month: 1st day midnight IST
        const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
        const istMidnightAsUTC = new Date(utcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)
        
        // End: today's end (tomorrow midnight IST minus 1ms)
        const todayDay = now.getDate()
        const tomorrowUtcMidnight = new Date(Date.UTC(year, month, todayDay + 1, 0, 0, 0, 0))
        const tomorrowIstMidnightAsUTC = new Date(tomorrowUtcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)
        const endOfToday = new Date(tomorrowIstMidnightAsUTC.getTime() - 1)
        
        filters.start_date = istMidnightAsUTC.toISOString()
        filters.end_date = endOfToday.toISOString()
      }
      // If selectedFilter === 'all', no date filters are applied
      
      // Category filter
      if (selectedCategory) {
        filters.category_id = selectedCategory
      }
      
      // Sort options
      filters.sortBy = sortBy
      filters.sortOrder = sortOrder
      
      console.log('📅 Fetching expenses with filters:', {
        selectedFilter,
        selectedCategory,
        sortBy,
        sortOrder,
        dateFilters: {
          start_date: filters.start_date,
          end_date: filters.end_date
        },
        category_id: filters.category_id
      })
      
      // Generate unique callback ID for debugging
      const callbackId = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log(`🔷 [ListPage] Creating callback with ID: ${callbackId}`)
      
      const callback = {
        success: (data: Expense[]) => {
          console.log(`✅ [ListPage] Success callback ${callbackId} received:`, {
            dataType: Array.isArray(data) ? 'array' : typeof data,
            count: Array.isArray(data) ? data.length : 'N/A',
            sample: Array.isArray(data) && data.length > 0 ? data[0] : null,
            callbackId
          })
          
          if (!Array.isArray(data)) {
            console.error(`❌ [ListPage] Data is not an array! Type: ${typeof data}`, data)
            setExpenses([])
          } else {
            setExpenses(data)
            console.log(`✅ [ListPage] Expenses state updated, count: ${data.length}`)
          }
          
          setIsLoading(false)
          setIsRefreshing(false)
        },
        failure: (error: any) => {
          console.error('Failed to fetch expenses:', error)
          console.error('Error details:', {
            status: error?.status,
            message: error?.message,
            code: error?.code,
            config: error?.config
          })
          
          setIsLoading(false)
          setIsRefreshing(false)
          
          // Handle 401 - show alert then redirect
          // Check for 401 status in multiple possible locations
          const isUnauthorized = error?.status === 401 || 
                                error?.data?.status === 401 || 
                                error?.data?.requiresLogin ||
                                (error?.response && error?.response?.status === 401)
          
          // Check for timeout
          const isTimeout = error?.code === 'ECONNABORTED' || 
                           error?.message?.includes('timeout') ||
                           error?.status === 0
          
          // Use setTimeout to ensure state updates complete before showing alert
          setTimeout(() => {
            if (isUnauthorized) {
              Alert.alert(
                'Session Expired',
                'Your session has expired. Please login again.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to profile after user clicks OK
                      router.push('/profile')
                    }
                  }
                ],
                { cancelable: false } // Prevent dismissing without clicking OK
              )
            } else if (isTimeout) {
              Alert.alert(
                'Request Timeout',
                error?.message || 'Request timed out. Please check:\n\n1. Backend server is running\n2. Device is on the same network\n3. Backend URL is correct',
                [
                  {
                    text: 'Retry',
                    onPress: () => {
                      fetchExpenses(false) // Retry the request
                    }
                  },
                  {
                    text: 'OK',
                    style: 'cancel'
                  }
                ]
              )
            } else {
              Alert.alert('Error', error?.data?.message || error?.message || 'Failed to load expenses. Please try again.')
            }
          }, 100)
        }
      }
      
      console.log(`🚀 [ListPage] Dispatching getExpenses with callback ID: ${callbackId}`)
      dispatch({ type: 'getExpenses', payload: { filters, callback } })
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedFilter, selectedCategory, sortBy, sortOrder, dispatch])
  
  // Track if initial load has happened to prevent duplicate requests
  const initialLoadRef = useRef(false)
  
  useEffect(() => {
    if (!initialLoadRef.current) {
      console.log("🔄 [ListPage] Initial load - fetching expenses")
      initialLoadRef.current = true
      fetchExpenses()
    }
  }, [fetchExpenses])
  
  // Refresh expenses when screen comes into focus (e.g., returning from EditPage)
  useFocusEffect(
    useCallback(() => {
      // Only refresh on focus if initial load has completed
      if (initialLoadRef.current) {
        console.log("🔄 [ListPage] Screen focused - refreshing expenses")
        const timer = setTimeout(() => {
          fetchExpenses(false) // Don't show loader on focus refresh
        }, 100)
        
        return () => clearTimeout(timer)
      }
    }, [fetchExpenses])
  )
  
  // Auto-scroll to "today" filter on initial load
  useEffect(() => {
    if (selectedFilter === 'today') {
      setTimeout(() => {
        const todayX = filterButtonLayouts.current['today']
        if (todayX !== undefined && filterScrollRef.current) {
          filterScrollRef.current.scrollTo({
            x: Math.max(0, todayX - 20),
            animated: true,
          })
        }
      }, 300) // Delay to ensure layout is measured
    }
  }, []) // Run only on mount
  
  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchExpenses(false)
  }, [fetchExpenses])
  
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'Asia/Kolkata' // Ensure IST timezone
    })
  }
  
  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    
    // Backend now sends dates with +05:30 timezone (IST)
    // If it has +05:30, it's already in IST, just parse and format
    // If it has Z or +00:00, it's UTC, convert to IST
    const isIST = dateString.includes('+05:30')
    const isUTC = dateString.includes('+00:00') || dateString.endsWith('Z')
    
    const date = new Date(dateString)
    
    if (isIST) {
      // Already in IST, just format it
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
        hour12: true // 12-hour format with AM/PM
      })
    } else if (isUTC) {
      // UTC, convert to IST by adding 5:30 hours
      const istDate = new Date(date.getTime() + (5 * 60 + 30) * 60 * 1000)
      return istDate.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true // 12-hour format with AM/PM
      })
    }
    
    // Fallback: just format as-is
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true // 12-hour format with AM/PM
    })
  }
  
  const getCategoryIcon = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId)
    return category?.icon || 'pricetag'
  }
  
  const getPaymentMethodIcon = (method: string) => {
    const payment = paymentMethods.find(p => p.id === method)
    return payment?.icon || 'wallet'
  }
  
  const getTotalAmount = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }
  
  const handleDeleteExpense = (expenseId: string, expenseAmount?: number, categoryName?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    
    // Build a descriptive message
    const amountText = expenseAmount ? `₹${expenseAmount.toFixed(2)}` : 'this expense'
    const categoryText = categoryName ? ` (${categoryName})` : ''
    const expenseDetails = `${amountText}${categoryText}`
    
    Alert.alert(
      'Delete Expense Permanently?',
      `Are you sure you want to permanently delete ${expenseDetails}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            const callback = {
              success: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                fetchExpenses(false)
              },
              failure: (error: any) => {
                // Check for 401 status in multiple possible locations
                const isUnauthorized = error?.status === 401 || 
                                      error?.data?.status === 401 || 
                                      error?.data?.requiresLogin ||
                                      (error?.response && error?.response?.status === 401)
                
                // Use setTimeout to ensure alert shows properly
                setTimeout(() => {
                  // Handle 401 - show alert then redirect
                  if (isUnauthorized) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                    Alert.alert(
                      'Session Expired',
                      'Your session has expired. Please login again.',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            // Navigate to profile after user clicks OK
                            router.push('/profile')
                          }
                        }
                      ],
                      { cancelable: false } // Prevent dismissing without clicking OK
                    )
                  } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                    Alert.alert('Error', error?.data?.message || error?.message || 'Failed to delete expense. Please try again.')
                  }
                }, 100)
              }
            }
            dispatch({ type: 'deleteExpense', payload: { id: expenseId, callback } })
          }
        }
      ],
      { cancelable: true }
    )
  }
  
  const renderExpenseCard = (expense: Expense) => {
    const category = expenseCategories.find(c => c.id === expense.category_id)
    const payment = paymentMethods.find(p => p.id === expense.payment_method)
    
    // Glassy background similar to footer
    const glassBackground = isDark
      ? theme.primaryDark + 'CC'
      : theme.primary + 'E6'
    const borderColor = isDark
      ? theme.primarylight + '30'
      : theme.textPrimary + '40'
    const shadowColor = isDark ? '#000' : '#00000040'
    
    return (
      <View
        key={expense._id}
        style={[
          styles.expenseCard,
          {
            backgroundColor: glassBackground,
            borderLeftColor: theme.appPrimary,
            borderLeftWidth: 4,
            borderTopWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: borderColor,
            borderRightColor: borderColor,
            borderBottomColor: borderColor,
            shadowColor: shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.15,
            shadowRadius: 8,
            elevation: 5,
          }
        ]}
      >
        <View style={styles.expenseCardHeader}>
          <View style={styles.expenseCardLeft}>
            <View style={[styles.categoryIconContainer, { backgroundColor: theme.appPrimary + '20' }]}>
              <Ionicons
                name={getCategoryIcon(expense.category_id) as any}
                size={24}
                color={theme.appPrimary}
              />
            </View>
            <View style={styles.expenseCardInfo}>
              <Text style={[styles.expenseCategory, { color: theme.textPrimary }]}>
                {expense.category_name || category?.name || expense.category_id}
              </Text>
              <Text style={[styles.expenseDate, { color: theme.textPrimary + '80' }]}>
                {formatDate(expense.date)} • {formatTime(expense.createdAt || expense.date)}
              </Text>
            </View>
          </View>
          <View style={styles.expenseCardRight}>
            <Text style={[styles.expenseAmount, { color: theme.textPrimary }]}>
              ₹{expense.amount.toFixed(2)}
            </Text>
            <View style={styles.expenseActions}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  router.push(`/screen/EditPage?id=${expense._id}`)
                }}
                style={styles.actionButton}
              >
                <Ionicons name="create-outline" size={18} color={theme.appPrimary} />
              </Pressable>
              <Pressable
                onPress={() => handleDeleteExpense(
                  expense._id,
                  expense.amount,
                  expense.category_name || category?.name
                )}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={18} color={theme.errorText} />
              </Pressable>
            </View>
          </View>
        </View>
        
        {expense.description && (
          <Text style={[styles.expenseDescription, { color: theme.textPrimary + 'CC' }]} numberOfLines={2}>
            {expense.description}
          </Text>
        )}
        
        <View style={styles.expenseCardFooter}>
          <View style={[styles.paymentMethodBadge, { backgroundColor: theme.appPrimary + '20' }]}>
            <Ionicons
              name={getPaymentMethodIcon(expense.payment_method) as any}
              size={14}
              color={theme.appPrimary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.paymentMethodText, { color: theme.appPrimary }]}>
              {payment?.name || expense.payment_method}
            </Text>
          </View>
          {expense.tags && expense.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {expense.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.tagBadge, { backgroundColor: theme.primaryDark + '60' }]}>
                  <Text style={[styles.tagText, { color: theme.textPrimary + 'CC' }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
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
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={[styles.title, { color: theme.textPrimary, fontSize: getFontSize(28) }]}>
                  Expenses
                </Text>
                {/* Sort Options */}
                <View style={styles.sortContainer}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      if (sortBy === 'createdAt') {
                        // Toggle order for createdAt
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        // Switch to createdAt
                        setSortBy('createdAt')
                        setSortOrder('desc')
                      }
                    }}
                    style={[
                      styles.sortButton,
                      {
                        backgroundColor: sortBy === 'createdAt' 
                          ? theme.appPrimary 
                          : 'transparent',
                        borderWidth: sortBy === 'createdAt' ? 0 : 1,
                        borderColor: isDark ? theme.primarylight + '40' : theme.textPrimary + '30',
                      }
                    ]}
                  >
                    <Ionicons
                      name={sortBy === 'createdAt' && sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                      size={16}
                      color={sortBy === 'createdAt' ? theme.primarylight : theme.textPrimary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.sortButtonText,
                        {
                          color: sortBy === 'createdAt' ? theme.primarylight : theme.textPrimary,
                        }
                      ]}
                    >
                      Date
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      if (sortBy === 'amount') {
                        // Toggle order for amount
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        // Switch to amount
                        setSortBy('amount')
                        setSortOrder('desc')
                      }
                    }}
                    style={[
                      styles.sortButton,
                      {
                        backgroundColor: sortBy === 'amount' 
                          ? theme.appPrimary 
                          : 'transparent',
                        borderWidth: sortBy === 'amount' ? 0 : 1,
                        borderColor: isDark ? theme.primarylight + '40' : theme.textPrimary + '30',
                      }
                    ]}
                  >
                    <Ionicons
                      name={sortBy === 'amount' && sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
                      size={16}
                      color={sortBy === 'amount' ? theme.primarylight : theme.textPrimary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.sortButtonText,
                        {
                          color: sortBy === 'amount' ? theme.primarylight : theme.textPrimary,
                        }
                      ]}
                    >
                      Price
                    </Text>
                  </Pressable>
                </View>
              </View>
              {expenses.length > 0 && (
                <Text style={[styles.totalAmount, { color: theme.appPrimary }]}>
                  Total: ₹{getTotalAmount().toFixed(2)}
                </Text>
              )}
            </View>
        
        {/* Quick Filters */}
        <View style={[
          styles.filtersContainer,
          {
            backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
            borderWidth: 1,
            borderColor: isDark ? theme.primarylight + '30' : theme.textPrimary + '40',
            borderRadius: 20,
            padding: 12,
            marginBottom: 16,
          }
        ]}>
          <ScrollView 
            ref={filterScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filtersScroll}
          >
            {(['all', 'today', 'week', 'month'] as const).map((filter, index) => (
              <Pressable
                key={filter}
                onLayout={(event) => {
                  // Store the x position of each button for accurate scrolling
                  const { x } = event.nativeEvent.layout
                  filterButtonLayouts.current[filter] = x
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedFilter(filter)
                  
                  // Auto-scroll selected filter to start using actual measured positions
                  setTimeout(() => {
                    const buttonX = filterButtonLayouts.current[filter]
                    if (buttonX !== undefined && filterScrollRef.current) {
                      // Scroll to show the selected button at the start with small padding
                      filterScrollRef.current.scrollTo({
                        x: Math.max(0, buttonX - 20), // Small padding from start
                        animated: true,
                      })
                    } else {
                      // Fallback to approximate calculation if layout not measured yet
                      const buttonWidth = 90
                      const margin = 12
                      const scrollPosition = index * (buttonWidth + margin)
                      filterScrollRef.current?.scrollTo({
                        x: Math.max(0, scrollPosition - 20),
                        animated: true,
                      })
                    }
                  }, 100) // Small delay to ensure layout is measured
                }}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedFilter === filter
                      ? theme.appPrimary
                      : 'transparent',
                    borderWidth: selectedFilter === filter ? 0 : 1,
                    borderColor: isDark ? theme.primarylight + '40' : theme.textPrimary + '30',
                  }
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: selectedFilter === filter ? theme.primarylight : theme.textPrimary,
                      fontWeight: selectedFilter === filter ? '600' : '400',
                    }
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {/* Category Filter */}
        <View style={[
          styles.categoryFilterContainer,
          {
            backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
            borderWidth: 1,
            borderColor: isDark ? theme.primarylight + '30' : theme.textPrimary + '40',
            borderRadius: 20,
            padding: 12,
            marginBottom: 24,
          }
        ]}>
          <ScrollView 
            ref={categoryScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryScroll}
          >
            <Pressable
              onLayout={(event) => {
                // Store the x position of "All Categories" button
                const { x } = event.nativeEvent.layout
                categoryButtonLayouts.current['all'] = x
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setSelectedCategory(null)
                
                // Scroll "All Categories" to start
                setTimeout(() => {
                  const buttonX = categoryButtonLayouts.current['all']
                  if (buttonX !== undefined && categoryScrollRef.current) {
                    categoryScrollRef.current.scrollTo({
                      x: Math.max(0, buttonX - 20),
                      animated: true,
                    })
                  } else {
                    categoryScrollRef.current?.scrollTo({
                      x: 0,
                      animated: true,
                    })
                  }
                }, 100)
              }}
              style={[
                styles.categoryFilterButton,
                {
                  backgroundColor: selectedCategory === null
                    ? theme.appPrimary
                    : 'transparent',
                  borderWidth: selectedCategory === null ? 0 : 1,
                  borderColor: isDark ? theme.primarylight + '40' : theme.textPrimary + '30',
                }
              ]}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  {
                    color: selectedCategory === null ? theme.primarylight : theme.textPrimary,
                  }
                ]}
              >
                All Categories
              </Text>
            </Pressable>
            {expenseCategories.map((category, index) => (
              <Pressable
                key={category.id}
                onLayout={(event) => {
                  // Store the x position of each category button for accurate scrolling
                  const { x } = event.nativeEvent.layout
                  categoryButtonLayouts.current[category.id] = x
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedCategory(category.id)
                  
                  // Auto-scroll selected category to start using actual measured positions
                  setTimeout(() => {
                    const buttonX = categoryButtonLayouts.current[category.id]
                    if (buttonX !== undefined && categoryScrollRef.current) {
                      // Scroll to show the selected button at the start with small padding
                      categoryScrollRef.current.scrollTo({
                        x: Math.max(0, buttonX - 20), // Small padding from start
                        animated: true,
                      })
                    } else {
                      // Fallback to approximate calculation if layout not measured yet
                      const allCategoriesWidth = 120
                      const categoryWidth = 100
                      const margin = 12
                      const scrollPosition = allCategoriesWidth + (index * (categoryWidth + margin))
                      categoryScrollRef.current?.scrollTo({
                        x: Math.max(0, scrollPosition - 20),
                        animated: true,
                      })
                    }
                  }, 100) // Small delay to ensure layout is measured
                }}
                style={[
                  styles.categoryFilterButton,
                  {
                    backgroundColor: selectedCategory === category.id
                      ? theme.appPrimary
                      : 'transparent',
                    borderWidth: selectedCategory === category.id ? 0 : 1,
                    borderColor: isDark ? theme.primarylight + '40' : theme.textPrimary + '30',
                  }
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? theme.primarylight : theme.textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.categoryFilterText,
                    {
                      color: selectedCategory === category.id ? theme.primarylight : theme.textPrimary,
                    }
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {/* Expenses List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.appPrimary} />
            <Text style={[styles.loadingText, { color: theme.textPrimary + '80' }]}>
              Loading expenses...
        </Text>
    </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={theme.textPrimary + '40'} />
            <Text style={[styles.emptyText, { color: theme.textPrimary + '80' }]}>
              No expenses found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textPrimary + '60' }]}>
              {selectedFilter !== 'all' || selectedCategory
                ? 'Try adjusting your filters'
                : 'Add your first expense to get started'}
            </Text>
            {(!selectedFilter || selectedFilter === 'all') && !selectedCategory && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push('/screen/MainPage')
                }}
                style={[styles.addButton, { backgroundColor: theme.appPrimary }]}
              >
                <Ionicons name="add" size={20} color={theme.primarylight} style={{ marginRight: 8 }} />
                <Text style={[styles.addButtonText, { color: theme.primarylight }]}>
                  Add Expense
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.expensesList}>
            {expenses.map(renderExpenseCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ListPage

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
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    gap: 12,
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 12,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryFilterContainer: {
    marginBottom: 24,
  },
  categoryScroll: {
    gap: 12,
    paddingRight: 20,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 12,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
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
  expensesList: {
    gap: 16,
  },
  expenseCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  expenseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseCardInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 13,
  },
  expenseCardRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  expenseDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  expenseCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
  },
})
