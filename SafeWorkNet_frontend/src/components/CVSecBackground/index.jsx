import React from 'react';
import { injectIntl } from 'react-intl';
import backgroundSecureyeLogo from '../../resources/backgroundSecureye.png';
import styles from './styles.module.scss';

const { cvsecBackground, backgroundImage } = styles;

function CVSecBackground({ intl }) {
  return (
    <div className={cvsecBackground}>
      <div className={backgroundImage}>
        <img src={backgroundSecureyeLogo} alt={intl.formatMessage({ id: 'cvsecBackground' })} />
      </div>
    </div>
  );
}

export default injectIntl(CVSecBackground);
