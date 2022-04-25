import React from 'react';
import classnames from 'classnames';
import { branchCallFunction } from '../utils/common';
import styles from './Linkblock.module.scss';
import { UnknownFunctionType } from '../typings/common';
import { Button } from '@mui/material';

interface LinkBlockProps {
  className?: string;
  title: string;
  titleClassName?: string;
  description?: string;
  descriptionClassName?: string;
  contentRenderer?: UnknownFunctionType;
  buttonTitle?: string;
  onClick?: any;
}

export const LinkBlock: React.FC<LinkBlockProps> = (props) => {
  const {
    title,
    titleClassName,
    description,
    descriptionClassName,
    buttonTitle = '→',
    contentRenderer,
    className,
    onClick,
  } = props;

  const renderLink = React.useCallback(() => {
    return <div>
      <div className={classnames(styles.title, titleClassName)}>{title}</div>
      <div className={classnames(descriptionClassName)}>{description}</div>
      <Button
        color={'primary'}
        variant="contained"
        className={styles.linkButton}>
        {buttonTitle}
      </Button>
    </div>
  }, [buttonTitle, description, descriptionClassName, title, titleClassName]);

  return <div className={classnames(styles.linkBlock, className)} onClick={onClick}>
    {branchCallFunction(contentRenderer, renderLink)}
  </div>
};
