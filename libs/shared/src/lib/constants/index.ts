export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: 'auth.register',
    LOGIN: 'auth.login',
    GET_PROFILE: 'auth.getProfile',
    REFRESH: 'auth.refresh',
  },
  USER: {
    CREATE: 'user.create',
    FIND_ALL: 'user.findAll',
    FIND_ONE: 'user.findOne',
    UPDATE: 'user.update',
    REMOVE: 'user.remove',
  },
  NOTIFICATION: {
    SEND: 'notification.send',
    GET_USER_NOTIFICATIONS: 'notification.getUserNotifications',
    MARK_AS_READ: 'notification.markAsRead',
  },
} as const;

export const SERVICE_PORTS = {
  API_GATEWAY: 3000,
  AUTH_SERVICE: 3001,
  USER_SERVICE: 3002,
  NOTIFICATION_SERVICE: 3003,
} as const;
