import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import DeviceForm from '../DeviceForm';
import CVSecModal from '../../../../components/CVSecModal/index';
import styles from './styles.module.scss';
import './styles.scss';

const {
  containerAddDeviceModal,
} = styles;

function DeviceModal({
  visible, onCancel, onSubmit, intl, initialValues, isEditMode,
}) {
  const [formKey, setFormKey] = useState(0);

  const handleFormSubmitted = () => {
    onCancel();
    setFormKey((prevKey) => prevKey + 1);
  };

  return (
    <CVSecModal
      open={visible}
      title={isEditMode
        ? intl.formatMessage({ id: 'devices.edit.modal.title' })
        : intl.formatMessage({ id: 'devices.creation.modal.title' })}
      body={(
        <DeviceForm
          className={containerAddDeviceModal}
          key={formKey}
          onAdd={onSubmit}
          onUpdate={onSubmit}
          initialValues={initialValues}
          onFormSubmitted={handleFormSubmitted}
          intl={intl}
        />
      )}
      btnCancel={() => onCancel()}
      size="lg"
    />
  );
}

export default injectIntl(DeviceModal);
