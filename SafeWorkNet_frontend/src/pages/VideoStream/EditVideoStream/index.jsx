import { notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { keyBy } from 'lodash';
import {
  useGetVideoStreamByIdQuery,
  useUpdateVideoStreamMutation,
} from '../../../services/redux/videoStream/api';
import {
  useLazyGetDeviceByIdQuery,
} from '../../../services/redux/device/api';
import styles from './styles.module.scss';
import VideoStreamForm from '../components/VideoStreamForm';
import StreamPlayer from '../../../components/CVSecPlayer';
import CanvasPolygon from '../components/CanvasPolygon';
import { getHash } from '../../../utils/utils';
import { DEFAULT_RESOLUTION } from '../../../constants/variables';

const {
  containerEditVideoStream, titleHeader, pReview, formEdit, streamPreView,
  pReviewTitle, pReviewModels,
} = styles;

function EditVideoStream({ intl }) {
  const { id } = useParams();
  const { data: videoStream, isLoading } = useGetVideoStreamByIdQuery(id);
  const [api, contextHolder] = notification.useNotification();
  const [sections, setSections] = useState({});

  const [
    updatedVideoStream,
    { isSuccess: updateIsSuccess, isError: updateIsError },
  ] = useUpdateVideoStreamMutation();

  const [getDeviceById, { data: device, isLoading: isLoadingDevice }] = useLazyGetDeviceByIdQuery();

  useEffect(() => {
    videoStream?.deviceId && getDeviceById(videoStream.deviceId);
  }, [videoStream, getDeviceById]);

  const handleUpdate = (updatedData) => {
    updatedVideoStream(updatedData);
  };

  const saveSections = () => {
    updatedVideoStream({ id, screenSections: Object.values(sections) });
  };

  const getDeviceDimensions = () => {
    const width = device?.resolution?.width || DEFAULT_RESOLUTION.width;
    const height = device?.resolution?.height || DEFAULT_RESOLUTION.height;
    return { width, height };
  };

  useEffect(() => {
    const noticeData = { placement: 'top' };

    if (updateIsSuccess) {
      noticeData.message = intl.formatMessage({ id: 'videoStreams.update.modal.submit.success.title' });
      api.success(noticeData);
    } else if (updateIsError) {
      noticeData.message = intl.formatMessage({ id: 'videoStreams.update.modal.submit.error.title' });
      noticeData.description = intl.formatMessage({ id: 'videoStreams.update.modal.submit.error.description' });
      api.error(noticeData);
    }
  }, [updateIsSuccess, updateIsError, intl, api]);

  useEffect(() => {
    if (videoStream) {
      setSections(keyBy(videoStream.screenSections, 'name') ?? {});
    }
  }, [videoStream]);

  if (isLoading || !videoStream || isLoadingDevice) {
    return <div>Loading...</div>;
  }

  return (
    <div className={containerEditVideoStream}>
      {contextHolder}
      <div className={formEdit}>
        <h2 className={titleHeader}>{intl.formatMessage({ id: 'videoStreams.edition.form.title' })}</h2>
        <VideoStreamForm
          initialValues={videoStream}
          onUpdate={handleUpdate}
        />
      </div>
      <div className={streamPreView}>
        <h3 className={titleHeader}>{intl.formatMessage({ id: 'videoStreams.edition.preview.title' })}</h3>
        {videoStream && (
          <CanvasPolygon
            saveSections={saveSections}
            resource={<StreamPlayer streamUrl={videoStream.url} />}
            sections={sections}
            setSections={setSections}
            aiModels={videoStream.aiModels}
            getDeviceDimensions={getDeviceDimensions}
          />
        )}
        <div className={pReview}>
          <div className={pReviewTitle}>
            {intl.formatMessage({ id: 'videoStreams.edition.aiModels' })}
          </div>
          <div className={pReviewModels}>
            {videoStream.aiModels.map((item, index) => (
              <span key={getHash(index.toString())}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default (injectIntl((EditVideoStream)));
