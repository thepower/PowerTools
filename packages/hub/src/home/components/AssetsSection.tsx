import React from 'react';
import {
  BuySvg,
  FaucetSvg,
  LogoIcon,
  SendSvg,
  WalletsSvg,
} from 'common/icons';
import { ArrowLink, CardLink, CopyButton } from 'common';
import { getWalletAddress } from '../../account/selectors/accountSelectors';
import { useAppSelector } from '../../application/store';
import { getWalletAmount } from '../../myAssets/selectors/walletSelectors';
import styles from './AssetsSection.module.scss';

const AssetsSection = () => {
  const amount = useAppSelector(getWalletAmount);
  const walletAddress = useAppSelector(getWalletAddress);

  return (
    <div>
      <ArrowLink size="large" direction="right" to="my-assets">
        {'My assets'}
      </ArrowLink>
      <div className={styles.box}>
        <div className={styles.majorWallet}>
          <p className={styles.info}>
            How much is the fish
          </p>
          <p className={styles.total}>
            <LogoIcon className={styles.icon} />
            {amount}
          </p>
          <CopyButton
            textButton={walletAddress}
            className={styles.addressButton}
            iconClassName={styles.copyIcon}
          />
        </div>
        <div className={styles.cards}>
          <CardLink to="/my-assets" label="Wallets">
            <WalletsSvg />
          </CardLink>
          <CardLink label="Faucet" isAnchor to="https://faucet.thepower.io/" target="_blank" rel="noreferrer">
            <FaucetSvg />
          </CardLink>
          <CardLink to="/send" label="Send">
            <SendSvg />
          </CardLink>
          <CardLink disabled to="/buy" label="Buy">
            <BuySvg />
          </CardLink>
        </div>
      </div>
    </div>
  );
};

export default AssetsSection;
