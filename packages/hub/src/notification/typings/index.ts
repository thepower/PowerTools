import { AlertColor } from '@mui/material/Alert/Alert';

export type NotificationType = {
  text?: string;
  type: AlertColor;
  autoHideDuration?: number | null;
  date?: string;
};
