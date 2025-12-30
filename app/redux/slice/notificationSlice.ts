// app/redux/slice/notificationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  _id: string;
  user_id: string;
  type: 'budget_alert' | 'budget_threshold' | 'bill_reminder' | 'spending_summary';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  is_pushed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Get notifications
    getNotificationsRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    getNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => {
      state.loading = false;
      state.notifications = action.payload;
    },
    getNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Get unread count
    getUnreadCountRequest: (state) => {
      // No loading state for unread count
    },
    getUnreadCountSuccess: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    getUnreadCountFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    // Mark as read
    markAsReadRequest: (state, action: PayloadAction<string>) => {
      // Optimistically update
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification) {
        notification.is_read = true;
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      }
    },
    markAsReadSuccess: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n._id === action.payload._id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },
    markAsReadFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      // Note: We can't revert optimistic update here because action.payload is the error message
      // The notification ID is lost. In a production app, you'd want to store the notification ID
      // separately or refetch notifications on error.
    },
    
    // Mark all as read
    markAllAsReadRequest: (state) => {
      // Optimistically update
      state.notifications.forEach(n => {
        n.is_read = true;
      });
      state.unreadCount = 0;
    },
    markAllAsReadSuccess: (state) => {
      // Already updated optimistically
    },
    markAllAsReadFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    // Delete notification
    deleteNotificationRequest: (state, action: PayloadAction<string>) => {
      // Optimistically remove
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.is_read) {
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      }
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },
    deleteNotificationSuccess: (state) => {
      // Already updated optimistically
    },
    deleteNotificationFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    // Add new notification (for real-time updates)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    
    // Update unread count
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});

export const {
  getNotificationsRequest,
  getNotificationsSuccess,
  getNotificationsFailure,
  getUnreadCountRequest,
  getUnreadCountSuccess,
  getUnreadCountFailure,
  markAsReadRequest,
  markAsReadSuccess,
  markAsReadFailure,
  markAllAsReadRequest,
  markAllAsReadSuccess,
  markAllAsReadFailure,
  deleteNotificationRequest,
  deleteNotificationSuccess,
  deleteNotificationFailure,
  addNotification,
  updateUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;

