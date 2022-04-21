import React from 'react';
import classnames from 'classnames';
import styles from './Page.module.scss';

interface PageProps extends React.ComponentProps<any> {
  className?: string;
  contentClassName?: string;
  loading?: boolean;
}

export const Page: React.FC<PageProps> = (props: PageProps) => {
  const {
    className,
    contentClassName,
    children,
  } = props;

  return <div className={classnames(styles.page, className)}>
    <div className={classnames(contentClassName, styles.pageContent)}>
      {children}
    </div>
  </div>;
};
