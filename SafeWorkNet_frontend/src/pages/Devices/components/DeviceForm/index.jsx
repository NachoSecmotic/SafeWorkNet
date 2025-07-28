import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-form';
import { resolutionOptions } from '../../../../constants/variables';

function DeviceForm({
  onAdd, onUpdate, intl, onFormSubmitted, initialValues, className,
}) {
  const initialFormdata = {
    name: '',
    location: '',
    type: '',
    resolution: '',
    apikey: '',
    requiresProcessing: false,
  };

  const [formData, setFormData] = useState(initialFormdata);
  const [loaded, setLoaded] = useState(false);
  const isEditMode = initialValues && initialValues.id;

  useEffect(() => {
    if (isEditMode) {
      const newFormData = {
        name: initialValues.name || '',
        location: initialValues.location || '',
        type: initialValues.type || '',
        resolution: initialValues.resolution || '',
        apikey: initialValues.apikey || '',
        requiresProcessing: initialValues.requiresProcessing || false,
      };
      setFormData(newFormData);
      setLoaded(true);
    } else {
      setFormData(initialFormdata);
      setLoaded(true);
    }
  }, [initialValues, isEditMode, initialFormdata]);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  const normalizeDecimalSeparator = (value) => (typeof value === 'string' ? value.replace(',', '.') : value);

  const isValidLocation = (value) => {
    if (value) {
      const coordinates = value.split(',').map((coord) => coord.trim());

      if (coordinates.length !== 2) {
        return false;
      }

      const [latitudeStr, longitudeStr] = coordinates;
      const latitude = parseFloat(latitudeStr);
      const longitude = parseFloat(longitudeStr);

      const latValid = !Number.isNaN(latitude) && latitude >= -90 && latitude <= 90;
      const lonValid = !Number.isNaN(longitude) && longitude >= -180 && longitude <= 180;

      const latFormatValid = /^-?\d+(\.\d+)?$/.test(latitudeStr);
      const lonFormatValid = /^-?\d+(\.\d+)?$/.test(longitudeStr);

      return latValid && lonValid && latFormatValid && lonFormatValid;
    }

    return true;
  };

  const normalizeValues = (values) => {
    const [latitude, longitude] = values.location.split(',').map(normalizeDecimalSeparator);
    const [width, height] = values.resolution.split(/[xX]/).map(Number);
    return {
      name: values.name,
      type: values.type,
      resolution: { width, height },
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      apikey: values.apikey,
      requiresProcessing: values.type !== 'Edge device',
    };
  };

  const handleAddDevice = async (values) => {
    const normalizedValues = normalizeValues(values);
    onAdd(normalizedValues);
    setFormData(initialFormdata);

    if (onFormSubmitted) {
      onFormSubmitted();
    }
  };

  const handleUpdateDevice = async (values) => {
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
        onFinish={isEditMode ? handleUpdateDevice : handleAddDevice}
        initialValues={formData}
        onValuesChange={(_, allValues) => {
          const newFormData = {
            ...allValues,
            requiresProcessing: allValues.type !== 'Edge device',
          };
          setFormData(newFormData);
        }}
        submitter={{
          submitButtonProps: {
            style: { backgroundColor: '#34978B' },
          },
          resetButtonProps: isEditMode ? { style: { display: 'none' } } : { onClick: resetForm },
          searchConfig: {
            submitText: isEditMode ? intl.formatMessage({ id: 'devices.update.modal.submit.button' }) : intl.formatMessage({ id: 'devices.creation.modal.submit.button' }),
            resetText: isEditMode ? undefined : intl.formatMessage({ id: 'devices.creation.modal.reset.button' }),
          },
        }}
      >
        <ProFormText
          name="name"
          className="inputTextANTD"
          label={intl.formatMessage({ id: 'devices.creation.modal.name.input.title' })}
          placeholder={intl.formatMessage({ id: 'devices.creation.modal.name.placeholder' })}
          rules={[{ required: true, message: intl.formatMessage({ id: 'devices.creation.modal.name.input.required' }) }]}
        />
        <ProFormText
          name="location"
          className="inputTextANTD"
          label={intl.formatMessage({ id: 'devices.creation.modal.location.input' })}
          placeholder="37.420526725973566, -5.985925331577496"
          rules={[
            {
              required: true,
              validator: async (_, value) => {
                if (!isValidLocation(value)) {
                  throw new Error(intl.formatMessage({ id: 'devices.creation.modal.location.input.invalid' }));
                }
              },
            },
          ]}
        />
        <ProFormSelect
          name="type"
          className="selectANTD"
          label={intl.formatMessage({ id: 'devices.creation.modal.type.select.title' })}
          placeholder={intl.formatMessage({ id: 'devices.creation.modal.type.placeholder' })}
          options={[
            {
              label: intl.formatMessage({ id: 'devices.creation.modal.type.videocamera' }),
              value: 'Videocamera',
            },
            {
              label: intl.formatMessage({ id: 'devices.creation.modal.type.edgedevice' }),
              value: 'Edge device',
            },
            {
              label: intl.formatMessage({ id: 'devices.creation.modal.type.smartphone' }),
              value: 'Smartphone',
            },
          ]}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'devices.creation.modal.type.input.required' }),
            },
          ]}
        />
        <ProFormSelect
          name="resolution"
          className="selectANTD"
          label={intl.formatMessage({ id: 'devices.creation.modal.resolution.select.title' })}
          placeholder={intl.formatMessage({ id: 'devices.creation.modal.resolution.placeholder' })}
          options={resolutionOptions}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'devices.creation.modal.resolution.select.required' }),
            },
          ]}
        />
      </ProForm>
    </div>
  );
}

export default injectIntl(DeviceForm);
