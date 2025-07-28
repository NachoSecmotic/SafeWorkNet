import React from 'react';
import { injectIntl } from 'react-intl';

function Users() {
  return (
    <div style={{ height: '100%' }} className="d-flex justify-content-center align-items-center">
      <h1 style={{ color: 'white' }}>
        Users
      </h1>
    </div>
  );
}

export default injectIntl(Users);
