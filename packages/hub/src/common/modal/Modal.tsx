import React from 'react';
import {
  DialogProps,
  Dialog,
  DialogContent,
} from '@mui/material';
import classnames from 'classnames';
import styles from './Modal.module.scss';
import { PELogo } from '../icons/PELogo';

export interface ModalProps extends DialogProps {
  children?: JSX.Element | JSX.Element[];
  onClose: (data?: any) => void;
  className?: string;
  contentClassName?: string;
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
    contentClassName,
  } = props;

  return <Dialog
    open={open}
    onClose={onClose}
    className={classnames(styles.modalRoot, className)}
    classes={dialogClasses}
  >
    <DialogContent className={classnames(contentClassName, styles.modalContent)}>
      <PELogo />
      {children}
    </DialogContent>
  </Dialog>;
};
