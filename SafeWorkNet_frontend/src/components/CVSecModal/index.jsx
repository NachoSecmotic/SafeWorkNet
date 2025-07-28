import React from 'react';
import { injectIntl } from 'react-intl';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import CustomButton from '../CustomButton';
import styles from './styles.module.scss';

const {
  cvSecModal, buttonAccept, buttonCancel, headerModal, bodyModal, modalFooter,
} = styles;

function CVSecModal({
  intl, open, title, body, btnAccept, btnCancel, showCancelButton = true,
  size, disabledBtnAccept, disabledBtnCancel,
}) {
  return (
    <Modal
      isOpen={open}
      className={cvSecModal}
      centered
      size={size ?? 'md'}
    >
      {title && (
        <ModalHeader className={headerModal} toggle={() => btnCancel()}>{title}</ModalHeader>
      )}
      <ModalBody className={bodyModal}>
        {body}
      </ModalBody>
      <ModalFooter className={modalFooter}>
        {(showCancelButton && btnCancel) && (
        <CustomButton
          className={buttonCancel}
          onClick={disabledBtnCancel ? () => {} : () => btnCancel()}
          msg={intl.formatMessage({ id: 'cvSecModal.cancel' })}
          disabled={disabledBtnCancel}
        />
        )}
        {btnAccept && (
        <CustomButton
          className={buttonAccept}
          onClick={disabledBtnAccept ? () => {} : () => btnAccept()}
          msg={intl.formatMessage({ id: 'cvSecModal.accept' })}
          disabled={disabledBtnAccept}
        />
        )}
      </ModalFooter>
    </Modal>
  );
}

export default injectIntl(CVSecModal);
