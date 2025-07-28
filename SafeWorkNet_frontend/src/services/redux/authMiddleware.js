import { isRejectedWithValue } from '@reduxjs/toolkit';
import { logout } from './auth/slice';

const authMiddleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    if (action.payload?.status === 401) {
      store.dispatch(logout());
    }
  }

  return next(action);
};

export default authMiddleware;
