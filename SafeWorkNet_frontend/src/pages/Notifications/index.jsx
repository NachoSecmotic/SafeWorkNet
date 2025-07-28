import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Container } from 'reactstrap';
import { notification } from 'antd';
import NOTIFICATION_HEADER from './data/header';
import { redirectTo } from '../../utils/utils';
import CVSecTable from '../../components/CVSecTable';
import {
  useGetNotificationsQuery,
  useDeleteNotificationMutation,
} from '../../services/redux/notification/api';
import styles from './styles.module.scss';
import previewIcon from '../../resources/pages/dashboards/previewVideo.svg';
import settingIcon from '../../resources/pages/dashboards/settings.svg';

const {
  containerNotification, notRegisters,
} = styles;

function Notifications({ intl }) {
  const [api, contextHolder] = notification.useNotification();
  const [query, setQuery] = useState({ name: '', page: 1, limit: 5 });
  const { data: notificationList, error: errorList } = useGetNotificationsQuery(query);
  const [
    deleteNotification,
    { isSuccess: deletedSuccess, isError: deletedError },
  ] = useDeleteNotificationMutation();

  const getActions = () => ([
    {
      key: 'settings',
      icon: (<img src={settingIcon} alt="iconAction" />),
      action: (notificationView) => redirectTo(`notifications/edit/${notificationView.id}`),
    },
    {
      key: 'viewNotifications',
      icon: (<img src={previewIcon} alt="iconAction" />),
      action: (notificationView) => redirectTo(`notifications/${notificationView.id}`),
    },
  ]);

  useEffect(() => {
    const openNotification = (result) => {
      const noticeData = { placement: 'top' };
      switch (result) {
        case 'success':
          noticeData.message = intl.formatMessage({ id: 'notifications.notice.deleteRegister.success.title' });
          api.success(noticeData);
          break;
        case 'error':
          noticeData.message = intl.formatMessage({ id: 'notifications.notice.deleteRegister.error.title' });
          noticeData.description = intl.formatMessage({ id: 'notifications.notice.deleteRegister.error.description' });
          api.error(noticeData);
          break;
        default: break;
      }
    };

    if (deletedSuccess) {
      openNotification('success');
    } else if (deletedError) {
      openNotification('error');
    }
  }, [deletedSuccess, deletedError, intl, api]);

  if (errorList) {
    return (
      <Container className="xx">
        <div className={`noticeNotRegister ${notRegisters}`}>
          {intl.formatMessage({ id: 'notifications.error.getNotificationsList' })}
        </div>
      </Container>
    );
  }

  const normalizeNotifications = (notifications) => notifications.map((notif) => {
    const { videoStream, ...rest } = notif;
    return {
      ...rest,
      streamName: videoStream?.name ?? 'N/A',
    };
  });

  const normalizedData = notificationList ? normalizeNotifications(notificationList.data) : [];

  return (
    <Container className={containerNotification}>
      {contextHolder}
      <CVSecTable
        headers={NOTIFICATION_HEADER}
        body={normalizedData}
        getQuery={setQuery}
        totalItems={notificationList?.total}
        name="notifications"
        actions={getActions()}
        selectabled
        searchItem
        itemFroEachPage
        deleteItem={deleteNotification}
        isNotifications
      />
    </Container>
  );
}

export default injectIntl(Notifications);
