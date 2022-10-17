import React, { useCallback } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { AlertColor } from '@mui/material/Alert/Alert';
import { hideNotification } from '../slice/notificationSlice';
import styles from './Notification.module.scss';
import { ApplicationState } from '../../../application';

const mapStateToProps = (state: ApplicationState) => ({
  notification: state.notification.currentNotification,
});

const mapDispatchToProps = {
  hideNotification,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type NotificationProps = ConnectedProps<typeof connector>;

const options: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'center',
};

const classes = {
  root: styles.snackbarRoot,
};

const NotificationComponent: React.FC<NotificationProps> = (props) => {
  const { notification, hideNotification } = props;

  const handleClose = useCallback(() => {
    hideNotification();
  }, [hideNotification]);

  if (!notification) {
    return null;
  }

  return <Snackbar
    open={Boolean(notification)}
    autoHideDuration={notification.autoHideDuration || 4000}
    onClose={handleClose}
    classes={classes}
    anchorOrigin={options}
  >
    <Alert variant="filled" onClose={handleClose} severity={notification.type as AlertColor}>
      {notification.text}
    </Alert>
  </Snackbar>;
};

export const Notification = connector(NotificationComponent);
