import React from 'react';
import { injectIntl } from 'react-intl';
import iconList from '../../resources/pages/dashboards/list.svg';
import iconMarkerMap from '../../resources/pages/dashboards/maker_map.svg';
import CVSecSwitch from '../CVSecSwitch';
import { redirectTo } from '../../utils/utils';
import styles from './styles.module.scss';

const {
  containerMenuLeft, active, containerIcon, buttonIcon,
} = styles;

function CVSecMenuLeft({ intl, setShowMap }) {
  return (
    <div className={containerMenuLeft}>
      <div className={containerIcon}>
        <button className={buttonIcon} type="button" alt={intl.formatMessage({ id: 'accessibility.dashboards.buttonList' })} onClick={() => {}}>
          <img src={iconList} alt={intl.formatMessage({ id: 'accessibility.dashboards.iconList' })} />
        </button>
        <CVSecSwitch onClick={() => setShowMap()} />
        <button className={buttonIcon} type="button" alt={intl.formatMessage({ id: 'accessibility.dashboards.buttonMarkerMap' })} onClick={() => {}}>
          <img src={iconMarkerMap} alt={intl.formatMessage({ id: 'accessibility.dashboards.iconMarkerMap' })} />
        </button>
      </div>
      <ul>
        <li className={active} onClick={() => redirectTo('dashboards')}>{intl.formatMessage({ id: 'leftMenu.options.dashboards' })}</li>
        <li onClick={() => redirectTo('users')}>{intl.formatMessage({ id: 'leftMenu.options.users' })}</li>
        <li onClick={() => redirectTo('devices')}>{intl.formatMessage({ id: 'leftMenu.options.devices' })}</li>
        <li onClick={() => redirectTo('videoStreams')}>{intl.formatMessage({ id: 'leftMenu.options.videoStreams' })}</li>
        <li onClick={() => redirectTo('aiModels')}>{intl.formatMessage({ id: 'leftMenu.options.aiModels' })}</li>
        <li onClick={() => redirectTo('notifications')}>{intl.formatMessage({ id: 'leftMenu.options.notifications' })}</li>
      </ul>
    </div>
  );
}

export default injectIntl(CVSecMenuLeft);
