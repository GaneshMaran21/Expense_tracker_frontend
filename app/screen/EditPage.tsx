import React, { useState, useRef, useEffect } from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useDispatch } from 'react-redux'
import { useRouter, useLocalSearchParams } from 'expo-router'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { expenseCategories, paymentMethods } from '../utils/expenseCategories'
import * as Haptics from 'expo-haptics'
import Button from '@/component/button'

const EditPage = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useLocalSearchParams()
  const expenseId = params.id as string
  
  // Form state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<{ id: string; name: string } | null>(null)
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<{ id: string; name: string } | null>(null)
  const [tags, setTags] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingExpense, setIsLoadingExpense] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const scrollViewRef = useRef<ScrollView>(null)
  
  // Fetch expense data on mount
  useEffect(() => {
    if (expenseId) {
      fetchExpenseData()
    } else {
      Alert.alert('Error', 'Expense ID is missing', [
        { text: 'OK', onPress: () => router.back() }
      ])
    }
  }, [expenseId])
  
  const fetchExpenseData = () => {
    setIsLoadingExpense(true)
    const callback = {
      success: (data: any) => {
        setIsLoadingExpense(false)
        // Pre-fill form with expense data
        setAmount(data.amount?.toString() || '')
        
        // Set category
        if (data.category_id) {
          const foundCategory = expenseCategories.find(c => c.id === data.category_id)
          if (foundCategory) {
            setCategory({ id: foundCategory.id, name: foundCategory.name })
          } else {
            setCategory({ id: data.category_id, name: data.category_name || data.category_id })
          }
        }
        
        // Set date - convert from IST string to Date
        if (data.date) {
          // Backend returns date as IST string (e.g., "2025-12-23T00:00:00.000+05:30")
          // Parse it correctly
          const dateStr = data.date
          // If it has +05:30, it's IST, so we can parse it directly
          const parsedDate = new Date(dateStr)
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate)
          }
        }
        
        // Set description
        setDescription(data.description || '')
        
        // Set payment method
        if (data.payment_method) {
          const foundPayment = paymentMethods.find(p => p.id === data.payment_method)
          if (foundPayment) {
            setPaymentMethod({ id: foundPayment.id, name: foundPayment.name })
          } else {
            setPaymentMethod({ id: data.payment_method, name: data.payment_method })
          }
        }
        
        // Set tags
        if (data.tags && Array.isArray(data.tags)) {
          setTags(data.tags.join(', '))
        } else if (data.tags) {
          setTags(data.tags)
        }
      },
      failure: (error: any) => {
        setIsLoadingExpense(false)
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
            Alert.alert('Error', error?.data?.message || error?.message || 'Failed to load expense. Please try again.', [
              { text: 'OK', onPress: () => router.back() }
            ])
          }
        }, 100)
      }
    }
    
    dispatch({ type: 'getExpense', payload: { id: expenseId, callback } })
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
      if (event.type === 'set' && selectedDate) {
        setDate(selectedDate)
      }
    } else {
      if (event.type === 'set' && selectedDate) {
        setDate(selectedDate)
      }
    }
  }
  
  const handleDatePickerDone = () => {
    setShowDatePicker(false)
  }
  
  const handleDescriptionFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 450, animated: true })
    }, 100)
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 450, animated: true })
    }, 500)
  }
  
  const validate = () => {
    const newErrors: any = {}
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    if (!category) {
      newErrors.category = 'Please select a category'
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method'
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
    
    // Date handling - same as MainPage
    const selectedDate = new Date(date)
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const day = selectedDate.getDate()
    
    const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
    const istMidnightAsUTC = new Date(utcMidnight.getTime() - (5 * 60 + 30) * 60 * 1000)
    
    const expenseData = {
      amount: parseFloat(amount),
      category_id: category!.id,
      category_name: category!.name,
      date: istMidnightAsUTC.toISOString(),
      description: description.trim() || undefined,
      payment_method: paymentMethod!.id,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
    }
    
    const callback = {
      success: (data: any) => {
        setIsLoading(false)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert('Success', 'Expense updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.back() // Navigate back to ListPage
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
            Alert.alert('Error', error?.data?.message || error?.message || 'Failed to update expense. Please try again.')
          }
        }, 100)
      }
    }
    
    dispatch({ type: 'updateExpense', payload: { id: expenseId, data: expenseData, callback } })
  }
  
  // Render selection button helper
  const renderSelectionButton = (
    label: string,
    value: string | null,
    onPress: () => void,
    icon?: string,
    error?: string
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
        <Pressable
          onPress={() => {
            Keyboard.dismiss()
            onPress()
          }}
          style={[
            styles.selectionButton,
            {
              backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
              borderColor: error ? theme.errorText : theme.appPrimary,
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
  
  if (isLoadingExpense) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.appPrimary} />
          <Text style={[styles.loadingText, { color: theme.textPrimary }]}>
            Loading expense...
          </Text>
        </View>
      </SafeAreaView>
    )
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Edit Expense
          </Text>
          
          {/* Amount - Redesigned */}
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: theme.textPrimary + 'CC' }]}>
              Enter Amount
            </Text>
            <View style={[
              styles.amountCard,
              {
                backgroundColor: isDark ? theme.primaryDark + 'CC' : theme.primary + 'E6',
                borderColor: errors.amount ? theme.errorText : theme.appPrimary + '40',
                borderWidth: errors.amount ? 2 : 1,
                shadowColor: errors.amount ? theme.errorText : theme.appPrimary,
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
                  autoFocus={false}
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
          
          {/* Category Selection */}
          {renderSelectionButton(
            'Category',
            category?.name || null,
            () => setShowCategoryModal(true),
            category ? expenseCategories.find(c => c.id === category.id)?.icon : 'pricetag-outline',
            errors.category
          )}
          
          {/* Date Selection */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Date</Text>
            <Pressable
              onPress={() => {
                Keyboard.dismiss()
                setShowDatePicker(true)
              }}
              style={[
                styles.selectionButton,
                {
                  backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
                  borderColor: theme.appPrimary,
                  borderWidth: 1,
                }
              ]}
            >
              <View style={styles.selectionButtonContent}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.appPrimary}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.selectionButtonText, { color: theme.textPrimary }]}>
                  {formatDate(date)}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.textPrimary + '60'}
                  style={{ marginLeft: 'auto' }}
                />
              </View>
            </Pressable>
          </View>
          
          {/* Payment Method Selection */}
          {renderSelectionButton(
            'Payment Method',
            paymentMethod?.name || null,
            () => setShowPaymentModal(true),
            paymentMethod ? paymentMethods.find(p => p.id === paymentMethod.id)?.icon : 'wallet-outline',
            errors.paymentMethod
          )}
          
          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Description (Optional)</Text>
            <TextInput
              style={[
                styles.descriptionInput,
                {
                  backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
                  borderColor: theme.appPrimary,
                  color: theme.textPrimary,
                }
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a note about this expense..."
              placeholderTextColor={theme.textPrimary + '40'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={handleDescriptionFocus}
            />
          </View>
          
          {/* Tags */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Tags (Optional)</Text>
            <TextInput
              style={[
                styles.tagsInput,
                {
                  backgroundColor: isDark ? theme.primaryDark + '80' : theme.primary + 'CC',
                  borderColor: theme.appPrimary,
                  color: theme.textPrimary,
                }
              ]}
              value={tags}
              onChangeText={setTags}
              placeholder="e.g., groceries, monthly, urgent"
              placeholderTextColor={theme.textPrimary + '40'}
            />
            <Text style={[styles.hintText, { color: theme.textPrimary + '60' }]}>
              Separate tags with commas
            </Text>
          </View>
          
          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Updating...' : 'Update Expense'}
              onPress={handleSubmit}
              backgroundColor={isLoading ? theme.appPrimary + '80' : theme.appPrimary}
              fontColor={theme.primarylight}
            />
          </View>
        </View>
        </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      
      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? theme.primaryDark : theme.primary }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Category</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {expenseCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setCategory({ id: cat.id, name: cat.name })
                    setShowCategoryModal(false)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    if (errors.category) {
                      setErrors({ ...errors, category: undefined })
                    }
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: category?.id === cat.id
                        ? theme.appPrimary + '20'
                        : 'transparent',
                      borderLeftColor: category?.id === cat.id ? theme.appPrimary : 'transparent',
                      borderLeftWidth: category?.id === cat.id ? 4 : 0,
                    }
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={24}
                    color={category?.id === cat.id ? theme.appPrimary : theme.textPrimary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[
                    styles.modalItemText,
                    {
                      color: category?.id === cat.id ? theme.appPrimary : theme.textPrimary,
                      fontWeight: category?.id === cat.id ? '600' : '400',
                    }
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? theme.primaryDark : theme.primary }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Payment Method</Text>
              <Pressable onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {paymentMethods.map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => {
                    setPaymentMethod({ id: method.id, name: method.name })
                    setShowPaymentModal(false)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    if (errors.paymentMethod) {
                      setErrors({ ...errors, paymentMethod: undefined })
                    }
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: paymentMethod?.id === method.id
                        ? theme.appPrimary + '20'
                        : 'transparent',
                      borderLeftColor: paymentMethod?.id === method.id ? theme.appPrimary : 'transparent',
                      borderLeftWidth: paymentMethod?.id === method.id ? 4 : 0,
                    }
                  ]}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={24}
                    color={paymentMethod?.id === method.id ? theme.appPrimary : theme.textPrimary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[
                    styles.modalItemText,
                    {
                      color: paymentMethod?.id === method.id ? theme.appPrimary : theme.textPrimary,
                      fontWeight: paymentMethod?.id === method.id ? '600' : '400',
                    }
                  ]}>
                    {method.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Date Picker Modal (iOS) */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={handleDatePickerDone}
        >
          <View style={styles.datePickerOverlay}>
            <View style={[
              styles.datePickerContainer,
              { backgroundColor: isDark ? theme.primaryDark : theme.primary }
            ]}>
              <View style={styles.datePickerHeader}>
                <Text style={[styles.datePickerTitle, { color: theme.textPrimary }]}>Select Date</Text>
                <Pressable onPress={handleDatePickerDone}>
                  <Text style={[styles.datePickerDone, { color: theme.appPrimary }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
                textColor={theme.textPrimary}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* Date Picker (Android) */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  )
}

export default EditPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 300,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyContainer: {
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    padding: 0,
  },
  amountErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  amountErrorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectionButton: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionButtonText: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  descriptionInput: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minHeight: 100,
    fontSize: 16,
  },
  tagsInput: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    marginTop: 6,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
  },
})

