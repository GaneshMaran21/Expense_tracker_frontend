import React, { useState, useRef } from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useDispatch } from 'react-redux'
import { useRouter, useLocalSearchParams } from 'expo-router'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { expenseCategories } from '../utils/expenseCategories'
import * as Haptics from 'expo-haptics'
import Button from '@/component/button'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

interface BudgetPeriod {
  id: 'weekly' | 'monthly' | 'yearly' | 'custom'
  name: string
}

const budgetPeriods: BudgetPeriod[] = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'yearly', name: 'Yearly' },
  { id: 'custom', name: 'Custom' },
]

const BudgetPage = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useLocalSearchParams()
  const isEditMode = !!params.id

  // Form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState<{ id: string; name: string } | null>(null)
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<BudgetPeriod['id']>('monthly')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [alertThreshold, setAlertThreshold] = useState('80')
  const [isLoading, setIsLoading] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const scrollViewRef = useRef<ScrollView>(null)

  // Calculate default dates based on period
  const calculatePeriodDates = (selectedPeriod: BudgetPeriod['id']) => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (selectedPeriod) {
      case 'weekly':
        // Start of current week (Monday)
        const dayOfWeek = now.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        start = new Date(now)
        start.setDate(now.getDate() - daysToMonday)
        start.setHours(0, 0, 0, 0)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break

      case 'monthly':
        // Start of current month
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        // End of current month
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        break

      case 'yearly':
        // Start of current year
        start = new Date(now.getFullYear(), 0, 1)
        start.setHours(0, 0, 0, 0)
        // End of current year
        end = new Date(now.getFullYear(), 11, 31)
        end.setHours(23, 59, 59, 999)
        break

      default: // 'custom'
        start = new Date(now)
        start.setHours(0, 0, 0, 0)
        end = new Date(now)
        end.setDate(now.getDate() + 30)
        end.setHours(23, 59, 59, 999)
        break
    }

    return { start, end }
  }

  // Update dates when period changes
  React.useEffect(() => {
    if (!isEditMode) {
      if (period === 'custom') {
        // For custom period, default to today for both start and end date
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setStartDate(new Date(today))
        setEndDate(new Date(today))
      } else {
        // For other periods, calculate based on period type
        const { start, end } = calculatePeriodDates(period)
        setStartDate(start)
        setEndDate(end)
      }
    }
  }, [period, isEditMode])

  // Load budget data if editing
  React.useEffect(() => {
    if (isEditMode && params.id) {
      // Fetch budget data
      const callbackId = uuidv4()
      const callback = {
        success: (data: any) => {
          setName(data.name || '')
          setAmount(data.amount?.toString() || '')
          setPeriod(data.period || 'monthly')
          setAlertThreshold(data.alert_threshold?.toString() || '80')
          setCategory(data.category_id ? expenseCategories.find(c => c.id === data.category_id) || null : null)
          
          if (data.start_date) {
            setStartDate(new Date(data.start_date))
          }
          if (data.end_date) {
            setEndDate(new Date(data.end_date))
          }
        },
        failure: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to load budget')
          router.back()
        }
      }
      dispatch({ type: 'getBudget', payload: { id: params.id, callback, callbackId } })
    }
  }, [isEditMode, params.id])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false)
      if (event.type === 'set' && selectedDate) {
        setStartDate(selectedDate)
      }
    } else {
      if (event.type === 'set' && selectedDate) {
        setStartDate(selectedDate)
      }
    }
  }

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false)
      if (event.type === 'set' && selectedDate) {
        setEndDate(selectedDate)
      }
    } else {
      if (event.type === 'set' && selectedDate) {
        setEndDate(selectedDate)
      }
    }
  }

  const validate = () => {
    const newErrors: any = {}

    if (!name || name.trim().length < 2) {
      newErrors.name = 'Budget name must be at least 2 characters'
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    if (period === 'custom') {
      if (!startDate || !endDate) {
        newErrors.dates = 'Please select start and end dates'
      } else if (endDate <= startDate) {
        newErrors.dates = 'End date must be after start date'
      }
    }
    const threshold = parseFloat(alertThreshold)
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      newErrors.alertThreshold = 'Alert threshold must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsLoading(true)

    // Convert dates to UTC equivalent of midnight IST (same as expense dates)
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()
    const startDay = startDate.getDate()
    const startUtcMidnight = new Date(Date.UTC(startYear, startMonth, startDay, 0, 0, 0, 0))
    const startIstMidnightAsUTC = new Date(startUtcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)

    const endYear = endDate.getFullYear()
    const endMonth = endDate.getMonth()
    const endDay = endDate.getDate()
    const endUtcMidnight = new Date(Date.UTC(endYear, endMonth, endDay, 23, 59, 59, 999))
    const endIstMidnightAsUTC = new Date(endUtcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)

    const budgetData = {
      name: name.trim(),
      category_id: category?.id || null,
      amount: parseFloat(amount),
      period,
      start_date: startIstMidnightAsUTC.toISOString(),
      end_date: endIstMidnightAsUTC.toISOString(),
      alert_threshold: parseFloat(alertThreshold),
    }

    const callbackId = uuidv4()
    const callback = {
      success: (data: any) => {
        setIsLoading(false)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert('Success', isEditMode ? 'Budget updated successfully!' : 'Budget created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.push('/screen/BudgetListPage')
            }
          }
        ])
      },
      failure: (error: any) => {
        setIsLoading(false)
        const isUnauthorized = error?.status === 401 || 
                              error?.data?.status === 401 || 
                              error?.data?.requiresLogin ||
                              (error?.response && error?.response?.status === 401)

        setTimeout(() => {
          if (isUnauthorized) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            Alert.alert('Error', error?.data?.message || error?.message || `Failed to ${isEditMode ? 'update' : 'create'} budget. Please try again.`)
          }
        }, 100)
      }
    }

    if (isEditMode) {
      dispatch({ type: 'updateBudget', payload: { id: params.id, budgetData, callback, callbackId } })
    } else {
      dispatch({ type: 'createBudget', payload: { budgetData, callback, callbackId } })
    }
  }

  const renderSelectionButton = (
    label: string,
    value: string | null,
    onPress: () => void,
    error?: string,
    icon?: string
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          {label}
        </Text>
        <Pressable
          onPress={onPress}
            style={[
              styles.selectionButton,
              {
                backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
                borderColor: error ? theme.errorText : (isDark ? theme.appPrimary + '80' : theme.appPrimary),
                borderWidth: error ? 2 : 1,
              }
            ]}
        >
          <View style={styles.selectionButtonContent}>
            {icon && (
              <Ionicons
                name={icon as any}
                size={20}
                color={value ? theme.appPrimary : theme.textPrimary + '60'}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={[
              styles.selectionButtonText,
              { color: value ? theme.textPrimary : theme.textPrimary + '60' }
            ]}>
              {value || `Select ${label.toLowerCase()}`}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.textPrimary + '60'}
              style={{ marginLeft: 'auto' }}
            />
          </View>
        </Pressable>
        {error && (
          <Text style={[styles.errorText, { color: theme.errorText }]}>
            {error}
          </Text>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {isEditMode ? 'Edit Budget' : 'Create Budget'}
              </Text>

              {/* Budget Name */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>
                  Budget Name
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
                      color: theme.textPrimary,
                      borderColor: errors.name ? theme.errorText : (isDark ? theme.appPrimary + '80' : theme.appPrimary),
                      borderWidth: errors.name ? 2 : 1,
                    }
                  ]}
                  value={name}
                  onChangeText={(text) => {
                    setName(text)
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined })
                    }
                  }}
                  placeholder="e.g., Monthly Groceries"
                  placeholderTextColor={theme.textPrimary + '60'}
                />
                {errors.name && (
                  <Text style={[styles.errorText, { color: theme.errorText }]}>
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Category (Optional) */}
              {renderSelectionButton(
                'Category (Optional)',
                category?.name || null,
                () => setShowCategoryModal(true),
                errors.category,
                'pricetag'
              )}

              {/* Amount */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>
                  Budget Amount
                </Text>
                <View                   style={[
                    styles.amountCard,
                    {
                      backgroundColor: isDark ? theme.primaryDark + 'E6' : theme.primary + 'F0',
                      borderColor: errors.amount ? theme.errorText : (isDark ? theme.appPrimary + '60' : theme.appPrimary + '40'),
                      borderWidth: errors.amount ? 2 : 1,
                    }
                  ]}>
                  <View style={styles.amountInputWrapper}>
                    <View style={styles.currencyContainer}>
                      <Text style={[styles.currencySymbol, { color: theme.appPrimary }]}>₹</Text>
                    </View>
                    <TextInput
                      style={[styles.amountInput, { color: theme.textPrimary }]}
                      value={amount}
                      onChangeText={(text) => {
                        setAmount(text.replace(/[^0-9.]/g, ''))
                        if (errors.amount) {
                          setErrors({ ...errors, amount: undefined })
                        }
                      }}
                      placeholder="0.00"
                      placeholderTextColor={theme.textPrimary + '40'}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {errors.amount && (
                    <View style={styles.amountErrorContainer}>
                      <Ionicons name="alert-circle" size={16} color={theme.errorText} />
                      <Text style={[styles.amountErrorText, { color: theme.errorText }]}>
                        {errors.amount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Period */}
              {renderSelectionButton(
                'Budget Period',
                budgetPeriods.find(p => p.id === period)?.name || null,
                () => setShowPeriodModal(true),
                errors.period,
                'calendar'
              )}

              {/* Start Date */}
              {(period === 'custom' || isEditMode) && (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: theme.textPrimary }]}>
                    Start Date
                  </Text>
                  <Pressable
                    onPress={() => setShowStartDatePicker(true)}
                    style={[
                      styles.selectionButton,
                      {
                        backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
                        borderColor: isDark ? theme.appPrimary + '80' : theme.appPrimary,
                        borderWidth: 1,
                      }
                    ]}
                  >
                    <View style={styles.selectionButtonContent}>
                      <Ionicons
                        name="calendar"
                        size={20}
                        color={theme.appPrimary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.selectionButtonText, { color: theme.textPrimary }]}>
                        {formatDate(startDate)}
                      </Text>
                    </View>
                  </Pressable>
                  {Platform.OS === 'android' && showStartDatePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={onStartDateChange}
                    />
                  )}
                  {Platform.OS === 'ios' && showStartDatePicker && (
                    <Modal
                      visible={showStartDatePicker}
                      transparent={true}
                      animationType="fade"
                      onRequestClose={() => setShowStartDatePicker(false)}
                    >
                      <Pressable
                        style={styles.datePickerModalOverlay}
                        onPress={() => setShowStartDatePicker(false)}
                      >
                        <Pressable
                          style={[styles.datePickerModalContent, { backgroundColor: isDark ? theme.primaryDark : theme.background }]}
                          onPress={(e) => e.stopPropagation()}
                        >
                          <View style={[styles.datePickerModalHeader, { borderBottomColor: isDark ? theme.textPrimary + '20' : 'rgba(0, 0, 0, 0.1)' }]}>
                            <Pressable onPress={() => setShowStartDatePicker(false)}>
                              <Text style={[styles.datePickerButtonText, { color: theme.textPrimary }]}>Cancel</Text>
                            </Pressable>
                            <Text style={[styles.datePickerModalTitle, { color: theme.textPrimary }]}>Select Start Date</Text>
                            <Pressable onPress={() => setShowStartDatePicker(false)}>
                              <Text style={[styles.datePickerButtonText, { color: theme.appPrimary, fontWeight: '600' }]}>Done</Text>
                            </Pressable>
                          </View>
                          <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="spinner"
                            onChange={onStartDateChange}
                            style={styles.iosDatePicker}
                            themeVariant={isDark ? 'dark' : 'light'}
                          />
                        </Pressable>
                      </Pressable>
                    </Modal>
                  )}
                </View>
              )}

              {/* End Date */}
              {(period === 'custom' || isEditMode) && (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: theme.textPrimary }]}>
                    End Date
                  </Text>
                  <Pressable
                    onPress={() => setShowEndDatePicker(true)}
                    style={[
                      styles.selectionButton,
                      {
                        backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
                        borderColor: errors.dates ? theme.errorText : (isDark ? theme.appPrimary + '80' : theme.appPrimary),
                        borderWidth: errors.dates ? 2 : 1,
                      }
                    ]}
                  >
                    <View style={styles.selectionButtonContent}>
                      <Ionicons
                        name="calendar"
                        size={20}
                        color={theme.appPrimary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.selectionButtonText, { color: theme.textPrimary }]}>
                        {formatDate(endDate)}
                      </Text>
                    </View>
                  </Pressable>
                  {errors.dates && (
                    <Text style={[styles.errorText, { color: theme.errorText }]}>
                      {errors.dates}
                    </Text>
                  )}
                  {Platform.OS === 'android' && showEndDatePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      onChange={onEndDateChange}
                    />
                  )}
                  {Platform.OS === 'ios' && showEndDatePicker && (
                    <Modal
                      visible={showEndDatePicker}
                      transparent={true}
                      animationType="fade"
                      onRequestClose={() => setShowEndDatePicker(false)}
                    >
                      <Pressable
                        style={styles.datePickerModalOverlay}
                        onPress={() => setShowEndDatePicker(false)}
                      >
                        <Pressable
                          style={[styles.datePickerModalContent, { backgroundColor: isDark ? theme.primaryDark : theme.background }]}
                          onPress={(e) => e.stopPropagation()}
                        >
                          <View style={[styles.datePickerModalHeader, { borderBottomColor: isDark ? theme.textPrimary + '20' : 'rgba(0, 0, 0, 0.1)' }]}>
                            <Pressable onPress={() => setShowEndDatePicker(false)}>
                              <Text style={[styles.datePickerButtonText, { color: theme.textPrimary }]}>Cancel</Text>
                            </Pressable>
                            <Text style={[styles.datePickerModalTitle, { color: theme.textPrimary }]}>Select End Date</Text>
                            <Pressable onPress={() => setShowEndDatePicker(false)}>
                              <Text style={[styles.datePickerButtonText, { color: theme.appPrimary, fontWeight: '600' }]}>Done</Text>
                            </Pressable>
                          </View>
                          <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="spinner"
                            onChange={onEndDateChange}
                            style={styles.iosDatePicker}
                            themeVariant={isDark ? 'dark' : 'light'}
                          />
                        </Pressable>
                      </Pressable>
                    </Modal>
                  )}
                </View>
              )}

              {/* Alert Threshold */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>
                  Alert Threshold (%)
                </Text>
                <Text style={[styles.subLabel, { color: theme.textPrimary + '80' }]}>
                  Get notified when you reach this percentage of your budget
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
                      color: theme.textPrimary,
                      borderColor: errors.alertThreshold ? theme.errorText : (isDark ? theme.appPrimary + '80' : theme.appPrimary),
                      borderWidth: errors.alertThreshold ? 2 : 1,
                    }
                  ]}
                  value={alertThreshold}
                  onChangeText={(text) => {
                    setAlertThreshold(text.replace(/[^0-9.]/g, ''))
                    if (errors.alertThreshold) {
                      setErrors({ ...errors, alertThreshold: undefined })
                    }
                  }}
                  placeholder="80"
                  placeholderTextColor={theme.textPrimary + '60'}
                  keyboardType="number-pad"
                />
                {errors.alertThreshold && (
                  <Text style={[styles.errorText, { color: theme.errorText }]}>
                    {errors.alertThreshold}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <Button
                title={isLoading ? 'Please Wait...' : (isEditMode ? 'Update Budget' : 'Create Budget')}
                onPress={handleSubmit}
                disabled={isLoading}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Category</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <Pressable
                onPress={() => {
                  setCategory(null)
                  setShowCategoryModal(false)
                }}
                style={[
                  styles.modalItem,
                  {
                    backgroundColor: !category ? (isDark ? theme.appPrimary + '30' : theme.appPrimary + '20') : 'transparent',
                    borderBottomColor: isDark ? theme.textPrimary + '10' : 'rgba(0, 0, 0, 0.05)',
                  }
                ]}
              >
                <Text style={[styles.modalItemText, { color: theme.textPrimary }]}>
                  None (Overall Budget)
                </Text>
                {!category && <Ionicons name="checkmark" size={20} color={theme.appPrimary} />}
              </Pressable>
              {expenseCategories.map((cat, index) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setCategory(cat)
                    setShowCategoryModal(false)
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: category?.id === cat.id ? (isDark ? theme.appPrimary + '30' : theme.appPrimary + '20') : 'transparent',
                      borderBottomColor: index === expenseCategories.length - 1 ? 'transparent' : (isDark ? theme.textPrimary + '10' : 'rgba(0, 0, 0, 0.05)'),
                    }
                  ]}
                >
                  <View style={styles.modalItemContent}>
                    <Ionicons name={cat.icon as any} size={24} color={theme.appPrimary} />
                    <Text style={[styles.modalItemText, { color: theme.textPrimary }]}>
                      {cat.name}
                    </Text>
                  </View>
                  {category?.id === cat.id && <Ionicons name="checkmark" size={20} color={theme.appPrimary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Period Modal */}
      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? theme.textPrimary + '20' : 'rgba(0, 0, 0, 0.1)' }]}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Period</Text>
              <Pressable onPress={() => setShowPeriodModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {budgetPeriods.map((periodOption, index) => (
                <Pressable
                  key={periodOption.id}
                  onPress={() => {
                    setPeriod(periodOption.id)
                    setShowPeriodModal(false)
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: period === periodOption.id ? (isDark ? theme.appPrimary + '30' : theme.appPrimary + '20') : 'transparent',
                      borderBottomColor: index === budgetPeriods.length - 1 ? 'transparent' : (isDark ? theme.textPrimary + '10' : 'rgba(0, 0, 0, 0.05)'),
                    }
                  ]}
                >
                  <Text style={[styles.modalItemText, { color: theme.textPrimary }]}>
                    {periodOption.name}
                  </Text>
                  {period === periodOption.id && <Ionicons name="checkmark" size={20} color={theme.appPrimary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  amountCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyContainer: {
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
  },
  amountErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  amountErrorText: {
    marginLeft: 8,
    fontSize: 12,
  },
  selectionButton: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionButtonText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContent: {
    borderRadius: 25,
    paddingBottom: 40,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  datePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  datePickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerButtonText: {
    fontSize: 16,
    padding: 8,
  },
  iosDatePicker: {
    height: 200,
    width: '100%',
  },
})

export default BudgetPage

