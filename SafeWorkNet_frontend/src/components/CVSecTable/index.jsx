import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { CaretDownFill } from 'react-bootstrap-icons';
import TableHeader from './components/TableHeader';
import TableBody from './components/TableBody';
import CVSecSearch from '../CVSecSearch';
import CustomButton from '../CustomButton';
import CVSecModal from '../CVSecModal';
import styles from './styles.module.scss';
import TablePagination from './components/TablePagination';
import { getHash } from '../../utils/utils';

const {
  cvSecTable, titleHeader, xScrolabeld, containerHeaderActions,
  button, disabledButton, searchInput, bodyModalDelete, itemToDelete,
  containerItems, containerNumerRows, options, hideOptions,
} = styles;

const GetSelectLimitRows = injectIntl(({
  intl, name, setLimitRows, setQuery, limitRows,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsLi = [5, 10, 25, 50, 100];
  const handleSelectRows = (rows) => {
    setShowOptions((prev) => !prev);
    setLimitRows(rows);
    setQuery((prev) => ({
      ...prev,
      limit: rows,
    }));
  };

  return (
    <div className={containerNumerRows}>
      <span>{intl.formatMessage({ id: `${name}.headerTable.button.numberRowsForPages` })}</span>
      <div className={`${options} ${!showOptions && hideOptions}`}>
        <ul>
          <li onClick={() => setShowOptions((prev) => !prev)}>
            {limitRows}
            <CaretDownFill />
          </li>
          {optionsLi.map((opt) => {
            if (opt !== limitRows) {
              return (
                <li key={`limit-${opt}`} onClick={() => handleSelectRows(opt)}>{opt}</li>
              );
            }
            return null;
          })}
        </ul>
      </div>
    </div>
  );
});

function CVSecTable({
  intl, title, headers, name, body = [], getQuery, totalItems, actions,
  selectabled, searchItem, newItem, deleteItem, itemFroEachPage, isNotifications,
}) {
  const [checkBoxList, setCheckBoxList] = useState({ all: false });
  const [checkBoxHeader, setcheckBoxHeader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limitRows, setLimitRows] = useState(5);
  const [enabledDeleteButton, setEnabledDeleteButton] = useState(false);
  const [query, setQuery] = useState({ name: '', page: 1, limit: limitRows });
  const [showModal, setShowModal] = useState(false);

  const deleteStreamBlock = () => {
    const idToDelete = Object.entries(checkBoxList).reduce((ids, [id, item]) => {
      if (item.checked && !Number.isNaN(id)) {
        ids.push(parseInt(id, 10));
      }
      return ids;
    }, []);
    setCheckBoxList((prev) => {
      const newListBox = { all: false };
      Object.entries(prev).forEach(([currentId, item]) => {
        const idRow = parseInt(currentId, 10);
        if (!idToDelete.includes(idRow) && !Number.isNaN(idRow)) {
          newListBox[idRow] = { name: item.name, checked: false };
        }
      });

      return newListBox;
    });
    setShowModal(false);
    const lastPage = Math.ceil((totalItems - idToDelete.length) / limitRows);
    if (lastPage) {
      setCurrentPage((prev) => ((prev > lastPage) ? lastPage : prev));
    }
    deleteItem({ ids: idToDelete });
  };

  const handleSearch = (nameToSearch) => {
    setCheckBoxList({ all: false });
    setQuery((prev) => ({
      ...prev,
      page: 1,
      name: nameToSearch,
    }));
  };

  const getHeaderActions = () => {
    const headerActions = [];

    if (searchItem) {
      headerActions.push(
        <CVSecSearch
          key={`${name}-search`}
          className={searchInput}
          placeholder={intl.formatMessage({ id: `${name}.cvsecSearch.placeholder` })}
          onSearh={(nameToSearch) => handleSearch(nameToSearch)}
        />,
      );
    }

    if (itemFroEachPage) {
      headerActions.push(<GetSelectLimitRows
        key={getHash(name)}
        name={name}
        setLimitRows={setLimitRows}
        setQuery={setQuery}
        limitRows={limitRows}
      />);
    }

    if (newItem) {
      headerActions.push(
        <CustomButton
          key={`${name}-addItem`}
          className={button}
          onClick={() => newItem()}
          msg={intl.formatMessage({ id: `${name}.headerTable.button.addItem` })}
        />,
      );
    }
    if (deleteItem) {
      headerActions.push(
        <CustomButton
          key={`${name}-deleteItem`}
          className={`${button} ${enabledDeleteButton || disabledButton}`}
          onClick={enabledDeleteButton ? () => setShowModal(true) : () => {}}
          msg={intl.formatMessage({ id: `${name}.headerTable.button.delete` })}
        />,
      );
    }

    if (headerActions.length > 0) {
      return (
        <div className={containerHeaderActions}>
          {headerActions}
        </div>
      );
    }
    return null;
  };

  const getModalBody = () => (
    <div className={bodyModalDelete}>
      {intl.formatMessage({ id: `${name}.modal.body.delete` })}
      <div className={containerItems}>
        {Object.values(checkBoxList).map((item) => {
          if (item.checked) {
            return (
              <span className={itemToDelete}>
                {item.name}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );

  useEffect(() => {
    if (getQuery && Object.keys(query).length) {
      getQuery(query);
    }
  }, [getQuery, query]);

  useEffect(() => {
    if (query.page !== currentPage) {
      setQuery((prev) => ({
        ...prev,
        page: currentPage,
      }));
    }
  }, [currentPage, query.page]);

  useEffect(() => {
    setCheckBoxList((prev) => {
      const currentListBox = prev;
      body?.forEach((row) => {
        if (!currentListBox[row.id]) {
          currentListBox[row.id] = { checked: false, name: row.name };
        }
      });
      return currentListBox;
    });

    const checkBoxChecked = document.querySelectorAll('.btnCheckBox svg').length;
    setcheckBoxHeader((checkBoxChecked === limitRows));
  }, [body, limitRows]);

  useEffect(() => {
    setEnabledDeleteButton(Object.values(checkBoxList).some((vs) => vs.checked));
  }, [checkBoxList]);

  return (
    <div className={`${cvSecTable} ${xScrolabeld}`}>
      {title && <h2 className={titleHeader}>{title}</h2>}
      {getHeaderActions()}
      {body.length ? (
        <>
          <table>
            <TableHeader
              title={title}
              headers={headers}
              name={name}
              selectabled={selectabled}
              checkBoxList={checkBoxList}
              setCheckBoxList={setCheckBoxList}
              setQuery={setQuery}
              checkBoxHeader={checkBoxHeader}
              setcheckBoxHeader={setcheckBoxHeader}
            />
            <TableBody
              headers={headers}
              body={body}
              name={name}
              actions={actions}
              selectabled={selectabled}
              checkBoxList={checkBoxList}
              setCheckBoxList={setCheckBoxList}
              setcheckBoxHeader={setcheckBoxHeader}
              limitRows={limitRows}
              isNotifications={isNotifications}
            />
          </table>
          <TablePagination
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / limitRows)}
          />
        </>
      )
        : (
          <div className="noticeNotRegister">
            {intl.formatMessage({ id: `${name}.notRegisters` })}
          </div>
        )}
      <CVSecModal
        open={showModal}
        title={intl.formatMessage({ id: `${name}.modal.title.delete` })}
        body={getModalBody()}
        btnAccept={() => deleteStreamBlock()}
        btnCancel={() => setShowModal(false)}
        size="md"
      />
    </div>
  );
}

export default injectIntl(CVSecTable);
