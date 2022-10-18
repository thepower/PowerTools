import React from 'react';
import {
  CreateIcon,
  ImportIcon,
  ExportIcon,
  ResetIcon,
} from 'common/icons';
import { Maybe } from '../../typings/common';
import styles from './Account.module.scss';

type AccountItemType = {
  title: string;
  action: Maybe<(data?: any) => void>;
  Icon: any;
  disabled: boolean;
};

export class AccountActionsList extends React.PureComponent<{}, {}> {
  private accountActionsData: AccountItemType[] = [
    {
      title: 'Create new account',
      action: null,
      Icon: CreateIcon,
      disabled: true,
    },
    {
      title: 'Export account',
      action: null,
      Icon: ExportIcon,
      disabled: true,
    },
    {
      title: 'Import account',
      action: null,
      Icon: ImportIcon,
      disabled: true,
    },
    {
      title: 'Reset account',
      action: null,
      Icon: ResetIcon,
      disabled: true,
    },
  ];

  renderActionItem = (item: AccountItemType) => {
    const { Icon, title } = item;

    return <div className={styles.accountAction} key={title}>
      <Icon className={styles.icon} />
      <span className={styles.accountActionText}>{title}</span>
    </div>;
  };

  render() {
    return <div className={styles.accountActionsHolder}>
      {this.accountActionsData.map(this.renderActionItem)}
    </div>;
  }
}
