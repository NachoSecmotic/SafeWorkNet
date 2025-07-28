import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Container } from 'reactstrap';
import { notification } from 'antd';
import {
  useGetDevicesQuery,
  useCreateDeviceMutation,
  useDeleteDeviceMutation,
  useUpdateDeviceMutation,
  useLazyGetDeviceByIdQuery,
} from '../../services/redux/device/api';
import CVSecTable from '../../components/CVSecTable';
import DEVICE_HEADER from './data/header';
import styles from './styles.module.scss';
import DeviceModal from './components/DeviceModal';
import settingIcon from '../../resources/pages/dashboards/settings.svg';
import { formatLocation } from '../../utils/utils';

const {
  containerDevice, notRegisters,
} = styles;

function Device({ intl }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [notifications, setNotifications] = useState();
  const [api, contextHolder] = notification.useNotification();
  const [query, setQuery] = useState({ name: '', page: 1, limit: 5 });
  const { data: deviceList, error: errorList, refetch } = useGetDevicesQuery(query);
  const [visibleApiKeys, setVisibleApiKeys] = useState({});

  const [
    createDevice,
    { isSuccess: createdSuccess, isError: createdError },
  ] = useCreateDeviceMutation();
  const [
    deleteDevice,
    { isSuccess: deletedSuccess, isError: deletedError },
  ] = useDeleteDeviceMutation();
  const [
    updateDevice,
    { isSuccess: updatedSuccess, isError: updatedError },
  ] = useUpdateDeviceMutation();

  const [getDeviceById] = useLazyGetDeviceByIdQuery();

  const transformResolution = (resolution) => `${resolution.width}X${resolution.height}`;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showEditModal = async (device) => {
    const { data } = await getDeviceById(device.id);
    const transformedLocation = formatLocation(data.location);
    const transformedResolution = `${data.resolution.width}X${data.resolution.height}`;

    setEditDevice({
      ...data,
      location: transformedLocation,
      resolution: transformedResolution,
    });
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditDevice();
    setIsEditModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddDevice = (formData) => {
    createDevice(formData);
  };

  const handleUpdateDevice = (formData) => {
    updateDevice({ id: editDevice.id, ...formData });
  };

  useEffect(() => {
    const noticeData = { placement: 'top' };
    switch (notifications?.result) {
      case 'success':
        noticeData.message = intl.formatMessage({ id: `devices.notice.${notifications.action}.success.title` });
        api.success(noticeData);
        break;
      case 'error':
        noticeData.message = intl.formatMessage({ id: `devices.notice.${notifications.action}.error.title` });
        noticeData.description = intl.formatMessage({ id: `devices.notice.${notifications.action}.error.description` });
        api.error(noticeData);
        break;
      default: break;
    }
  }, [intl, api, notifications]);

  function getActionsButton() {
    return [
      {
        key: 'settings',
        icon: (<img src={settingIcon} alt="iconAction" />),
        action: (device) => showEditModal(device),
      },
    ];
  }

  useEffect(() => {
    if (deletedSuccess) {
      setNotifications({ result: 'success', action: 'deleteRegister' });
      refetch();
    } else if (deletedError) {
      setNotifications({ result: 'error', action: 'deleteRegister' });
    }
  }, [deletedSuccess, deletedError, intl, api, refetch]);

  useEffect(() => {
    if (createdSuccess) {
      setNotifications({ result: 'success', action: 'createdRegister' });
      refetch();
    } else if (createdError) {
      setNotifications({ result: 'error', action: 'createdRegister' });
    }
  }, [createdSuccess, createdError, intl, api, refetch]);

  useEffect(() => {
    if (updatedSuccess) {
      setNotifications({ result: 'success', action: 'updatedRegister' });
      closeEditModal();
      refetch();
    } else if (updatedError) {
      setNotifications({ result: 'error', action: 'updatedRegister' });
    }
  }, [updatedSuccess, updatedError, intl, api, refetch]);

  if (errorList) {
    return (
      <Container className={containerDevice}>
        <div className={`noticeNotRegister ${notRegisters}`}>
          {intl.formatMessage({ id: 'devices.error.getDevicesList' })}
        </div>
      </Container>
    );
  }

  const toggleApiKeyVisibility = (id) => {
    setVisibleApiKeys((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const deviceData = deviceList?.data.map((device) => {
    const transformedApiKey = visibleApiKeys[device.id] ? device.apikey : '********';

    return {
      ...device,
      resolution: transformResolution(device.resolution),
      apikey: (
        <span
          onClick={() => toggleApiKeyVisibility(device.id)}
          onKeyDown={(e) => { if (e.key === 'Enter') toggleApiKeyVisibility(device.id); }}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          {transformedApiKey}
        </span>
      ),
      realApikey: device.apikey,
    };
  }) || [];

  const TabletDeviceData = deviceData.map(({ realApikey, ...rest }) => rest);

  return (
    <>
      <Container className={containerDevice}>
        {contextHolder}
        <CVSecTable
          headers={DEVICE_HEADER}
          body={TabletDeviceData}
          getQuery={setQuery}
          totalItems={deviceList?.total}
          name="devices"
          actions={getActionsButton()}
          selectabled
          searchItem
          itemFroEachPage
          newItem={showModal}
          deleteItem={deleteDevice}
        />
      </Container>
      <DeviceModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleAddDevice}
        intl={intl}
        initialValues={null}
        isEditMode={false}
      />
      <DeviceModal
        visible={isEditModalVisible}
        onCancel={closeEditModal}
        onSubmit={handleUpdateDevice}
        intl={intl}
        initialValues={editDevice}
        isEditMode
      />
    </>
  );
}

export default injectIntl(Device);
