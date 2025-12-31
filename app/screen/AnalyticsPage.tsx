import React, { useState, useEffect, useCallback } from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, Dimensions } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, useFocusEffect } from 'expo-router'
import { expenseCategories } from '../utils/expenseCategories'
import * as Haptics from 'expo-haptics'
import { useTextSize } from '../utils/useTextSize'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Svg, Circle, G, Line, Path } from 'react-native-svg'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface AnalyticsPageProps {}

const AnalyticsPage: React.FC<AnalyticsPageProps> = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const dispatch = useDispatch()
  const router = useRouter()
  const { getFontSize } = useTextSize()
  
  // Redux state
  const analytics = useSelector((state: any) => state.analytics)
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'payment' | 'forecast'>('trends')

  // Fetch analytics summary on mount and when period changes
  const fetchAnalytics = useCallback(() => {
    dispatch({ type: 'getAnalyticsSummary', payload: { period: selectedPeriod } })
  }, [dispatch, selectedPeriod])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics()
    }, [fetchAnalytics])
  )

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchAnalytics()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [fetchAnalytics])

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId)
    return category?.icon || 'pricetag-outline'
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (selectedPeriod === 'year') {
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  // Simple Pie Chart Component (using SVG)
  const PieChart = ({ data, size = 150 }: { data: Array<{ label: string; value: number; color: string }>; size?: number }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) {
      return (
        <View style={[styles.emptyChart, { width: size, height: size, borderRadius: size / 2 }]}>
          <Ionicons name="bar-chart-outline" size={40} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
          <Text style={[styles.emptyChartText, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
            No data
          </Text>
        </View>
      )
    }

    let currentAngle = -90
    const radius = size / 2 - 10
    const center = size / 2

    return (
      <View style={styles.chartContainer}>
        <View style={[styles.pieChartWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G>
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const angle = (percentage / 100) * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                currentAngle = endAngle

                // Calculate arc path for pie slice
                const startX = center + radius * Math.cos((startAngle * Math.PI) / 180)
                const startY = center + radius * Math.sin((startAngle * Math.PI) / 180)
                const endX = center + radius * Math.cos((endAngle * Math.PI) / 180)
                const endY = center + radius * Math.sin((endAngle * Math.PI) / 180)
                const largeArcFlag = angle > 180 ? 1 : 0

                return (
                  <Path
                    key={index}
                    d={`M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                    fill={item.color}
                  />
                )
              })}
            </G>
          </Svg>
        </View>
        <View style={styles.chartLegend}>
          {data.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={[styles.legendValue, { color: theme.textPrimary + 'CC' }]}>
                {((item.value / total) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  // Bar Chart Component
  const BarChart = ({ data, height = 200 }: { data: Array<{ label: string; value: number; color: string }>; height?: number }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1)
    const barWidth = (SCREEN_WIDTH - 80) / data.length - 10

    return (
      <View style={[styles.barChartContainer, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 60)
          return (
            <View key={index} style={styles.barItem}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.textPrimary + 'CC' }]} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={[styles.barValue, { color: theme.textPrimary }]}>
                {formatCurrency(item.value)}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }

  // Line Chart Component (Simple)
  const LineChart = ({ data }: { data: Array<{ date: string; amount: number }> }) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons name="trending-up-outline" size={40} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
          <Text style={[styles.emptyChartText, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
            No spending data available
          </Text>
        </View>
      )
    }

    const maxAmount = Math.max(...data.map(item => item.amount), 1)
    const chartHeight = 200
    const chartWidth = SCREEN_WIDTH - 60
    const pointRadius = 4

    return (
      <View style={[styles.lineChartContainer, { height: chartHeight + 40 }]}>
        <Svg width={chartWidth} height={chartHeight}>
          {data.map((item, index) => {
            if (index === 0) return null
            const x1 = ((index - 1) / (data.length - 1)) * chartWidth
            const y1 = chartHeight - (data[index - 1].amount / maxAmount) * chartHeight
            const x2 = (index / (data.length - 1)) * chartWidth
            const y2 = chartHeight - (item.amount / maxAmount) * chartHeight

            return (
              <React.Fragment key={index}>
                <Circle cx={x1} cy={y1} r={pointRadius} fill={theme.appPrimary} />
                <Circle cx={x2} cy={y2} r={pointRadius} fill={theme.appPrimary} />
                <Line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={theme.appPrimary}
                  strokeWidth="2"
                />
              </React.Fragment>
            )
          })}
        </Svg>
        <View style={styles.lineChartLabels}>
          {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((item, index) => (
            <Text key={index} style={[styles.lineChartLabel, { color: theme.textPrimary + 'CC' }]}>
              {formatDate(item.date)}
            </Text>
          ))}
        </View>
      </View>
    )
  }

  // Category colors
  const getCategoryColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80'
    ]
    return colors[index % colors.length]
  }

  // Payment method colors
  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: '#FF6B6B',
      card: '#4ECDC4',
      upi: '#45B7D1',
      bank_transfer: '#FFA07A',
      other: '#98D8C8',
    }
    return colors[method] || '#85C1E2'
  }

  const borderColor = isDark ? theme.primarylight + '30' : theme.textPrimary + '40'
  const cardBg = isDark ? theme.primaryDark + '80' : theme.primary + 'CC'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.appPrimary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontSize: getFontSize(24) }]}>
            Analytics
          </Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Period Selector */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <Pressable
              key={period}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setSelectedPeriod(period)
              }}
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === period ? theme.appPrimary : cardBg,
                  borderColor: selectedPeriod === period ? theme.appPrimary : borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  {
                    color: selectedPeriod === period ? '#FFFFFF' : theme.textPrimary,
                    fontSize: getFontSize(14),
                  },
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Tab Selector */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.tabSelector}>
          {([
            { key: 'trends', label: 'Trends', icon: 'trending-up' },
            { key: 'categories', label: 'Categories', icon: 'pie-chart' },
            { key: 'payment', label: 'Payment', icon: 'card' },
            { key: 'forecast', label: 'Forecast', icon: 'stats-chart' },
          ] as const).map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setActiveTab(tab.key as any)
              }}
              style={[
                styles.tabButton,
                {
                  backgroundColor: activeTab === tab.key ? theme.appPrimary : cardBg,
                  borderColor: activeTab === tab.key ? theme.appPrimary : borderColor,
                },
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? '#FFFFFF' : theme.textPrimary}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  {
                    color: activeTab === tab.key ? '#FFFFFF' : theme.textPrimary,
                    fontSize: getFontSize(12),
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Loading State */}
        {analytics.loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.appPrimary} />
            <Text style={[styles.loadingText, { color: theme.textPrimary + 'CC' }]}>
              Loading analytics...
            </Text>
          </View>
        )}

        {/* Error State */}
        {analytics.error && !analytics.loading && (
          <Animated.View entering={FadeInUp} style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
            <Text style={[styles.errorText, { color: theme.textPrimary }]}>
              {analytics.error}
            </Text>
            <Pressable
              onPress={fetchAnalytics}
              style={[styles.retryButton, { backgroundColor: theme.appPrimary }]}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Content */}
        {!analytics.loading && !analytics.error && (
          <>
            {/* Trends Tab */}
            {activeTab === 'trends' && (
              <Animated.View entering={FadeInUp.delay(400)} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary, fontSize: getFontSize(18) }]}>
                  Spending Trends
                </Text>
                {analytics.trends && analytics.trends.length > 0 ? (
                  <LineChart data={analytics.trends} />
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="trending-up-outline" size={48} color={theme.textPrimary + '50'} />
                    <Text style={[styles.emptyStateText, { color: theme.textPrimary + 'CC' }]}>
                      No spending data available for this period
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <Animated.View entering={FadeInUp.delay(400)} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary, fontSize: getFontSize(18) }]}>
                  Category Breakdown
                </Text>
                {analytics.categories && analytics.categories.length > 0 ? (
                  <>
                    <PieChart
                      data={analytics.categories.map((cat: any, index: number) => ({
                        label: cat.category_name || cat.category_id,
                        value: cat.total,
                        color: getCategoryColor(index),
                      }))}
                    />
                    <View style={styles.categoryList}>
                      {analytics.categories.map((cat: any, index: number) => (
                        <View key={cat.category_id} style={styles.categoryItem}>
                          <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(index) + '20' }]}>
                            <Ionicons
                              name={getCategoryIcon(cat.category_id) as any}
                              size={20}
                              color={getCategoryColor(index)}
                            />
                          </View>
                          <View style={styles.categoryInfo}>
                            <Text style={[styles.categoryName, { color: theme.textPrimary }]}>
                              {cat.category_name || cat.category_id}
                            </Text>
                            <Text style={[styles.categoryCount, { color: theme.textPrimary + 'CC' }]}>
                              {cat.count} {cat.count === 1 ? 'expense' : 'expenses'}
                            </Text>
                          </View>
                          <View style={styles.categoryAmount}>
                            <Text style={[styles.categoryAmountValue, { color: theme.textPrimary }]}>
                              {formatCurrency(cat.total)}
                            </Text>
                            <Text style={[styles.categoryPercentage, { color: theme.textPrimary + 'CC' }]}>
                              {cat.percentage}%
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="pie-chart-outline" size={48} color={theme.textPrimary + '50'} />
                    <Text style={[styles.emptyStateText, { color: theme.textPrimary + 'CC' }]}>
                      No category data available
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <Animated.View entering={FadeInUp.delay(400)} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary, fontSize: getFontSize(18) }]}>
                  Payment Method Analysis
                </Text>
                {analytics.paymentMethods && analytics.paymentMethods.length > 0 ? (
                  <>
                    <BarChart
                      data={analytics.paymentMethods.map((pm: any) => ({
                        label: pm.payment_method.replace('_', ' ').toUpperCase(),
                        value: pm.total,
                        color: getPaymentMethodColor(pm.payment_method),
                      }))}
                    />
                    <View style={styles.paymentMethodList}>
                      {analytics.paymentMethods.map((pm: any) => (
                        <View key={pm.payment_method} style={styles.paymentMethodItem}>
                          <View style={[styles.paymentMethodIconContainer, { backgroundColor: getPaymentMethodColor(pm.payment_method) + '20' }]}>
                            <Ionicons
                              name={pm.payment_method === 'upi' ? 'phone-portrait-outline' : pm.payment_method === 'card' ? 'card-outline' : 'cash-outline'}
                              size={20}
                              color={getPaymentMethodColor(pm.payment_method)}
                            />
                          </View>
                          <View style={styles.paymentMethodInfo}>
                            <Text style={[styles.paymentMethodName, { color: theme.textPrimary }]}>
                              {pm.payment_method.replace('_', ' ').toUpperCase()}
                            </Text>
                            <Text style={[styles.paymentMethodCount, { color: theme.textPrimary + 'CC' }]}>
                              {pm.count} {pm.count === 1 ? 'transaction' : 'transactions'}
                            </Text>
                          </View>
                          <View style={styles.paymentMethodAmount}>
                            <Text style={[styles.paymentMethodValue, { color: theme.textPrimary }]}>
                              {formatCurrency(pm.total)}
                            </Text>
                            <Text style={[styles.paymentMethodPercentage, { color: theme.textPrimary + 'CC' }]}>
                              {pm.percentage}%
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="card-outline" size={48} color={theme.textPrimary + '50'} />
                    <Text style={[styles.emptyStateText, { color: theme.textPrimary + 'CC' }]}>
                      No payment method data available
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Forecast Tab */}
            {activeTab === 'forecast' && (
              <Animated.View entering={FadeInUp.delay(400)} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary, fontSize: getFontSize(18) }]}>
                  Spending Forecast
                </Text>
                {analytics.forecast ? (
                  <View style={styles.forecastContainer}>
                    <View style={styles.forecastItem}>
                      <Ionicons name="calendar-outline" size={24} color={theme.appPrimary} />
                      <View style={styles.forecastInfo}>
                        <Text style={[styles.forecastLabel, { color: theme.textPrimary + 'CC' }]}>
                          Period
                        </Text>
                        <Text style={[styles.forecastValue, { color: theme.textPrimary, fontSize: getFontSize(16) }]}>
                          {analytics.forecast.period.charAt(0).toUpperCase() + analytics.forecast.period.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.forecastItem}>
                      <Ionicons name="trending-up-outline" size={24} color={theme.appPrimary} />
                      <View style={styles.forecastInfo}>
                        <Text style={[styles.forecastLabel, { color: theme.textPrimary + 'CC' }]}>
                          Projected Spending
                        </Text>
                        <Text style={[styles.forecastValue, { color: theme.textPrimary, fontSize: getFontSize(20) }]}>
                          {formatCurrency(analytics.forecast.projected)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.forecastItem}>
                      <Ionicons name="stats-chart-outline" size={24} color={theme.appPrimary} />
                      <View style={styles.forecastInfo}>
                        <Text style={[styles.forecastLabel, { color: theme.textPrimary + 'CC' }]}>
                          Average Daily
                        </Text>
                        <Text style={[styles.forecastValue, { color: theme.textPrimary, fontSize: getFontSize(16) }]}>
                          {formatCurrency(analytics.forecast.average)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.forecastTrend, {
                      backgroundColor: analytics.forecast.trend === 'increasing' ? '#FF3B30' + '20' :
                        analytics.forecast.trend === 'decreasing' ? '#34C759' + '20' : theme.appPrimary + '20',
                    }]}>
                      <Ionicons
                        name={analytics.forecast.trend === 'increasing' ? 'arrow-up' :
                          analytics.forecast.trend === 'decreasing' ? 'arrow-down' : 'remove'}
                        size={20}
                        color={analytics.forecast.trend === 'increasing' ? '#FF3B30' :
                          analytics.forecast.trend === 'decreasing' ? '#34C759' : theme.appPrimary}
                      />
                      <Text style={[styles.forecastTrendText, {
                        color: analytics.forecast.trend === 'increasing' ? '#FF3B30' :
                          analytics.forecast.trend === 'decreasing' ? '#34C759' : theme.appPrimary,
                      }]}>
                        {analytics.forecast.trend.charAt(0).toUpperCase() + analytics.forecast.trend.slice(1)} Trend
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="stats-chart-outline" size={48} color={theme.textPrimary + '50'} />
                    <Text style={[styles.emptyStateText, { color: theme.textPrimary + 'CC' }]}>
                      No forecast data available
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  tabButtonText: {
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pieChartWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChart: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    marginTop: 8,
    fontSize: 12,
  },
  chartLegend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  lineChartContainer: {
    marginVertical: 20,
  },
  lineChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  lineChartLabel: {
    fontSize: 10,
  },
  categoryList: {
    marginTop: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryPercentage: {
    fontSize: 12,
  },
  paymentMethodList: {
    marginTop: 20,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentMethodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodCount: {
    fontSize: 12,
  },
  paymentMethodAmount: {
    alignItems: 'flex-end',
  },
  paymentMethodValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentMethodPercentage: {
    fontSize: 12,
  },
  forecastContainer: {
    marginTop: 10,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  forecastInfo: {
    marginLeft: 16,
    flex: 1,
  },
  forecastLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  forecastValue: {
    fontWeight: '700',
  },
  forecastTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  forecastTrendText: {
    fontSize: 14,
    fontWeight: '600',
  },
})

export default AnalyticsPage

