import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ApplicationState } from '../../application';
import { getWalletAddress } from '../selectors/accountSelectors';
import { DeepPageTemplate } from '../../common';
import { RoutesEnum } from '../../application/typings/routes';
import styles from './Account.module.scss';

const mapStateToProps = (state: ApplicationState) => ({
  walletAddress: getWalletAddress(state),
});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AccountPageProps = ConnectedProps<typeof connector>;

class AccountPageComponent extends React.PureComponent<AccountPageProps, {}> {
  constructor(props: AccountPageProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { walletAddress } = this.props;

    return <DeepPageTemplate
      topBarTitle={'My Account'}
      backUrl={RoutesEnum.root}
    >
      <div className={styles.accountPage}>
        <div>{walletAddress}</div>
      </div>
    </DeepPageTemplate>;
  }
}

export const AccountPage = connector(AccountPageComponent);
