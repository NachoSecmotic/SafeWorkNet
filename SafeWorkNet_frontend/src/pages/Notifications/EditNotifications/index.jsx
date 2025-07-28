/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line object-curly-newline
import { Col, Row, Select, message, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import styles from './styles.module.scss';
import { useGetNotificationByIdQuery, useUpdateNotificationMutation, useGetNotificationHistoryQuery } from '../../../services/redux/notification/api';
import CustomButton from '../../../components/CustomButton';
import { API_URL, ENDPOINTS } from '../../../constants/api';
import { useGetVideoStreamByIdQuery } from '../../../services/redux/videoStream/api';
// import { formatLocation } from '../../../utils/utils';

const {
  titleHeader1,
  titleHeader2,
  titleHeader3,
  rowEdit,
  notificationList,
  notificationItem,
  notificationItemUser,
  notificationTitle,
  notificationDescription,
  historyDescriptionTitle,
  historyDescription,
  historyTitle,
  selectANTD,
  saveNotificationsChanges,
  customDivider,
} = styles;

const { Option } = Select;

function EditNotifications({ intl }) {
  const { id } = useParams();
  const { data: notificationView, isLoading } = useGetNotificationByIdQuery(id);
  const { data: notificationHistory, refetch: refetchHistory } = useGetNotificationHistoryQuery(id);
  const [updateNotification] = useUpdateNotificationMutation();
  const [status, setStatus] = useState('');
  const [lastUpdateBy, setLastUpdateBy] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        setLastUpdateBy(decodedToken.name);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    } else {
      console.error('No se encontró el accessToken en localStorage');
    }
  }, []);

  const { data: videoStream } = useGetVideoStreamByIdQuery(notificationView?.videoStreamId, {
    skip: !notificationView?.videoStreamId,
  });

  useEffect(() => {
    if (notificationView) {
      setStatus(notificationView.status);
      setAssignedTo(notificationView.assignedTo || '');
    }
  }, [notificationView, intl]);

  const handleSaveChanges = async () => {
    if (
      (status !== 'Unattended' && (!assignedTo || assignedTo === intl.formatMessage({ id: 'notifications.view.list.unassignedUser' })))
      || (status === 'Unattended' && (!assignedTo || assignedTo.trim() === ''))
    ) {
      message.error(intl.formatMessage({ id: 'notifications.update.modal.assignUser.error' }));
      return;
    }
    const updatedData = {
      id: notificationView.id,
      status,
      lastUpdateBy,
      assignedTo,
    };
    try {
      await updateNotification(updatedData).unwrap();
      await fetch(`${API_URL}/${ENDPOINTS.history}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: notificationView.id,
          status,
          lastUpdateBy,
          assignedTo,
        }),
      });
      message.success(intl.formatMessage({ id: 'notifications.update.modal.submit.success' }));
      refetchHistory();
    } catch (error) {
      message.error(intl.formatMessage({ id: 'notifications.update.modal.submit.error' }));
    }
  };

  if (isLoading || !notificationView) {
    return <div>Loading...</div>;
  }

  const {
    type, createdAt, updatedAt,
  } = notificationView;
  const formattedDate = createdAt ? format(parseISO(createdAt), 'dd-MM-yyyy HH:mm:ss') : 'Invalid date';
  const formattedUpdatedDate = updatedAt ? format(parseISO(updatedAt), 'dd-MM-yyyy HH:mm:ss') : 'Invalid date';

  return (
    <div style={{ color: 'white', textAlign: 'center' }}>
      <Row className={rowEdit}>
        <Col span={8} className={notificationList}>
          <h2 className={titleHeader1}>
            {intl.formatMessage({ id: 'notifications.details.title' })}
          </h2>
          <Divider className={customDivider} />
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.IDNotification' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.id}
            </h5>
          </div>
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
              {videoStream?.name}
            </h5>
          </div>
          {/* <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.location' })}</h4>
            <h5 className={notificationDescription}>
              {formatLocation(notificationView.location)}
            </h5>
          </div> */}
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.type' })}</h4>
            <h5 className={notificationDescription}>
              {type}
            </h5>
          </div>
          {/* <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.videoPath' })}</h4>
            <h5 className={notificationDescription}>
              {notificationView.fileName}
            </h5>
          </div> */}
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.createdAt' })}</h4>
            <h5 className={notificationDescription}>
              {formattedDate}
            </h5>
          </div>
          <div className={notificationItem}>
            <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.updatedAt' })}</h4>
            <h5 className={notificationDescription}>
              {formattedUpdatedDate}
            </h5>
          </div>
          <div className={notificationItem}>
            <div className={notificationItemUser}>
              <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.lastUpdate' })}</h4>
              <h5 className={notificationDescription}>
                {lastUpdateBy}
              </h5>
            </div>
          </div>
          <Divider className={customDivider} />
          <div className={notificationItem}>
            <div className={notificationItemUser}>
              <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.assignedTo' })}</h4>
              <h5 className={notificationDescription}>
                <div className={notificationItem}>
                  <Select
                    value={assignedTo || null}
                    onChange={(value) => {
                      setAssignedTo(value);
                    }}
                    className={selectANTD}
                    placeholder={intl.formatMessage({ id: 'notifications.view.list.unassignedUser.placeholder' })}
                  >
                    <Option value="-">
                      {' - '}
                    </Option>
                    <Option value="User1">
                      User1
                    </Option>
                    <Option value="User2">
                      User2
                    </Option>
                    <Option value="User3">
                      User3
                    </Option>
                    <Option value="User4">
                      User4
                    </Option>
                    <Option value="User5">
                      User5
                    </Option>

                  </Select>
                </div>
              </h5>
            </div>
            <div className={notificationItem}>
              <h4 className={notificationTitle}>{intl.formatMessage({ id: 'notifications.view.list.title.status' })}</h4>
              <Select
                value={status}
                onChange={(value) => setStatus(value)}
                className={selectANTD}
              >
                <Option value="In progress">
                  {intl.formatMessage({ id: 'notifications.table.status.inprogress' })}
                </Option>
                <Option value="Unattended">
                  {intl.formatMessage({ id: 'notifications.table.status.unattended' })}
                </Option>
                <Option value="Attended">
                  {intl.formatMessage({ id: 'notifications.table.status.attended' })}
                </Option>
              </Select>
            </div>
          </div>
          <Divider className={customDivider} />
          <div className={notificationItem}>
            <CustomButton
              onClick={handleSaveChanges}
              msg={intl.formatMessage({ id: 'notifications.update.modal.submit.button' })}
              className={saveNotificationsChanges}
              htmlType="button"
            />
          </div>
        </Col>
        <Col span={1}>
          <Divider type="vertical" style={{ height: '100%' }} />
        </Col>
        <Col span={8} className={notificationList}>
          <h2 className={titleHeader2}>
            {notificationView.name}
            {': '}
            {intl.formatMessage({ id: 'notifications.history.title' })}
          </h2>
          <h2 className={titleHeader3}>
            {intl.formatMessage({ id: 'notifications.history.title.created' })}
            {': '}
            {format(parseISO(notificationView.createdAt), 'dd-MM-yyyy HH:mm:ss')}
          </h2>
          <Divider className={customDivider} />
          {notificationHistory && notificationHistory.length > 0 ? (
            notificationHistory.map((history) => (
              <div key={history.id} className={notificationItem}>
                <div className={notificationItemUser}>
                  <h4 className={historyTitle}>
                    {format(parseISO(history.updatedAt), 'dd-MM-yyyy HH:mm:ss')}
                  </h4>
                  <h5 className={historyDescriptionTitle}>
                    {intl.formatMessage({ id: 'notifications.view.list.title.lastUpdate' })}
                  </h5>
                  <h5 className={historyDescription}>
                    {history.lastUpdateBy}
                  </h5>
                  <h5 className={historyDescriptionTitle}>
                    {intl.formatMessage({ id: 'notifications.view.list.title.assignedTo' })}
                  </h5>
                  <h5 className={historyDescription}>
                    {history.assignedTo}
                  </h5>
                  <h5 className={historyDescriptionTitle}>
                    {intl.formatMessage({ id: 'notifications.view.list.title.status' })}
                  </h5>
                  <h5 className={historyDescription}>
                    {history.status}
                  </h5>
                </div>
                <Divider className={customDivider} />
              </div>
            ))
          ) : (
            <div className={notificationItem}>
              <div className={notificationItemUser}>
                <h5 className={notificationDescription}>
                  {intl.formatMessage({ id: 'notifications.history.noHistory' })}
                </h5>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default injectIntl(EditNotifications);
