import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Container } from 'reactstrap';
import { notification } from 'antd';
import {
  useGetVideoStreamsQuery,
  useCreateVideoStreamMutation,
  useDeleteVideoStreamMutation,
} from '../../services/redux/videoStream/api';
import { redirectTo } from '../../utils/utils';
import CVSecTable from '../../components/CVSecTable';
import VIDEOSTREAM_HEADER from './data/header';
import styles from './styles.module.scss';
import AddStreamModal from './components/AddVideostreamModal';
import settingIcon from '../../resources/pages/dashboards/settings.svg';
import previewIcon from '../../resources/pages/dashboards/previewVideo.svg';
import StreamPlayer from '../../components/CVSecPlayer';
import CVSecModal from '../../components/CVSecModal/index';

const {
  containerVideoStream, notRegisters,
} = styles;

function VideoStream({ intl }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState();
  const [api, contextHolder] = notification.useNotification();
  const [query, setQuery] = useState({ name: '', page: 1, limit: 5 });
  const { data: videoStreamList, error: errorList } = useGetVideoStreamsQuery(query);
  const [isVideoModalVisible, setVideoModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [
    createVideoStream,
    { isSuccess: createdSuccess, isError: createdError },
  ] = useCreateVideoStreamMutation();
  const [
    deleteVideoStream,
    { isSuccess: deletedSuccess, isError: deletedError },
  ] = useDeleteVideoStreamMutation();

  const openVideoModal = (url) => {
    setVideoUrl(url);
    setVideoModalVisible(true);
  };

  const closeVideoModal = () => {
    setVideoModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddStream = (formData) => {
    createVideoStream(formData);
  };

  useEffect(() => {
    const noticeData = { placement: 'top' };
    switch (notifications?.result) {
      case 'success':
        noticeData.message = intl.formatMessage({ id: `videoStreams.notice.${notifications.action}.success.title` });
        api.success(noticeData);
        break;
      case 'error':
        noticeData.message = intl.formatMessage({ id: `videoStreams.notice.${notifications.action}.error.title` });
        noticeData.description = intl.formatMessage({ id: `videoStreams.notice.${notifications.action}.error.description` });
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
        action: (videoStream) => redirectTo(`videoStreams/${videoStream.id}`),
      },
      {
        key: 'videoPreview',
        icon: (<img src={previewIcon} alt="iconAction" />),
        action: (videoStream) => openVideoModal(videoStream.url),
      },
    ];
  }

  useEffect(() => {
    if (deletedSuccess) {
      setNotifications({ result: 'success', action: 'deleteRegister' });
    } else if (deletedError) {
      setNotifications({ result: 'error', action: 'deleteRegister' });
    }
  }, [deletedSuccess, deletedError, intl, api]);

  useEffect(() => {
    if (createdSuccess) {
      setNotifications({ result: 'success', action: 'createdRegister' });
    } else if (createdError) {
      setNotifications({ result: 'error', action: 'createdRegister' });
    }
  }, [createdSuccess, createdError, intl, api]);

  if (errorList) {
    return (
      <Container className={containerVideoStream}>
        <div className={`noticeNotRegister ${notRegisters}`}>
          {intl.formatMessage({ id: 'videoStreams.error.getVideoStreamsList' })}
        </div>
      </Container>
    );
  }

  // Filtra los datos antes de pasarlos a la tabla
  const videoStreamData = videoStreamList?.data.map((stream) => {
    const { device, ...rest } = stream;
    return {
      ...rest,
      deviceName: device?.name || '',
    };
  }) || [];

  return (
    <>
      <Container className={containerVideoStream}>
        {contextHolder}
        <CVSecTable
          headers={VIDEOSTREAM_HEADER}
          body={videoStreamData}
          getQuery={setQuery}
          totalItems={videoStreamList?.total || 0}
          name="videoStreams"
          actions={getActionsButton()}
          selectabled
          searchItem
          itemFroEachPage
          newItem={showModal}
          deleteItem={deleteVideoStream}
        />
      </Container>
      <AddStreamModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onAdd={handleAddStream}
      />
      <CVSecModal
        open={isVideoModalVisible}
        onClose={closeVideoModal}
        title={intl.formatMessage({ id: 'videoStreams.preview.modal.videostream' })}
        body={<StreamPlayer streamUrl={videoUrl} modalStyle />}
        btnCancel={closeVideoModal}
        showCancelButton={false}
        size="lg"
      />
    </>
  );
}

export default injectIntl(VideoStream);
