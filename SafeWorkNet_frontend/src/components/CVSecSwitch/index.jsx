import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import styles from './styles.module.scss';

const { cvSecSwitch, switchButton, switchEnabled } = styles;

function CVSecSwitch({ onClick }) {
  const [leftPosition, setLeftPosition] = useState(true);

  const handleSwitch = () => {
    setLeftPosition((prev) => !prev);
    onClick();
  };

  return (
    <button
      type="button"
      id="buttonSwicht"
      alt="ss"
      onClick={() => handleSwitch()}
      className={cvSecSwitch}
    >
      <div className={`${switchButton} ${leftPosition ? '' : switchEnabled}`} />
    </button>
  );
}

export default injectIntl(CVSecSwitch);
