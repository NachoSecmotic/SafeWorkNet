/* eslint-disable react/button-has-type */
import React from 'react';
import './styles.scss';

function CustomButton({
  onClick,
  msg,
  iconLeft,
  className,
  htmlType,
  disabled,
  iconRight,
  style,
  tooltip,
}) {
  const classButton = `customButton ${className}`;
  return (
    <button
      style={style}
      className={`${classButton} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      type={htmlType}
      disabled={disabled}
      id="CVSECButton"
    >
      {iconLeft || null}
      {msg}
      {iconRight || null}
      {tooltip && (
        <div className="cvsecTooltipButton">
          {tooltip}
          <div className="arrowTooltip" />
        </div>
      )}
    </button>
  );
}

CustomButton.defaultProps = {
  onClick: () => { },
  msg: undefined,
  classIconLeft: undefined,
  classIconRight: undefined,
  htmlType: 'button',
  disabled: false,
  style: {},
  tooltip: false,
};

export default CustomButton;
