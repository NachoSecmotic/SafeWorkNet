import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import magnifier from '../../resources/pages/dashboards/magnifier.svg';
import styles from './styles.module.scss';

const { cvSecSearch, iconSearch } = styles;

function CVSecSearch({ onSearh, className, placeholder }) {
  const [valueToSearch, setValueToSearch] = useState('');

  const handlePressKeySearch = (e) => {
    if (e.keyCode === 13) {
      onSearh(valueToSearch);
    }
  };

  return (
    <div className={`${cvSecSearch} ${className ?? ''}`}>
      <input
        type="text"
        id="cvSecSearchInput"
        placeholder={placeholder ?? ''}
        onChange={(e) => setValueToSearch(e.target.value ?? '')}
        onKeyUp={(e) => handlePressKeySearch(e)}
      />
      <button
        type="button"
        alt="ss"
        onClick={() => onSearh(valueToSearch)}
        className={iconSearch}
      >
        <img src={magnifier} alt="" />
      </button>
    </div>
  );
}

export default injectIntl(CVSecSearch);
