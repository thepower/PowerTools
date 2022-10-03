import React, { useCallback, useRef } from 'react';
import LinkButton from '../../common/linkButton/LinkButton';
import { ReactComponent as LogoIcon } from './logo.svg';
import { ReactComponent as CopySvg } from './copy.svg';
import styles from './AssetsSection.module.scss';

const AssetsSection = () => {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    if (ref.current) {
      navigator.clipboard.writeText(ref.current.textContent || '');
    }
  }, []);

  return (
    <div>
      <LinkButton size="large" direction="right" to="my-assets">
        {'My assets'}
      </LinkButton>
      <div className={styles.box}>
        <div className={styles.majorWallet}>
          <p className={styles.info}>
            {'How much is the fish'}
          </p>
          <p className={styles.total}>
            <LogoIcon className={styles.icon} />
            {'47 002.007'}
          </p>
          <button type="button" className={styles.addressButton} ref={ref} onClick={handleClick}>
            {'AA030000174483054062'}
            <CopySvg className={styles.copyIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsSection;
