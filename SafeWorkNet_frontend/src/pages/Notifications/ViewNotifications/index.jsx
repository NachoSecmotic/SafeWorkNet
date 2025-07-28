/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable max-len */
import { React, useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import { injectIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import StreamPlayer from '../../../components/CVSecPlayer/index';
import styles from './styles.module.scss';
// import { formatLocation } from '../../../utils/utils';
import { useGetNotificationByIdQuery, useGetVideoUrlQuery } from '../../../services/redux/notification/api';
import { useGetVideoStreamByIdQuery } from '../../../services/redux/videoStream/api';

const {
  titleHeader,
  titleHeader1,
  rowEdit,
  notificationList,
  notificationItem,
  notificationTitle,
  notificationDescription,
  preview,
} = styles;

function ViewNotifications({ intl }) {
  const { id } = useParams();
  const { data: notificationView, isLoading } = useGetNotificationByIdQuery(id);
  const [videoFileName, setVideoFileName] = useState(null);
  const { data: videoData, error: videoError } = useGetVideoUrlQuery(videoFileName, {
    skip: !videoFileName,
  });

  const { data: videoStreamData } = useGetVideoStreamByIdQuery(notificationView?.videoStreamId || null, {
    skip: !notificationView?.videoStreamId,
  });

  useEffect(() => {
    if (notificationView) {
      setVideoFileName(notificationView.fileName);
    }
  }, [notificationView]);

  if (isLoading || !notificationView) {
    return <div>{intl.formatMessage({ id: 'notifications.view.preview.loading' })}</div>;
  }

  const {
    status, type, createdAt, updatedAt,
  } = notificationView;
  const formattedCreatedDate = createdAt ? format(parseISO(createdAt), 'dd-MM-yyyy HH:mm:ss') : 'Invalid date';
  const formattedUpdatedDate = updatedAt ? format(parseISO(updatedAt), 'dd-MM-yyyy HH:mm:ss') : 'Invalid date';

  const translatedStatus = intl.formatMessage({ id: `notifications.table.status.${status.toLowerCase().replace(/\s+/g, '')}` });
  const translatedType = intl.formatMessage({ id: `notifications.table.type.${type.toLowerCase().replace(/\s+/g, '')}` });

  return (
    <div style={{ color: 'white', textAlign: 'center' }}>
      <Row className={rowEdit}>
        <Col span={6} className={notificationList}>
          <h2 className={titleHeader1}>
            {intl.formatMessage({ id: 'notifications.details.title' })}
          </h2>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.IDNotification' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.id}
            </h5>
          </div>
          {/* <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.location' })}</h4>
            <h5 className={notificationDescription}>
              {formatLocation(notificationView.location)}
            </h5>
          </div> */}
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.name' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.name}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.triggerLabel' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.triggerLabel}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.streamName' })}</h4>
            <h5 className={notificationDescription}>
              {videoStreamData?.name || intl.formatMessage({ id: 'notifications.view.stream.name.notFound' })}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.type' })}</h4>
            <h5 className={notificationDescription}>
              {translatedType}
            </h5>
          </div>
          {/* <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.videoPath' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.fileName}
            </h5>
          </div> */}
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.status' })}</h4>
            <h5 className={notificationDescription}>
              {translatedStatus}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.assignedTo' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.assignedTo}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.createdAt' })}</h4>
            <h5 className={notificationDescription}>
              {formattedCreatedDate}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.lastUpdate' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.lastUpdateBy}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.updatedAt' })}</h4>
            <h5 className={notificationDescription}>
              {formattedUpdatedDate}
            </h5>
          </div>
        </Col>
        <Col span={14} className={preview}>
          <Row>
            <h2 className={titleHeader}>
              {notificationView.name}
              {': '}
              {intl.formatMessage({ id: 'notifications.preview.title' })}
            </h2>
          </Row>

          <Row>
            {videoData ? (
              <StreamPlayer streamUrl={videoData.url} alt="Video Stream" />
            ) : (
              <div>{intl.formatMessage({ id: 'notifications.view.preview.loading' })}</div>
            )}
            {videoError && <div>{intl.formatMessage({ id: 'notifications.view.preview.loading.error' })}</div>}
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default injectIntl(ViewNotifications);
