import React, { useState } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { minMax, dragBoundFunc } from '../utils';
import { primary, white, backgroundPolygon } from '../../../../../sass/variables';
import { getHash } from '../../../../../utils/utils';
/**
 *
 * @param {minMaxX} props
 * minMaxX[0]=>minX
 * minMaxX[1]=>maxX
 *
 */
function PolygonAnnotation(props) {
  const {
    points,
    flattenedPoints,
    isFinished,
    handlePointDragMove,
    handleGroupDragEnd,
    handleMouseOverStartPoint,
    handleMouseOutStartPoint,
    enabledDrawing,
  } = props;
  const vertexRadius = 6;

  const [stage, setStage] = useState();
  const handleGroupMouseOver = (e) => {
    if (!isFinished) return;
    e.target.getStage().container().style.cursor = 'move';
    setStage(e.target.getStage());
  };
  const handleGroupMouseOut = (e) => {
    e.target.getStage().container().style.cursor = 'default';
  };
  const [minMaxX, setMinMaxX] = useState([0, 0]);
  const [minMaxY, setMinMaxY] = useState([0, 0]);
  const handleGroupDragStart = () => {
    const arrX = points.map((p) => p[0]);
    const arrY = points.map((p) => p[1]);
    setMinMaxX(minMax(arrX));
    setMinMaxY(minMax(arrY));
  };
  const groupDragBound = (pos) => {
    let { x, y } = pos;
    const sw = stage.width();
    const sh = stage.height();
    if (minMaxY[0] + y < 0) y = -1 * minMaxY[0];
    if (minMaxX[0] + x < 0) x = -1 * minMaxX[0];
    if (minMaxY[1] + y > sh) y = sh - minMaxY[1];
    if (minMaxX[1] + x > sw) x = sw - minMaxX[1];
    return { x, y };
  };
  return (
    <Group
      name="polygon"
      draggable={isFinished}
      onDragStart={handleGroupDragStart}
      onDragEnd={handleGroupDragEnd}
      dragBoundFunc={groupDragBound}
      onMouseOver={handleGroupMouseOver}
      onMouseOut={handleGroupMouseOut}
    >
      <Line
        points={flattenedPoints}
        stroke={primary}
        strokeWidth={2}
        closed={isFinished}
        fill={backgroundPolygon}
      />
      {enabledDrawing && points.map((point, index) => {
        const x = point[0] - vertexRadius / 2;
        const y = point[1] - vertexRadius / 2;
        const startPointAttr = index === 0
          ? {
            hitStrokeWidth: 12,
            onMouseOver: handleMouseOverStartPoint,
            onMouseOut: handleMouseOutStartPoint,
          }
          : null;
        return (
          <Circle
            key={getHash(index.toString())}
            x={x}
            y={y}
            radius={vertexRadius}
            fill={white}
            stroke={primary}
            strokeWidth={2}
            draggable
            onDragMove={handlePointDragMove}
            dragBoundFunc={(pos) => dragBoundFunc(stage.width(), stage.height(), vertexRadius, pos)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...startPointAttr}
          />
        );
      })}
    </Group>
  );
}

export default PolygonAnnotation;
