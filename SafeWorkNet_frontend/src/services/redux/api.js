import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../../constants/api';

const api = createApi({
  reducerPath: 'api',
  tagTypes: ['VideoStreams', 'AImodels', 'Notifications', 'NotificationHistory', 'Devices'],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      return headers;
    },
  }),
  endpoints: () => ({}),
});

export default api;
