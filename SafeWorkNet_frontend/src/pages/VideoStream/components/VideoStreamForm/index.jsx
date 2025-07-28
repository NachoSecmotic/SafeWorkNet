// src/pages/VideoStream/components/VideoStreamForm.js
import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import {
  useGetAImodelsInRepositoryQuery,
} from '../../../../services/redux/mino/api';
import { useGetDevicesQuery } from '../../../../services/redux/device/api';

function VideoStreamForm({
  onAdd, onUpdate, intl, onFormSubmitted, initialValues, className,
}) {
  const initialFormdata = {
    name: '',
    status: '',
    type: '',
    aiModels: [],
    url: '',
    deviceId: null,
  };

  const [formData, setFormData] = useState(initialFormdata);
  const [loaded, setLoaded] = useState(false);
  const isEditMode = initialValues && initialValues.id;
  const [aiModelsOptions, setAImodelsOptions] = useState([]);
  const { data: aiModelsInRepository } = useGetAImodelsInRepositoryQuery();
  const {
    data: devicesData,
    error: devicesError,
    isLoading: isLoadingDevices,
  } = useGetDevicesQuery({ page: 1, limit: 1000 });

  const addAImodelsOption = (repositoryModels) => {
    const newOptions = [];
    repositoryModels.forEach((model) => {
      const [, second] = model.split('/');
      newOptions.push({
        label: second,
        value: model,
      });
    });
    setAImodelsOptions(newOptions);
  };

  useEffect(() => {
    if (aiModelsInRepository?.length) {
      addAImodelsOption(aiModelsInRepository);
    }
  }, [aiModelsInRepository, intl]);

  useEffect(() => {
    if (isEditMode) {
      const newFormData = {
        name: initialValues.name || '',
        status: initialValues.status || '',
        type: initialValues.type || '',
        aiModels: initialValues.aiModels || [],
        deviceId: initialValues.deviceId || null,
      };
      setFormData(newFormData);
      setLoaded(true);
    } else {
      setFormData(initialFormdata);
      setLoaded(true);
    }
  }, [initialValues, isEditMode, initialFormdata]);

  if (!loaded || isLoadingDevices) {
    return <div>Loading...</div>;
  }

  if (devicesError) {
    return (
      <div>
        Error loading devices:
        {devicesError.message}
      </div>
    );
  }

  const deviceOptions = devicesData.data?.map((device) => ({
    label: device.name,
    value: device.id,
  })) || [];

  const normalizeValues = (values) => ({
    name: values.name,
    status: values.status,
    type: values.type,
    aiModels: values.aiModels,
    deviceId: values.deviceId,
  });

  const handleAddStream = async (values) => {
    const normalizedValues = normalizeValues(values);
    onAdd(normalizedValues);
    setFormData(initialFormdata);

    if (onFormSubmitted) {
      onFormSubmitted();
    }
  };

  const handleUpdateStream = async (values) => {
    const normalizedValues = normalizeValues(values);
    onUpdate({
      id: initialValues.id,
      ...normalizedValues,
    });
    if (onFormSubmitted) {
      onFormSubmitted();
    }
  };

  const resetForm = () => {
    setFormData(initialFormdata);
  };

  return (
    <div className={className}>
      <ProForm
        onFinish={isEditMode ? handleUpdateStream : handleAddStream}
        initialValues={formData}
        onValuesChange={(_, allValues) => setFormData(allValues)}
        submitter={{
          submitButtonProps: {
            style: { backgroundColor: '#34978B' },
          },
          resetButtonProps: isEditMode ? { style: { display: 'none' } } : { onClick: resetForm },
          searchConfig: {
            submitText: isEditMode ? intl.formatMessage({ id: 'videoStreams.update.modal.submit.button' }) : intl.formatMessage({ id: 'videoStreams.creation.modal.submit.button' }),
            resetText: isEditMode ? undefined : intl.formatMessage({ id: 'videoStreams.creation.modal.reset.button' }),
          },
        }}
      >
        <ProFormText
          name="name"
          className="inputTextANTD"
          label={intl.formatMessage({ id: 'videoStreams.creation.modal.name.input.title' })}
          placeholder={intl.formatMessage({ id: 'videoStreams.creation.modal.name.placeholder' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'videoStreams.creation.modal.name.input.required' }) }]}
        />

        <ProFormSelect
          name="status"
          className="selectANTD"
          label={intl.formatMessage({ id: 'videoStreams.creation.modal.status.select.title' })}
          placeholder={intl.formatMessage({ id: 'videoStreams.creation.modal.status.placeholder' })}
          options={[
            { label: intl.formatMessage({ id: 'videoStreams.creation.modal.status.active' }), value: 'Active' },
            { label: intl.formatMessage({ id: 'videoStreams.creation.modal.status.inactive' }), value: 'Inactive' },
          ]}
          rules={[{ required: true, message: intl.formatMessage({ id: 'videoStreams.creation.modal.status.select.required' }) }]}
        />

        <ProFormSelect
          name="aiModels"
          className="selectANTD"
          label={intl.formatMessage({ id: 'videoStreams.creation.modal.model.select.title' })}
          placeholder={intl.formatMessage({ id: 'videoStreams.creation.modal.model.placeholder' })}
          mode="multiple"
          options={aiModelsOptions}
        />
        <ProFormSelect
          name="deviceId"
          className="selectANTD"
          label={intl.formatMessage({ id: 'videoStreams.creation.modal.model.devices.select.title' })}
          placeholder={intl.formatMessage({ id: 'videoStreams.creation.modal.model.devices.placeholder' })}
          options={deviceOptions}
          rules={[{ required: true, message: intl.formatMessage({ id: 'videoStreams.creation.modal.device.select.required' }) }]}
        />
      </ProForm>
    </div>
  );
}

export default injectIntl(VideoStreamForm);
