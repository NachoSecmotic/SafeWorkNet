import React from 'react';
import { injectIntl } from 'react-intl';
import CVSecHeader from '../CVSecHeader';
import CVSecNavbar from '../CVSecNavbar';
import styles from './styles.module.scss';

const { containerTemplate, containerRestPage } = styles;

function CVSecTemplate({ children }) {
  return (
    <div className={containerTemplate}>
      <CVSecHeader />
      <CVSecNavbar />
      <div className={containerRestPage}>
        {children}
      </div>
    </div>
  );
}

export default injectIntl(CVSecTemplate);
