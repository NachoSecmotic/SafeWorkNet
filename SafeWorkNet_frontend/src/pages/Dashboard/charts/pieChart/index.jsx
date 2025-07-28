/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useRef } from 'react';
import { Pie } from '@antv/g2plot';
import colorDict from '../common/colorDict';

const PieChart = ({ data, setSelectedLabel }) => {
  const pieChartRef = useRef(null);

  useEffect(() => {
    if (!pieChartRef.current) {
      pieChartRef.current = new Pie(document.getElementById('pieChartContainer'), {
        data,
        angleField: 'count',
        colorField: 'label',
        color: (datum) => colorDict[datum.label] || colorDict.other,
        radius: 0.8,
        label: {
          type: 'spider',
          labelHeight: 28,
          style: {
            fontSize: 16,
            fill: '#fff',
          },
        },
        legend: {
          position: 'right',
          layout: 'vertical',
          itemName: {
            style: {
              fill: 'white',
              fontSize: 14,
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

      pieChartRef.current.render();

      pieChartRef.current.on('element:click', (event) => {
        const clickedLabel = event.data.data.label;
        setSelectedLabel((prev) => (prev === clickedLabel ? null : clickedLabel));
      });
    } else {
      pieChartRef.current.changeData(data);
    }
  }, [data, setSelectedLabel]);

  return <div id="pieChartContainer" style={{ height: '300px', width: '500px', margin: '0 auto' }} />;
};

export default PieChart;
