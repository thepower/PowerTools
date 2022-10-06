import React, { PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import cn from 'classnames';
import styles from './CardLink.module.scss';

type CardLinkProps = LinkProps & {
  label: string;
  disabled?: boolean;
};

const CardLink: React.FC<PropsWithChildren<CardLinkProps>> = ({
  children,
  className,
  label,
  disabled,
  ...linkProps
}) => (
  <Link
    {...linkProps}
    aria-disabled={disabled}
    className={cn(styles.card, className)}
  >
    {children}
    <span className={styles.text}>
      {label}
    </span>
  </Link>
);

export default CardLink;
