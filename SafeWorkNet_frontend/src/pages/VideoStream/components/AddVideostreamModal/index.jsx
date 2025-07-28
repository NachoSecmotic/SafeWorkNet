import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import VideoStreamForm from '../VideoStreamForm';
import CVSecModal from '../../../../components/CVSecModal/index';
import styles from './styles.module.scss';
import './styles.scss';

const {
  containerAddVideostreamModal,
} = styles;

function AddVideoStreamModal({
  visible, onCancel, onAdd, intl,
}) {
  const [formKey, setFormKey] = useState(0);

  const handleFormSubmitted = () => {
    onCancel();
    setFormKey((prevKey) => prevKey + 1);
  };

  return (
    <CVSecModal
      open={visible}
      title={intl.formatMessage({ id: 'videoStreams.preview.modal.create' })}
      body={(
        <VideoStreamForm
          className={containerAddVideostreamModal}
          key={formKey}
          onAdd={onAdd}
          onFormSubmitted={handleFormSubmitted}
          intl={intl}
        />
      )}
      btnCancel={() => onCancel()}
      size="lg"
    />
  );
}

export default injectIntl(AddVideoStreamModal);
