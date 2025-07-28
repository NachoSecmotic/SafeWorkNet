import React from 'react';
import { injectIntl } from 'react-intl';
import styles from './styles.module.scss';

const {
  containerVideoStream,
  containerClass,
} = styles;
function StreamPlayer({ streamUrl, alt }) {
  return (
    <div className={containerVideoStream}>
      <iframe
        src={streamUrl}
        style={{ width: '100%', height: '100%' }}
        title={alt || 'Video Stream'}
        className={containerClass}
      />
    </div>
  );
}
export default injectIntl(StreamPlayer);
