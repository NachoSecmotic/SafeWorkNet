/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { injectIntl } from 'react-intl';
import { Check, CaretUpFill, CaretDownFill } from 'react-bootstrap-icons';
import styles from '../styles.module.scss';

const {
  tableHeader, literalHeader, checkBoxContainer, iconSort, secondCell,
  checkBoxElement, check, firstCell, sorteable, selectedSort,
} = styles;

function TableHeader({
  intl, headers, name, selectabled, setCheckBoxList,
  setQuery, checkBoxHeader, setcheckBoxHeader,
}) {
  const selectAll = () => {
    setCheckBoxList((prev) => {
      const nuevoCheckBoxList = { ...prev };
      const elementID = document.querySelectorAll('.tdID');
      const currentIDs = Object.values(elementID).map((e) => e.textContent);

      Object.keys(nuevoCheckBoxList).forEach((key) => {
        if (!Number.isNaN(parseInt(key, 10)) && currentIDs.includes(key)) {
          nuevoCheckBoxList[key] = {
            name: nuevoCheckBoxList[key].name,
            checked: !checkBoxHeader,
          };
        }
      });
      setcheckBoxHeader(!checkBoxHeader);
      return nuevoCheckBoxList;
    });
  };

  const applySelectedClass = (column, order) => {
    const allElementsSort = document.querySelectorAll(`.${iconSort}`);
    allElementsSort.forEach((element) => {
      element.classList.remove(selectedSort);
    });
    const elementSort = document.getElementById(`${name}-${column}-${order}`);
    elementSort.classList.add(selectedSort);
  };

  const orderList = (column, order) => {
    const iconSortChecked = document.querySelector(`#${name}-${column}-${order}`);

    if (!iconSortChecked.classList.value.includes(selectedSort)) {
      setQuery((prev) => ({
        ...prev,
        sort: column,
        order,
      }));
      applySelectedClass(column, order);
    } else {
      iconSortChecked.classList.remove(selectedSort);
      setQuery((prev) => ({
        ...prev,
        sort: 'id',
        order: 'ASC',
      }));
    }
  };

  return (
    <thead>
      <tr className={tableHeader}>
        {selectabled && (
          <th className={firstCell}>
            <div className={checkBoxContainer}>
              <button type="button" className={checkBoxElement} onClick={() => selectAll()}>
                {checkBoxHeader && <Check className={check} />}
              </button>
            </div>
          </th>
        )}
        {Object.entries(headers).map((header) => (
          <th key={`${name}-${header[0]}`} className={`${literalHeader} ${header[0] === 'id' ? secondCell : ''}`}>
            <div>
              {intl.formatMessage({ id: `table.${name}.header.${header[0]}` })}
              {header[1].sortable && (
                <div className={sorteable}>
                  <CaretUpFill
                    id={`${name}-${header[0]}-ASC`}
                    onClick={() => orderList(header[0], 'ASC')}
                    className={iconSort}
                  />
                  <CaretDownFill
                    id={`${name}-${header[0]}-DESC`}
                    onClick={() => orderList(header[0], 'DESC')}
                    className={iconSort}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default injectIntl(TableHeader);
