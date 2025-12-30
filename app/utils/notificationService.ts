// app/utils/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addNotification } from '../redux/slice/notificationSlice';
import { store } from '../redux/store/store';
import { Notification } from '../redux/slice/notificationSlice';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Get push notification token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '57653156-0786-4eb2-be7c-650a04641d26', // From app.json
    });

    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners() {
  // Handle notification received while app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
    
    // Add notification to Redux store
    const notificationData: Notification = {
      _id: notification.request.identifier || Date.now().toString(),
      user_id: '', // Will be set by backend
      type: notification.request.content.data?.type || 'spending_summary',
      title: notification.request.content.title || '',
      message: notification.request.content.body || '',
      data: notification.request.content.data || {},
      is_read: false,
      is_pushed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.dispatch(addNotification(notificationData));
  });

  // Handle notification tapped/opened
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification tapped:', response);
    
    const data = response.notification.request.content.data;
    
    // Navigate based on notification type
    if (data?.budget_id) {
      // Navigate to budget details or budget list
      // You'll need to import router here if needed
    } else if (data?.expense_id) {
      // Navigate to expense details
    }
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Schedule a local notification (for testing or local reminders)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
) {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null = show immediately
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all notification permissions status
 */
export async function getNotificationPermissionsStatus() {
  return await Notifications.getPermissionsAsync();
}

