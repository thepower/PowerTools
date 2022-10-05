export enum NotificationTypeEnum {
  info = 'info',
  warning = 'warning',
  success = 'success',
  error = 'error',
  plain = 'plain',
}

export type NotificationType = {
  text?: string;
  type: NotificationTypeEnum;
  autoHideDuration?: number | null;
  date?: string;
};
