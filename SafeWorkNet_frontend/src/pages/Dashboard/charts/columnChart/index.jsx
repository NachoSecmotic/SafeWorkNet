/* eslint-disable no-case-declarations */
/* eslint-disable max-len */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/no-extraneous-dependencies */
import React, {
  useEffect, useRef, useMemo, useState,
} from 'react';
import { injectIntl } from 'react-intl';
import { Column } from '@antv/g2plot';
import { DatePicker, Select } from 'antd';
import PropTypes from 'prop-types';
import colorDict from '../common/colorDict';

const { RangePicker } = DatePicker;
const { Option } = Select;

function ColumnChart({ data, label, intl }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [grouping, setGrouping] = useState(intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.day' }));

  const groupByDate = (date, groupType) => {
    const dateObj = new Date(date);
    switch (groupType) {
      case `${intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.week' })}`:
        const firstDayOfWeek = new Date(dateObj.setDate(dateObj.getDate() - dateObj.getDay() + 1));
        return firstDayOfWeek.toISOString().split('T')[0];
      case `${intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.month' })}`:
        return dateObj.toISOString().split('T')[0].slice(0, 7);
      case `${intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.year' })}`:
        return dateObj.toISOString().split('T')[0].slice(0, 4);
      default:
        return dateObj.toISOString().split('T')[0];
    }
  };

  const processedData = useMemo(() => {
    const [startDate, endDate] = dateRange || [null, null];

    const filteredData = data.filter((notification) => {
      const isMatchingLabel = notification.triggerLabel === label;

      const createdAt = new Date(notification.createdAt);

      if (Number.isNaN(createdAt)) return false;

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      const isInRange = (!start || createdAt >= start)
        && (!end || createdAt <= end);

      return isMatchingLabel && isInRange;
    });

    const groupedData = filteredData.reduce((acc, notification) => {
      const dateGroup = groupByDate(notification.createdAt, grouping);
      acc[dateGroup] = (acc[dateGroup] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groupedData).map(([date, count]) => ({
      date,
      count,
    }));
  }, [data, dateRange, label, grouping]);

  useEffect(() => {
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Column(chartContainerRef.current, {
        data: processedData,
        xField: 'date',
        yField: 'count',
        xAxis: {
          title: {
            text: `${intl.formatMessage({ id: 'dashboards.charts.columnChart.xAxis.title' })} (${grouping})`,
            style: {
              fill: '#FFFFFF',
              fontSize: 16,
              opacity: 0.6,
            },
          },
          label: {
            style: {
              fill: '#FFFFFF',
            },
          },
        },
        yAxis: {
          title: {
            text: `${intl.formatMessage({ id: 'dashboards.charts.columnChart.yAxis.title' })} ${label}`,
            style: {
              fill: '#FFFFFF',
              fontSize: 16,
              opacity: 0.6,
            },
          },
        },
        tooltip: {
          showTitle: true,
          formatter: (datum) => ({
            name: intl.formatMessage({ id: 'dashboards.charts.columnChart.tooltip.onHover' }),
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
          position: 'middle',
          style: {
            fill: '#FFFFFF',
            fontSize: 24,
            opacity: 0.6,
          },
        },
        color: colorDict[label] || '#FF4D4F',
      });

      chartInstanceRef.current.render();
    } else {
      chartInstanceRef.current.update({
        data: processedData,
      });

      chartInstanceRef.current.options.xAxis.title.text = `${intl.formatMessage({ id: 'dashboards.charts.columnChart.xAxis.title' })} (${grouping})`;

      chartInstanceRef.current.render();
    }
  }, [processedData, label, grouping, intl]);

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
      }}
      >
        <RangePicker
          style={{ marginBottom: '1rem', width: '300px' }}
          onChange={(dates) => setDateRange(dates)}
          format="DD/MM/YYYY HH:mm"
          allowClear
          placeholder={[
            intl.formatMessage({ id: 'dashboards.charts.columnChart.rangePicker.start.placeholder' }),
            intl.formatMessage({ id: 'dashboards.charts.columnChart.rangePicker.end.placeholder' }),
          ]}
          inputReadOnly
        />
        <Select
          placeholder={intl.formatMessage({ id: 'dashboards.charts.columnChart.select.placeholder' })}
          style={{ width: 300, marginBottom: '1rem' }}
          onChange={(value) => setGrouping(value)}
        >
          <Option value={intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.day' })}>
            {intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.day' })}
          </Option>
          <Option value={intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.week' })}>
            {intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.week' })}
          </Option>
          <Option value={intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.month' })}>
            {intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.month' })}
          </Option>
          <Option value={intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.value.year' })}>
            {intl.formatMessage({ id: 'dashboards.charts.columnChart.select.option.year' })}
          </Option>
        </Select>
      </div>
      <div ref={chartContainerRef} style={{ height: '400px' }} />
    </div>
  );
}

ColumnChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      triggerLabel: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }),
  ).isRequired,
  label: PropTypes.string.isRequired,
};

export default injectIntl(ColumnChart);
