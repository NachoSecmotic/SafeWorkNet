import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import iconProfile from '../../resources/header/iconProfile.svg';
import chevron from '../../resources/chevron.svg';
import iconLogout from '../../resources/header/logout.svg';
import iconSettings from '../../resources/header/settings.svg';
import styles from './styles.module.scss';
import { logout } from '../../services/redux/auth/slice';
import { useLogoutMutation } from '../../services/redux/auth/api';

const {
  containerHeader, containerButtonHeader, menuButtonHeader, chevronDown, menuVisible,
  imgIconProfile,
} = styles;

function CVSecHeader({ intl }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className={containerHeader}>
      <div className={containerButtonHeader}>
        <button type="button" onClick={() => setShowMenu((prev) => !prev)}>
          <img className={imgIconProfile} src={iconProfile} alt="logo" />
          <img src={chevron} alt="" className={chevronDown} style={{ transform: showMenu ? 'rotate(90deg)' : '' }} />
        </button>
        <div className={menuButtonHeader}>
          <ul className={`${showMenu ? menuVisible : ''}`}>
            <li>
              <img src={iconSettings} alt={intl.formatMessage({ id: 'header.loginButton.options.profileSettings' })} />
              {intl.formatMessage({ id: 'header.loginButton.options.profileSettings' })}
            </li>
            <li onClick={() => handleLogout()}>
              <img src={iconLogout} alt={intl.formatMessage({ id: 'header.loginButton.options.logout' })} />
              {intl.formatMessage({ id: 'header.loginButton.options.logout' })}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(CVSecHeader);
