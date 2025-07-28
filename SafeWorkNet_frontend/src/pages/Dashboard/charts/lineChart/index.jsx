/* eslint-disable react/require-default-props */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
import React, { useEffect, useRef, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { Line } from '@antv/g2plot';
import PropTypes from 'prop-types';
import colorDict from '../common/colorDict';

function LineChart({
  data, setSelectedLabel, selectedLabel, intl,
}) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const processedData = useMemo(() => {
    const groupedData = data.reduce((acc, notification) => {
      const dateGroup = new Date(notification.createdAt).toISOString().split('T')[0];
      const labelGroup = notification.triggerLabel;

      if (!acc[labelGroup]) acc[labelGroup] = {};

      acc[labelGroup][dateGroup] = (acc[labelGroup][dateGroup] || 0) + 1;

      return acc;
    }, {});

    const allDates = [];
    const minDate = new Date(Math.min(...data.map((d) => new Date(d.createdAt))));
    const maxDate = new Date(Math.max(...data.map((d) => new Date(d.createdAt))));

    maxDate.setDate(maxDate.getDate() + 1);

    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    const finalData = [];
    Object.entries(groupedData).forEach(([label, dates]) => {
      allDates.forEach((date) => {
        finalData.push({
          date,
          count: dates[date] || 0,
          label,
        });
      });
    });

    return finalData;
  }, [data]);

  useEffect(() => {
    const dataToUse = selectedLabel
      ? processedData.filter((item) => item.label === selectedLabel)
      : processedData;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Line(chartContainerRef.current, {
        data: dataToUse,
        xField: 'date',
        yField: 'count',
        seriesField: 'label',
        xAxis: {
          title: {
            text: `${intl.formatMessage({ id: 'dashboards.charts.lineChart.xAxis.title' })}`,
            style: {
              fill: '#FFFFFF',
              fontSize: 16,
              opacity: 0.6,
            },
          },
          label: {
            style: {
              fill: '#FFFFFF',
              fontSize: 10,
            },
            autoHide: false,
          },
        },
        yAxis: {
          title: {
            text: `${intl.formatMessage({ id: 'dashboards.charts.lineChart.yAxis.title' })}`,
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
              fontSize: '16px', // Aumenta el tamaño del texto
              padding: '12px', // Aumenta el espacio dentro del cuadro
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
      <div ref={chartContainerRef} style={{ height: '100%' }} />
    </div>
  );
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      triggerLabel: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }),
  ).isRequired,
  setSelectedLabel: PropTypes.func.isRequired,
  selectedLabel: PropTypes.string,
};

export default injectIntl(LineChart);
