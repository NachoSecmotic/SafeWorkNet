/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { injectIntl } from 'react-intl';
import { Floppy, Reply, Trash } from 'react-bootstrap-icons';
import PolygonAnnotation from '../components/PolygonAnnotation';
import CustomButton from '../../../../../components/CustomButton';
import styles from '../styles.module.scss';

const {
  canvasStyle, canvasButtons, disabled,
} = styles;

function Canvas({
  intl, width, height, saveSections, polygonCoordinates, setSections,
  enabledDrawing, isDrawing, setIsDrawing, id,
}) {
  const [points, setPoints] = useState([]);
  const [flattenedPoints, setFlattenedPoints] = useState();
  const [position, setPosition] = useState([0, 0]);
  const [isMouseOverPoint, setMouseOverPoint] = useState(false);
  const [isPolyComplete, setPolyComplete] = useState(false);
  const [isPolygonModify, setIsPolygonModify] = useState(false);

  const getMousePos = (stage) => [stage.getPointerPosition().x, stage.getPointerPosition().y];

  const handleMouseDown = (e) => {
    if (isPolyComplete) return;
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    if (isMouseOverPoint && points.length >= 3) {
      setIsDrawing(false);
      setPolyComplete(true);
    } else {
      setIsDrawing(true);
      setPoints([...points, mousePos]);
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const mousePos = getMousePos(stage);
    setPosition(mousePos);
  };

  const handleMouseOverStartPoint = (e) => {
    if (isPolyComplete || points.length < 3) return;
    e.target.scale({ x: 3, y: 3 });
    setMouseOverPoint(true);
  };

  const handleMouseOutStartPoint = (e) => {
    e.target.scale({ x: 1, y: 1 });
    setMouseOverPoint(false);
  };

  const handlePointDragMove = (e) => {
    const stage = e.target.getStage();
    const index = e.target.index - 1;
    // eslint-disable-next-line no-underscore-dangle
    const pos = [e.target._lastPos.x, e.target._lastPos.y];
    if (pos[0] < 0) pos[0] = 0;
    if (pos[1] < 0) pos[1] = 0;
    if (pos[0] > stage.width()) pos[0] = stage.width();
    if (pos[1] > stage.height()) pos[1] = stage.height();
    setPoints([...points.slice(0, index), pos, ...points.slice(index + 1)]);
  };

  useEffect(() => {
    if (polygonCoordinates && polygonCoordinates.length > 0) {
      setPoints(polygonCoordinates);
      setPolyComplete(true);
    }
  }, [polygonCoordinates]);

  useEffect(() => {
    setFlattenedPoints(
      points
        .concat(isPolyComplete ? [] : position)
        .reduce((a, b) => a.concat(b), []),
    );
  }, [points, isPolyComplete, position]);

  useEffect(() => {
    if (isPolyComplete || isPolygonModify) {
      setSections((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          name: id,
          coordinates: points,
        },
      }));
      setIsPolygonModify(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPolyComplete, isPolygonModify]);

  const undo = () => {
    setPoints(points.slice(0, -1));
    setPolyComplete(false);
    setIsDrawing(points.length);
    setPosition(points[points.length - 1]);
  };

  const reset = () => {
    setPoints([]);
    setIsDrawing(false);
    setPolyComplete(false);
  };

  const handleGroupDragEnd = (e) => {
    if (e.target.name() === 'polygon') {
      const result = [];
      const copyPoints = [...points];
      copyPoints.forEach(
        (point) => result.push([point[0] + e.target.x(), point[1] + e.target.y()]),
      );
      e.target.position({ x: 0, y: 0 });
      setPoints(result);
    }
    setIsPolygonModify(true);
  };

  return (
    <div className={`${canvasStyle} canvasPolygon`} id={id}>
      <div className={canvasButtons}>
        <CustomButton
          className={`${!enabledDrawing ? 'hidden' : ''} ${isDrawing ? disabled : ''}`}
          onClick={!isDrawing ? () => saveSections() : () => {}}
          iconLeft={<Floppy />}
          tooltip={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.save' })}
        />
        <CustomButton
          className={!enabledDrawing ? 'hidden' : ''}
          onClick={() => undo()}
          iconLeft={<Reply style={{ transform: 'scale(1.5)', marginBottom: '0.2rem' }} />}
          tooltip={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.undo' })}
        />
        <CustomButton
          className={!enabledDrawing ? 'hidden' : ''}
          onClick={() => reset()}
          iconLeft={<Trash />}
          tooltip={intl.formatMessage({ id: 'videoStreams.edition.canvasPolygon.delete' })}
        />
      </div>
      <Stage
        width={width || 650}
        height={height || 302}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="rgba(255, 255, 255, 0.1)"
          />
          <PolygonAnnotation
            enabledDrawing={enabledDrawing}
            points={points}
            flattenedPoints={flattenedPoints}
            handlePointDragMove={handlePointDragMove}
            handleGroupDragEnd={handleGroupDragEnd}
            handleMouseOverStartPoint={handleMouseOverStartPoint}
            handleMouseOutStartPoint={handleMouseOutStartPoint}
            isFinished={isPolyComplete}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default injectIntl(Canvas);
