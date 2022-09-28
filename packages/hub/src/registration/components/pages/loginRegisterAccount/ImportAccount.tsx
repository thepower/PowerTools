import React, { ChangeEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import classnames from 'classnames';
import { Button } from '@mui/material';
import {
  LoginRegisterAccountTabs,
  LoginRegisterAccountTabsLabels,
  RegistrationPageAdditionalProps,
} from '../../../typings/registrationTypes';
import { RegistrationBackground } from '../../common/RegistrationBackground';
import styles from '../../Registration.module.scss';
import { Tabs, AttachIcon } from '../../../../common';
import { Maybe } from '../../../../typings/common';
import { importAccountFromFile } from '../../../slice/registrationSlice';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  importAccountFromFile,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type ImportAccountProps = ConnectedProps<typeof connector> & RegistrationPageAdditionalProps;

class ImportAccountComponent extends React.PureComponent<ImportAccountProps, never> {
  private importAccountInput: Maybe<HTMLInputElement> = null;

  setImportAccountRef = (el: HTMLInputElement) => this.importAccountInput = el;

  handleOpenImportFile = () => {
    this.importAccountInput?.click();
  };

  handleImportAccount = (event: ChangeEvent<HTMLInputElement>) => {
    const { importAccountFromFile } = this.props;
    importAccountFromFile(event.target?.files?.[0]);
  };

  render() {
    const { tab, onChangeTab } = this.props;

    return <RegistrationBackground>
      <div className={styles.loginRegisterAccountTitle}>
        {'Create, login or import an account'}
      </div>
      <div className={styles.loginRegisterAccountHolder}>
        <Tabs
          tabs={LoginRegisterAccountTabs}
          tabsLabels={LoginRegisterAccountTabsLabels}
          value={tab}
          onChange={onChangeTab}
        />
        <div className={styles.importAccountFormHolder}>
          <div className={styles.importAccountFormDesc}>
            {'To import an account, upload the required file'}
          </div>
          <input
            ref={this.setImportAccountRef}
            className={styles.importAccountInput}
            onChange={this.handleImportAccount}
            type="file"
          />
          <Button
            className={classnames(styles.registrationNextButton, styles.registrationNextButton_outlined, styles.importAccountButton)}
            variant="outlined"
            size="large"
            onClick={this.handleOpenImportFile}
          >
            <AttachIcon />
            <span className={styles.importAccountButtonLabel}>
              {'Choose file'}
            </span>
          </Button>
        </div>
      </div>
    </RegistrationBackground>;
  }
}

export const ImportAccount = connector(ImportAccountComponent);
