import React from 'react';
import classnames from 'classnames';
import { branchCallFunction } from '../utils/common';
import styles from './Linkblock.module.scss';
import { UnknownFunctionType } from '../typings/common';

interface LinkBlockProps {
  className?: string;
  title: string;
  titleClassName?: string;
  description?: string;
  descriptionClassName?: string;
  contentRenderer?: UnknownFunctionType;
  buttonRenderer?: UnknownFunctionType;
  onClick?: any;
}

export const LinkBlock: React.FC<LinkBlockProps> = (props) => {
  const {
    title,
    titleClassName,
    description,
    descriptionClassName,
    buttonRenderer,
    contentRenderer,
    className,
    onClick,
  } = props;

  const renderLink = React.useCallback(() => {
    return <div>
      <div className={classnames(styles.title, titleClassName)}>{title}</div>
      <div className={classnames(descriptionClassName)}>{description}</div>
      {branchCallFunction(buttonRenderer)}
    </div>
  }, [buttonRenderer, description, descriptionClassName, title, titleClassName]);

  return <div className={classnames(styles.linkBlock, className)} onClick={onClick}>
    {branchCallFunction(contentRenderer, renderLink)}
  </div>
};
