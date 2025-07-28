/* eslint-disable react/require-default-props */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
import React, {
  useEffect, useState, useRef, useMemo,
} from 'react';
import { injectIntl } from 'react-intl';
import { Line } from '@antv/g2plot';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import colorDict from '../common/colorDict';

function HourlyLineChart({
  data, setSelectedLabel, selectedLabel, intl,
}) {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const filteredNotificationsByDate = useMemo(() => (
    selectedDate
      ? data.filter((notification) => {
        const notificationDate = dayjs(notification.createdAt).format('YYYY-MM-DD');
        const selected = selectedDate.format('YYYY-MM-DD');
        return notificationDate === selected;
      })
      : data
  ), [data, selectedDate]);

  const processedData = useMemo(() => {
    if (!selectedDate) return [];

    const groupedData = filteredNotificationsByDate.reduce((acc, notification) => {
      const notificationDate = new Date(notification.createdAt);
      notificationDate.setHours(notificationDate.getHours() + 1);

      const hourGroup = notificationDate.toISOString().split('T')[1].slice(0, 2);
      const adjustedDate = notificationDate.toISOString().split('T')[0];
      const selectedDateString = selectedDate.format('YYYY-MM-DD');

      if (adjustedDate !== selectedDateString) return acc;

      const labelGroup = notification.triggerLabel;

      if (!acc[labelGroup]) acc[labelGroup] = {};

      acc[labelGroup][hourGroup] = (acc[labelGroup][hourGroup] || 0) + 1;

      return acc;
    }, {});

    const allHours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

    const finalData = [];
    Object.entries(groupedData).forEach(([label, hours]) => {
      allHours.forEach((hour) => {
        finalData.push({
          hour,
          count: hours[hour] || 0,
          label,
        });
      });
    });

    return finalData;
  }, [filteredNotificationsByDate, selectedDate]);

  useEffect(() => {
    const dataToUse = selectedLabel
      ? processedData.filter((item) => item.label === selectedLabel)
      : processedData;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Line(chartContainerRef.current, {
        data: dataToUse,
        xField: 'hour',
        yField: 'count',
        seriesField: 'label',
        xAxis: {
          title: {
            text: `${intl.formatMessage({ id: 'dashboards.charts.hourlyLineChart.xAxis.title' })}`,
            style: {
              fill: '#FFFFFF',
              fontSize: 16,
              opacity: 0.6,
            },
          },
          label: {
            style: {
              fill: '#FFFFFF',
              fontSize: 12,
            },
            autoHide: false,
          },
          tickInterval: 1,
        },
        yAxis: {
          title: {
            text: `${intl.formatMessage({ id: 'dashboards.charts.hourlyLineChart.yAxis.title' })}`,
            style: {
              fill: '#FFFFFF',
              fontSize: 16,
              opacity: 0.6,
            },
          },
          label: {
            style: {
              fill: '#FFFFFF',
              fontSize: 12,
            },
          },
        },
        legend: {
          itemName: {
            style: {
              fill: 'white',
              fontSize: 14,
            },
          },
        },
        tooltip: {
          showTitle: true,
          formatter: (datum) => ({
            name: `${intl.formatMessage({ id: 'dashboards.charts.lineChart.tooltip.onHover' })} ${datum.label} `,
            value: datum.count,
          }),
          domStyles: {
            'g2-tooltip': {
              fontSize: '16px',
              padding: '12px',
            },
          },
        },
        label: {
          position: 'top',
          style: {
            fill: '#FFFFFF',
            fontSize: 24,
            opacity: 0.6,
          },
        },
        color: (datum) => colorDict[datum.label] || 'black',
        smooth: true,
        autoFit: true,
      });

      chartInstanceRef.current.render();

      chartInstanceRef.current.on('element:click', (event) => {
        const clickedLabel = event.data.data.label;
        setSelectedLabel((prev) => (prev === clickedLabel ? null : clickedLabel));
      });
    } else {
      chartInstanceRef.current.update({
        data: dataToUse,
      });

      chartInstanceRef.current.render();
    }
  }, [processedData, selectedLabel, setSelectedLabel, intl]);

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <DatePicker
        style={{ width: '300px' }}
        value={selectedDate}
        onChange={(date) => setSelectedDate(date)}
      />
      <div ref={chartContainerRef} style={{ height: '100%' }} />
    </div>
  );
}

HourlyLineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      triggerLabel: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }),
  ).isRequired,
  setSelectedLabel: PropTypes.func.isRequired,
  selectedLabel: PropTypes.string,
};

export default injectIntl(HourlyLineChart);
