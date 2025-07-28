import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { format } from 'date-fns';
import { Check } from 'react-bootstrap-icons';
import styles from '../styles.module.scss';
import { formatLocation, CollapseLocation } from '../../../utils/utils';

const {
  rowBody, literalBody, checkBoxContainer, checkBoxElement,
  check, firstCell, containerActions, secondCell, autoWrapCell,
} = styles;

function TableBody({
  intl, body = [], name, headers, actions, selectabled, checkBoxList,
  setCheckBoxList, setcheckBoxHeader, limitRows, isNotifications = false,
}) {
  const [changeCheckBox, setChangeCheckBox] = useState(false);

  const selectRow = (idRow) => {
    const initialValueAll = checkBoxList[idRow].checked;
    setCheckBoxList((prev) => ({
      ...prev,
      [idRow]: { name: prev[idRow].name, checked: !initialValueAll },
    }));
  };

  useEffect(() => {
    const checkBoxChecked = document.querySelectorAll('.btnCheckBox svg').length;
    setcheckBoxHeader((checkBoxChecked === limitRows));
  }, [changeCheckBox, limitRows, setcheckBoxHeader]);

  const hasOwnProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

  return (
    <tbody>
      {body.map((row) => (
        <tr key={`${row.id}-tr`} className={rowBody}>
          {selectabled && (
            <td className={firstCell} key={row.id}>
              <div className={checkBoxContainer}>
                <button type="button" className={`${checkBoxElement} btnCheckBox`} onClick={() => { setChangeCheckBox((prev) => !prev); selectRow(row.id); }}>
                  {checkBoxList[row.id]?.checked && <Check className={check} />}
                </button>
              </div>
            </td>
          )}
          {Object.keys(headers).map((key) => {
            if (!hasOwnProperty(row, key)) {
              return null;
            }
            const value = row[key];
            const notAllowed = isNotifications ? ['updatedAt'] : ['createdAt', 'updatedAt', 'screenSections'];
            let valueFormated = '';
            let classCell = '';

            if (!notAllowed.includes(key)) {
              let valueTD = '';
              switch (key) {
                case 'type':
                case 'status':
                  valueFormated = value.toLowerCase().replace(/\s+/g, '');
                  valueTD = intl.formatMessage({ id: `${name}.table.${key}.${valueFormated}` });
                  break;
                case 'location': {
                  const formattedLocation = formatLocation(value);
                  const shouldCollapse = CollapseLocation(value);
                  classCell = `contentCentredColumn ${autoWrapCell} ${shouldCollapse ? 'collapsed' : ''}`;
                  if (formattedLocation) {
                    if (shouldCollapse) {
                      valueTD = formattedLocation.split(',').map((coordinate, index) => (
                        <div key={`${row.id}-${coordinate.trim()}`}>
                          {coordinate.trim()}
                          {index === 0 && ','}
                        </div>
                      ));
                    } else {
                      valueTD = formattedLocation;
                    }
                  } else {
                    valueTD = null;
                  }
                  break;
                }
                case 'aiModels':
                case 'aiModelRepository':
                  if (typeof value === 'string') {
                    const [, second] = value.split('/');
                    valueTD = second;
                  } else {
                    valueTD = value.map((aiModel) => (
                      <div key={`${row.id}-${aiModel}`}>
                        {aiModel.split('/')[1]}
                      </div>
                    ));
                  }
                  break;
                case 'createdAt':
                  valueTD = <span>{format(new Date(value), 'dd-MM-yyyy HH:mm:ss')}</span>;
                  break;
                default:
                  valueTD = value;
              }
              return (
                <td key={`${row.id}-${key}`} className={`${literalBody} ${key === 'id' ? secondCell : ''}`}>
                  <div className={`${classCell} ${key === 'id' ? 'tdID' : ''}`}>
                    {valueTD}
                  </div>
                </td>
              );
            }

            return null;
          })}
          {actions && actions.length > 0 && (
            <td>
              <div className={containerActions}>
                {actions.map((action) => (
                  <button key={action.key} type="button" onClick={() => action.action(row)}>
                    {action.icon}
                  </button>
                ))}
              </div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}

export default injectIntl(TableBody);
