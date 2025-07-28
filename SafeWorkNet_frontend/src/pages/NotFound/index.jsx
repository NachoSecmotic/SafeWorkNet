import React from 'react';
import { injectIntl } from 'react-intl';

function NotFound() {
  return (
    <div style={{ height: '100%' }} className="d-flex justify-content-center align-items-center">
      <h1 style={{ color: 'white' }}>
        PAGE NOT FOUND. Go back to
        <a href="dashboards" title="dashboard" style={{ marginLeft: '5px' }}>dashboards</a>
      </h1>
    </div>
  );
}

export default injectIntl(NotFound);
