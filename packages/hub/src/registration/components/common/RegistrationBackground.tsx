import React from 'react';
import styles from '../Registration.module.scss';

interface RegistrationBackgroundProps extends React.PropsWithChildren {}

export const RegistrationBackground: React.FC<RegistrationBackgroundProps> = (props: RegistrationBackgroundProps) => {
  return <div className={styles.registrationBackground}>
    {props.children}
  </div>;
};
