import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';

const KEYCLOAK_URL = window._env_.REACT_APP_KEYCLOAK_URL;
const REALM_ID = window._env_.REACT_APP_KEYCLOAK_REALM_ID;

const transformIntoFormData = (credentials) => {
  const params = new URLSearchParams();
  Object.keys(credentials).forEach((key) => {
    params.append(key, credentials[key]);
  });
  return params;
};

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: window._env_.REACT_APP_KEYCLOAK_URL,
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `${KEYCLOAK_URL}/realms/${REALM_ID}/protocol/openid-connect/token`,
        method: 'POST',
        body: transformIntoFormData({
          client_id: window._env_.REACT_APP_KEYCLOAK_CLIENT_ID,
          client_secret: window._env_.REACT_APP_KEYCLOAK_CLIENT_SECRET,
          grant_type: 'password',
          username: credentials.username,
          password: credentials.password,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      transformResponse: (response) => ({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${KEYCLOAK_URL}/realms/${REALM_ID}/protocol/openid-connect/logout`,
        method: 'POST',
        body: new URLSearchParams({
          client_id: window._env_.REACT_APP_KEYCLOAK_CLIENT_ID,
          client_secret: window._env_.REACT_APP_KEYCLOAK_CLIENT_SECRET,
          refresh_token: localStorage.getItem('refreshToken'),
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      transformResponse: () => {},
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: `${KEYCLOAK_URL}/realms/${REALM_ID}/protocol/openid-connect/token`,
        method: 'POST',
        body: new URLSearchParams({
          client_id: window._env_.REACT_APP_KEYCLOAK_CLIENT_ID,
          client_secret: window._env_.REACT_APP_KEYCLOAK_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      transformResponse: (response) => {
        const { accessToken, refreshToken } = response;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        return { access_token: accessToken, refresh_token: refreshToken };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;

export default authApi;
