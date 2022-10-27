import React, { useCallback, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  BuySvg,
  CopySvg,
  FaucetSvg,
  LogoIcon,
  SendSvg,
  WalletsSvg,
} from 'common/icons';
import { ArrowLink, CardLink } from 'common';
import styles from './AssetsSection.module.scss';
import { getWalletAddress } from '../../account/selectors/accountSelectors';
import { RootState } from '../../application/store';

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AssetsSectionProps = ConnectedProps<typeof connector>;

const AssetsSection = ({ walletAddress }: AssetsSectionProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    if (ref.current) {
      navigator.clipboard.writeText(ref.current.textContent || '');
    }
  }, []);

  return (
    <div>
      <ArrowLink size="large" direction="right" to="my-assets">
        {'My assets'}
      </ArrowLink>
      <div className={styles.box}>
        <div className={styles.majorWallet}>
          <p className={styles.total}>
            <LogoIcon className={styles.icon} />
            {'47 002.007'}
          </p>
          <button type="button" className={styles.addressButton} ref={ref} onClick={handleClick}>
            {walletAddress}
            <CopySvg className={styles.copyIcon} />
          </button>
        </div>
        <div className={styles.cards}>
          <CardLink to="/my-assets" label="Wallets">
            <WalletsSvg />
          </CardLink>
          <CardLink to="/faucet" label="Faucet">
            <FaucetSvg />
          </CardLink>
          <CardLink to="/send" label="Send">
            <SendSvg />
          </CardLink>
          <CardLink to="/buy" label="Buy">
            <BuySvg />
          </CardLink>
        </div>
      </div>
    </div>
  );
};

export default connector(AssetsSection);
