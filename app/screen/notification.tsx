import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Text, View, StyleSheet, ScrollView, Pressable, RefreshControl, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useTheme } from '../utils/color'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useIsDark from '../utils/useIsDark'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, useFocusEffect } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAppSettings } from '../context/AppSettingsContext'
import { useTextSize } from '../utils/useTextSize'
import { Notification } from '../redux/slice/notificationSlice'
import { RootState } from '../redux/store/store'

const NotificationPage = () => {
  const theme = useTheme()
  const isDark = useIsDark()
  const dispatch = useDispatch()
  const router = useRouter()
  const { getFontSize } = useTextSize()
  const notifications = useSelector((state: RootState) => state.notification.notifications)
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount)
  const loading = useSelector((state: RootState) => state.notification.loading)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const isInitialMount = useRef(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const filters: any = {}
      if (filter === 'unread') {
        filters.is_read = false
      }

      dispatch({ type: 'getNotifications', payload: { filters } })
      
      // Also fetch unread count
      dispatch({ type: 'getUnreadCount' })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [filter, dispatch])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchNotifications()
  }, [fetchNotifications])

  // Reset isRefreshing when loading completes
  useEffect(() => {
    if (!loading && isRefreshing) {
      setIsRefreshing(false)
    }
  }, [loading, isRefreshing])

  // Fetch notifications when screen comes into focus (initial mount and when returning to screen)
  useFocusEffect(
    useCallback(() => {
      fetchNotifications()
    }, [fetchNotifications])
  )

  // Fetch notifications when filter changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    fetchNotifications()
  }, [filter])

  const markAsRead = useCallback(async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Mark as read optimistically (handled by Redux)
    dispatch({ type: 'markAsRead', payload: { id } })
    
    // Refetch notifications after a short delay to ensure the backend has updated
    // This is especially important when on "Unread" filter - the notification should disappear
    setTimeout(() => {
      fetchNotifications()
      dispatch({ type: 'getUnreadCount' })
    }, 500)
  }, [dispatch, fetchNotifications])

  const markAllAsRead = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: () => {
            dispatch({ type: 'markAllAsRead' })
            
            // Refetch notifications after marking all as read to update the list
            // This ensures the list is updated correctly, especially on "Unread" filter
            setTimeout(() => {
              fetchNotifications()
              dispatch({ type: 'getUnreadCount' })
            }, 500)
          }
        }
      ]
    )
  }, [dispatch, fetchNotifications])

  const deleteNotification = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'deleteNotification', payload: { id } })
            dispatch({ type: 'getUnreadCount' })
          }
        }
      ]
    )
  }, [dispatch])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'budget_alert':
        return 'warning'
      case 'budget_threshold':
        return 'trending-up'
      case 'bill_reminder':
        return 'calendar'
      case 'spending_summary':
        return 'stats-chart'
      default:
        return 'notifications'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'budget_alert':
        return '#FF3B30'
      case 'budget_threshold':
        return '#FF9500'
      case 'bill_reminder':
        return '#007AFF'
      case 'spending_summary':
        return '#34C759'
      default:
        return theme.primary
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Show loader on initial load when there are no notifications
  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontSize: getFontSize(24) }]}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={[styles.markAllText, { color: theme.primary }]}>Mark All Read</Text>
          </Pressable>
        )}
      </View>

      {/* Filter Tabs - Glassy Design */}
      <View style={styles.filterContainer}>
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
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setFilter('all')
            }}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === 'all' ? theme.appPrimary : 'transparent',
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              }
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filter === 'all' ? 'white' : theme.textPrimary + '80' },
                { fontSize: getFontSize(16) },
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setFilter('unread')
            }}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === 'unread' ? theme.appPrimary : 'transparent',
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
              }
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filter === 'unread' ? 'white' : theme.textPrimary + '80' },
                { fontSize: getFontSize(16) },
              ]}
            >
              Unread
              {unreadCount > 0 && (
                <Text style={[styles.badge, { backgroundColor: '#FF3B30' }]}> {unreadCount}</Text>
              )}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'} />
            <Text style={[styles.emptyText, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }, { fontSize: getFontSize(16) }]}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification._id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderLeftWidth: notification.is_read ? 0 : 4,
                  borderLeftColor: getNotificationColor(notification.type),
                },
              ]}
            >
              <View style={styles.notificationContent}>
                <View style={styles.iconWrapper}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: notification.is_read
                          ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
                          : `${getNotificationColor(notification.type)}30`,
                        borderWidth: notification.is_read ? 1 : 0,
                        borderColor: notification.is_read
                          ? (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)')
                          : 'transparent',
                      },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type) as any}
                      size={24}
                      color={
                        notification.is_read
                          ? (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)')
                          : getNotificationColor(notification.type)
                      }
                    />
                  </View>
                  {notification.is_read && (
                    <Text
                      style={[
                        styles.readLabel,
                        {
                          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                          fontSize: getFontSize(10),
                        },
                      ]}
                    >
                      Read
                    </Text>
                  )}
                </View>
                <View style={styles.notificationTextContainer}>
                  <View style={styles.notificationHeader}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        {
                          color: notification.is_read
                            ? (isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.7)')
                            : theme.textPrimary,
                          fontWeight: notification.is_read ? '500' : '700',
                          fontSize: getFontSize(16),
                        },
                      ]}
                    >
                      {notification.title}
                    </Text>
                    {!notification.is_read && (
                      <View style={[styles.unreadDot, { backgroundColor: getNotificationColor(notification.type) }]} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.notificationMessage,
                      {
                        color: notification.is_read
                          ? (isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.7)')
                          : (isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'),
                        fontSize: getFontSize(14),
                      },
                    ]}
                  >
                    {notification.message}
                  </Text>
                  <Text
                    style={[
                      styles.notificationTime,
                      {
                        color: notification.is_read
                          ? (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)')
                          : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'),
                        fontSize: getFontSize(12),
                      },
                    ]}
                  >
                    {formatDate(notification.createdAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.notificationActions}>
                {!notification.is_read && (
                  <TouchableOpacity
                    onPress={() => markAsRead(notification._id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color={theme.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => deleteNotification(notification._id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default NotificationPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontWeight: '700',
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
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
    fontWeight: '600',
  },
  badge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    alignItems: 'center',
    marginRight: 12,
    width: 48,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readLabel: {
    marginTop: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    marginTop: 4,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
})
