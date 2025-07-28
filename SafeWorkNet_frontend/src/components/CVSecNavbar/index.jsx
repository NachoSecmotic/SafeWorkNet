import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import styles from './styles.module.scss';
import { redirectTo } from '../../utils/utils';

const { containerNavbar, active } = styles;

function CVSecNavbar({ intl }) {
  const [activeLi, setActiveLi] = useState('users');

  useEffect(() => {
    const currentPath = window.location.pathname;
    setActiveLi(currentPath);
  }, []);

  return (
    <div className={containerNavbar}>
      <ul>
        <li className={activeLi === '/dashboards' ? active : ''} onClick={() => redirectTo('dashboards')}>{intl.formatMessage({ id: 'leftMenu.options.dashboards' })}</li>
        <li className={activeLi === '/users' ? active : ''} onClick={() => redirectTo('users')}>{intl.formatMessage({ id: 'leftMenu.options.users' })}</li>
        <li className={activeLi.includes('devices') ? active : ''} onClick={() => redirectTo('devices')}>{intl.formatMessage({ id: 'leftMenu.options.devices' })}</li>
        <li className={activeLi.includes('videoStreams') ? active : ''} onClick={() => redirectTo('videoStreams')}>{intl.formatMessage({ id: 'leftMenu.options.videoStreams' })}</li>
        <li className={(activeLi.includes('aiModels') || activeLi.includes('aimodels')) ? active : ''} onClick={() => redirectTo('aiModels')}>{intl.formatMessage({ id: 'leftMenu.options.aiModels' })}</li>
        <li className={activeLi === '/notifications' ? active : ''} onClick={() => redirectTo('notifications')}>{intl.formatMessage({ id: 'leftMenu.options.notifications' })}</li>
      </ul>
    </div>
  );
}

export default injectIntl(CVSecNavbar);
