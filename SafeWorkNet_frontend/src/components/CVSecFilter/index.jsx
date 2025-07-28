import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import chevron from '../../resources/chevron.svg';
import styles from './styles.module.scss';
import { getHash } from '../../utils/utils';

const {
  containerFilter, chevronDown, optionsList, checkbox, check, hideOptions,
} = styles;

function CVSecFilter({
  id, page, imgFilter, title, options, intl,
}) {
  const [checkboxes, setCheckboxes] = useState({});
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const newCheckboxes = {};
    options.forEach((_, indx) => {
      newCheckboxes[`${id}-${indx}`] = false;
    });
    setCheckboxes(newCheckboxes);
  }, [id, options]);

  const handleCheck = (key) => {
    const newCheckboxes = { ...checkboxes };
    newCheckboxes[key] = !checkboxes[key];
    setCheckboxes(newCheckboxes);
  };

  return (
    <button
      type="button"
      alt=""
      onClick={() => setShowOptions((prev) => !prev)}
      className={containerFilter}
    >
      <img src={imgFilter} alt={title} />
      <img src={chevron} alt="" className={chevronDown} />
      <div className={`${optionsList} ${showOptions ? '' : hideOptions}`}>
        {options.map((option, indx) => (
          <ul key={getHash(indx.toString())}>
            <li onClick={() => handleCheck(`${id}-${indx}`)}>
              <div className={checkbox}>
                {checkboxes[`${id}-${indx}`] && <div className={check}>X</div>}
              </div>
              <span>{intl.formatMessage({ id: `${page}.filter.${id}.${option}` })}</span>
            </li>
          </ul>
        ))}
      </div>
    </button>
  );
}

export default injectIntl(CVSecFilter);
