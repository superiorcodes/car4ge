import React, { useState, useEffect } from 'react';
import { Bell, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../lib/notificationService';
import { Database } from '../lib/database.types';
import { Link } from 'react-router-dom';

type Notification = Database['public']['Tables']['notifications']['Row'];

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(5),
          notificationService.getUnreadCount(),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    const unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  try {
                    await notificationService.markAllAsRead();
                    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                    setUnreadCount(0);
                  } catch (error) {
                    console.error('Failed to mark all as read:', error);
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.is_read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.is_read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium border-t border-gray-200 hover:bg-gray-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
