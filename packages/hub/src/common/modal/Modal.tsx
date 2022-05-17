import React from 'react';
import {
  DialogProps,
  Dialog,
  DialogTitle,
} from '@mui/material';
import styles from './Modal.module.scss';

export interface ModalProps extends DialogProps {
  children?: JSX.Element | JSX.Element[];
  onClose: (data?: any) => void;
  disableCloseButton?: boolean;
  className?: string;
  titleClassName?: string;
}

const dialogClasses = {
  paper: styles.modal,
};

export const Modal: React.FC<ModalProps> = (props: ModalProps) => {
  const {
    open,
    onClose,
    children,
    className,
    title,
    titleClassName,
  } = props;

  return <Dialog
    open={open}
    onClose={onClose}
    className={className}
    classes={dialogClasses}
  >
    {
      title &&
      <DialogTitle className={titleClassName}>
        {title}
      </DialogTitle>
    }
    {children}
  </Dialog>;
};
