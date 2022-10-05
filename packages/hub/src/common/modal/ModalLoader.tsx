import React from 'react';
import { Modal, ModalProps } from './Modal';
import { Loader } from '../loader/Loader';

export interface ModalLoaderProps extends ModalProps {
  loadingTitle: string;
  completeTitle: string;
  loading: boolean;
}

export const ModalLoader: React.FC<ModalLoaderProps> = (props: ModalLoaderProps) => {
  const {
    loading,
    loadingTitle,
    completeTitle,
    ...modalProps
  } = props;

  return <Modal {...modalProps}>
    {
      loading
        ? <>
          <Loader />
          <div>{loadingTitle}</div>
        </>
        : <div>{completeTitle}</div>
    }
  </Modal>;
};
