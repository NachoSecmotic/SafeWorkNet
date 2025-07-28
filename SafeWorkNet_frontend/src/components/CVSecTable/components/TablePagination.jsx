/* eslint-disable no-plusplus */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { React, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import {
  ChevronDoubleLeft, ChevronLeft, ChevronDoubleRight, ChevronRight,
} from 'react-bootstrap-icons';
import styles from '../styles.module.scss';

const {
  containerPagination, buttons, numbers, selected, containerNumbers,
} = styles;

function TablePagination({ currentPage, setCurrentPage, totalPages }) {
  const showFirtsAndLastChevron = currentPage > 2 && currentPage < totalPages - 1;
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const getNumberPages = () => {
    const numbersPage = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        numbersPage.push(
          <button
            type="button"
            key={`totalItem-${i}`}
            className={`${buttons} ${numbers} ${currentPage === i ? selected : ''}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>,
        );
      }
    } else if (currentPage <= 2 || currentPage >= totalPages - 1) {
      let elipsis = false;
      for (let i = 1; i <= totalPages; i++) {
        if ((i >= 1 && i <= 2) || i > totalPages - 2) {
          numbersPage.push(
            <button
              type="button"
              key={`totalItem-${i}`}
              className={`${buttons} ${numbers} ${currentPage === i ? selected : ''}`}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </button>,
          );
        }
        if (i >= 2 && i <= totalPages - 2 && !elipsis) {
          elipsis = true;
          numbersPage.push(
            <button
              type="button"
              key="totalItem-elipsis"
              className={`${buttons} ${numbers}`}
            >
              ...
            </button>,
          );
        }
      }
    } else {
      numbersPage.push(
        <button
          type="button"
          key="totalItem-firstElipsis"
          className={`${buttons} ${numbers}`}
        >
          ...
        </button>,
      );
      for (let i = 1; i <= 3; i++) {
        numbersPage.push(
          <button
            type="button"
            key={`totalItem-${i}`}
            className={`${buttons} ${numbers} ${currentPage - 2 + i === currentPage ? selected : ''}`}
            onClick={() => setCurrentPage(currentPage - 2 + i)}
          >
            {currentPage - 2 + i}
          </button>,
        );
      }
      numbersPage.push(
        <button
          type="button"
          key="totalItem-lastElipsis"
          className={`${buttons} ${numbers}`}
        >
          ...
        </button>,
      );
    }
    return <div className={containerNumbers}>{numbersPage}</div>;
  };

  return (
    <div className={containerPagination}>
      {showFirtsAndLastChevron && totalPages > 4 && (
        <button type="button" className={buttons} onClick={() => setCurrentPage(1)}>
          <ChevronDoubleLeft />
        </button>
      )}
      {currentPage > 1 && totalPages > 1 && (
        <button type="button" className={buttons} onClick={() => setCurrentPage((prev) => prev - 1)}>
          <ChevronLeft />
        </button>
      )}
      {getNumberPages()}
      {currentPage !== totalPages && totalPages > 1 && (
        <button type="button" className={buttons} onClick={() => setCurrentPage((prev) => prev + 1)}>
          <ChevronRight />
        </button>
      )}
      {showFirtsAndLastChevron && totalPages > 4 && (
        <button type="button" className={buttons} onClick={() => setCurrentPage(totalPages)}>
          <ChevronDoubleRight />
        </button>
      )}
    </div>
  );
}

export default injectIntl(TablePagination);
