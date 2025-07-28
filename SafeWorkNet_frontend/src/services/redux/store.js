import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import api from './api';
import authApi from './auth/api';
import authReducer from './auth/slice';
import minioApi from './mino/api';
import authMiddleware from './authMiddleware';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [api.reducerPath]: api.reducer,
    [minioApi.reducerPath]: minioApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(api.middleware, authMiddleware)
    .concat(authApi.middleware)
    .concat(minioApi.middleware),
});

setupListeners(store.dispatch);

export default store;
