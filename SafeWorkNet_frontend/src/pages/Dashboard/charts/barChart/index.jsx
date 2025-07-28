/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useRef } from 'react';
import { Bar } from '@antv/g2plot';
import colorDict from '../common/colorDict';

const BarChart = ({ data, setSelectedLabel }) => {
  const barChartRef = useRef(null);

  useEffect(() => {
    if (!barChartRef.current) {
      barChartRef.current = new Bar(document.getElementById('barChartContainer'), {
        data,
        xField: 'count',
        yField: 'label',
        colorField: 'label',
        color: (datum) => colorDict[datum.label] || colorDict.other,
        label: {
          position: 'middle',
          style: {
            fill: '#ffffff',
            fontSize: 24,
          },
        },
        meta: {
          label: {
            alias: 'Trigger Label',
          },
          count: {
            alias: 'Count',
          },
        },
        xAxis: {
          label: {
            style: {
              fontSize: 24,
              fill: '#FFFFFF',
            },
          },
        },
        yAxis: {
          label: {
            style: {
              fontSize: 24,
              fill: '#FFFFFF',
            },
          },
        },
        tooltip: {
          domStyles: {
            'g2-tooltip': {
              fontSize: '16px',
              padding: '12px',
            },
          },
        },
        interactions: [
          {
            type: 'element-selected',
            cfg: {
              trigger: 'element:click',
              action: 'select',
              selectedStyle: { fill: '#ff4d4f' },
            },
          },
        ],
      });

      barChartRef.current.render();

      barChartRef.current.on('element:click', (event) => {
        const clickedLabel = event.data.data.label;
        setSelectedLabel((prev) => (prev === clickedLabel ? null : clickedLabel));
      });
    } else {
      barChartRef.current.changeData(data);
    }
  }, [data, setSelectedLabel]);

  return (
    <div
      id="barChartContainer"
      style={{ height: '400px', width: '100%' }}
    />
  );
};

export default BarChart;
