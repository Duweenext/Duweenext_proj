// src/notifications/typesNotification.ts
export type NotificationSeverity = 'info' | 'warning' | 'success' | 'error';

export type NotificationItem = {
  id: string;                 // stable backend ID
  title: string;              // e.g., "DuweeNext"
  headline: string;           // e.g., "Your pond EC value is too low!"
  message: string;            // body
  createdAt: string;          // ISO e.g., "2025-01-12T19:02:00Z"
  severity: NotificationSeverity;
  icon?: React.ReactNode;     // optional custom icon
  read?: boolean;             // optional for future
};
