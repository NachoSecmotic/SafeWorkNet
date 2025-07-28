/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable max-len */
import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import { Select, Button, Card } from 'antd';
import BarChart from './charts/barChart';
import PieChart from './charts/pieChart';
import { useGetNotificationsQuery } from '../../services/redux/notification/api';
import { useGetDevicesQuery } from '../../services/redux/device/api';
import ColumnChart from './charts/columnChart';
import styles from './styles.module.scss';
import LineChart from './charts/lineChart';
import HourlyLineChart from './charts/hourlyLineChart';

function NotificationCharts({ intl }) {
  const { Option } = Select;
  const [query, setQuery] = useState({ page: 1, limit: 1000 });
  const { data: notificationList } = useGetNotificationsQuery(query);
  const { data: devicesData } = useGetDevicesQuery(query);

  const triggerLabelCount = {};
  notificationList?.data.forEach((notification) => {
    const { triggerLabel } = notification;
    triggerLabelCount[triggerLabel] = (triggerLabelCount[triggerLabel] || 0) + 1;
  });

  const deviceMap = {};
  devicesData?.data.forEach((device) => {
    deviceMap[device.id] = device.name;
  });

  const deviceIds = Array.from(new Set(notificationList?.data.map((notification) => notification.videoStream.deviceId)));

  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedDeviceIdForColumns, setSelectedDeviceIdForColumns] = useState(null);

  const filteredNotifications = selectedDeviceId
    ? notificationList?.data.filter((notification) => notification.videoStream.deviceId === selectedDeviceId)
    : notificationList?.data;

  const filteredTriggerLabelCount = {};
  filteredNotifications?.forEach((notification) => {
    const { triggerLabel } = notification;
    filteredTriggerLabelCount[triggerLabel] = (filteredTriggerLabelCount[triggerLabel] || 0) + 1;
  });

  const filteredChartData = Object.entries(filteredTriggerLabelCount).map(([label, count]) => ({
    label,
    count,
  }));

  const finalChartData = selectedLabel
    ? filteredChartData.filter((item) => item.label === selectedLabel)
    : filteredChartData;

  const filteredNotificationsForColumns = selectedDeviceIdForColumns
    ? notificationList?.data.filter(
      (notification) => notification.videoStream.deviceId === selectedDeviceIdForColumns,
    )
    : notificationList?.data;

  return (
    <div>
      <div className={styles.titleContainer}>
        <h3>
          {intl.formatMessage({ id: 'dashboards.index.general.title.h3' })}
        </h3>
      </div>

      <div className={styles.selectContainer}>
        <Select
          value={selectedDeviceId !== null ? String(selectedDeviceId) : ''}
          onChange={(value) => setSelectedDeviceId(value ? Number(value) : null)}
          style={{ width: '200px' }}
          placeholder={intl.formatMessage({ id: 'dashboards.index.select.devices.placeholder' })}
        >
          <Option value="">{intl.formatMessage({ id: 'dashboards.index.select.devices.option.allDevices' })}</Option>
          {deviceIds.map((deviceId) => (
            <Option key={deviceId} value={String(deviceId)}>
              {deviceMap[deviceId] || `Device ${deviceId}`}
            </Option>
          ))}
        </Select>

        <Button
          onClick={() => {
            setSelectedDeviceId(null);
            setSelectedLabel(null);
          }}
          className={styles.resetButton}
        >
          {intl.formatMessage({ id: 'dashboards.index.button.reset' })}
        </Button>
      </div>

      <div className={styles.chartContainer}>
        <Card bordered className={styles.barCard}>
          <BarChart data={finalChartData} setSelectedLabel={setSelectedLabel} />
        </Card>
        <Card bordered className={styles.pieCard}>
          <PieChart data={finalChartData} setSelectedLabel={setSelectedLabel} />
        </Card>
      </div>

      <Card bordered className={styles.lineCard}>
        <LineChart
          data={filteredNotifications || []}
          setSelectedLabel={setSelectedLabel}
          selectedLabel={selectedLabel}
        />
      </Card>

      <Card bordered className={styles.hourlyCard}>
        <HourlyLineChart
          data={notificationList?.data || []}
          setSelectedLabel={setSelectedLabel}
          selectedLabel={selectedLabel}
        />
      </Card>

      <div className={styles.specificContainer}>
        <h3>{intl.formatMessage({ id: 'dashboards.index.specific.title.h3' })}</h3>
        <Select
          value={selectedDeviceIdForColumns !== null ? String(selectedDeviceIdForColumns) : ''}
          onChange={(value) => setSelectedDeviceIdForColumns(value ? Number(value) : null)}
          style={{ width: '200px' }}
          placeholder={intl.formatMessage({ id: 'dashboards.index.select.devices.placeholder' })}
        >
          <Option value="">{intl.formatMessage({ id: 'dashboards.index.select.devices.option.allDevices' })}</Option>
          {deviceIds.map((deviceId) => (
            <Option key={deviceId} value={String(deviceId)}>
              {deviceMap[deviceId] || `Device ${deviceId}`}
            </Option>
          ))}
        </Select>
      </div>
      <div className={styles.chartContainer}>
        <div>
          <div className={styles.chartTitle}>
            <h4>{intl.formatMessage({ id: 'dashboards.index.no-helmet.chart.title.h4' })}</h4>
          </div>
          <Card bordered className={styles.card50}>
            <ColumnChart
              data={filteredNotificationsForColumns || []}
              label="no-helmet"
            />
          </Card>
        </div>

        <div>
          <div className={styles.chartTitle}>
            <h4>{intl.formatMessage({ id: 'dashboards.index.no-vest.chart.title.h4' })}</h4>
          </div>
          <Card bordered className={styles.card50}>
            <ColumnChart
              data={filteredNotificationsForColumns || []}
              label="no-vest"
            />
          </Card>
        </div>
      </div>

    </div>
  );
}

export default injectIntl(NotificationCharts);
