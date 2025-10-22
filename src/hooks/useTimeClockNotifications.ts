import { useState, useEffect, useCallback } from 'react';
import timeClockNotificationService, { TimeClockNotification } from '../services/timeClockNotificationService';

interface UseTimeClockNotificationsReturn {
  notifications: TimeClockNotification[];
  unreadCount: number;
  pendingApprovalCount: number;
  overtimeRequestCount: number;
  geolocationIssueCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
  getNotificationsByType: (tipo: TimeClockNotification['tipo']) => TimeClockNotification[];
}

export const useTimeClockNotifications = (): UseTimeClockNotificationsReturn => {
  const [notifications, setNotifications] = useState<TimeClockNotification[]>([]);

  // Atualizar notificações
  const refreshNotifications = useCallback(() => {
    const allNotifications = timeClockNotificationService.getNotificationsByType('pending_approval')
      .concat(timeClockNotificationService.getNotificationsByType('overtime_request'))
      .concat(timeClockNotificationService.getNotificationsByType('geolocation_issue'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setNotifications(allNotifications);
  }, []);

  // Carregar notificações iniciais
  useEffect(() => {
    timeClockNotificationService.loadTimeClockNotifications();
    refreshNotifications();
  }, [refreshNotifications]);

  // Marcar como lida
  const markAsRead = useCallback((notificationId: string) => {
    timeClockNotificationService.markAsRead(notificationId);
    refreshNotifications();
  }, [refreshNotifications]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    notifications.forEach(notification => {
      if (!notification.lida) {
        timeClockNotificationService.markAsRead(notification.id);
      }
    });
    refreshNotifications();
  }, [notifications, refreshNotifications]);

  // Obter notificações por tipo
  const getNotificationsByType = useCallback((tipo: TimeClockNotification['tipo']) => {
    return notifications.filter(n => n.tipo === tipo);
  }, [notifications]);

  // Calcular contadores
  const unreadCount = notifications.filter(n => !n.lida).length;
  const pendingApprovalCount = notifications.filter(n => n.tipo === 'pending_approval' && !n.lida).length;
  const overtimeRequestCount = notifications.filter(n => n.tipo === 'overtime_request' && !n.lida).length;
  const geolocationIssueCount = notifications.filter(n => n.tipo === 'geolocation_issue' && !n.lida).length;

  return {
    notifications,
    unreadCount,
    pendingApprovalCount,
    overtimeRequestCount,
    geolocationIssueCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    getNotificationsByType
  };
};

export default useTimeClockNotifications;
