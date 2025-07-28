import defaultApi from '../api';
import { ENDPOINTS } from '../../../constants/api';
import { transformParamsToPath } from '../../../utils/utils';

const notificationsApi = defaultApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (payload) => {
        const pathQuery = transformParamsToPath(payload);
        return `${ENDPOINTS.notifications}${pathQuery}`;
      },
      providesTags: (result) => (result
        ? [
          ...result.data.map(({ id }) => ({ type: 'Notifications', id })),
          { type: 'Notifications', id: 'LIST' },
        ]
        : [{ type: 'Notifications', id: 'LIST' }]),
    }),
    getNotificationById: builder.query({
      query: (id) => `${ENDPOINTS.notifications}/${id}`,
      providesTags: (result) => [{ type: 'Notifications', id: result.id }, 'Notifications'],
    }),
    updateNotification: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `${ENDPOINTS.notifications}/${id}`,
        method: 'PATCH',
        body: updateData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Notifications', id: arg.id }],
    }),
    getNotificationHistory: builder.query({
      query: (notificationId) => `${ENDPOINTS.history}/${notificationId}`,
      providesTags: (result, error, arg) => [{ type: 'NotificationHistory', id: arg }],
    }),
    createUpdateHistory: builder.mutation({
      query: (historyData) => ({
        url: `${ENDPOINTS.history}`,
        method: 'POST',
        body: historyData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'NotificationHistory', id: arg.notificationId }],
    }),
    deleteNotification: builder.mutation({
      query: (ids) => ({
        url: ENDPOINTS.notifications,
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: (result, error, arg) => {
        const deletedIds = Array.isArray(arg.ids) ? arg.ids : [arg.ids];
        return [
          { type: 'Notifications', id: 'LIST' },
          ...deletedIds.map((id) => ({ type: 'Notifications', id })),
        ];
      },
    }),
    getVideoUrl: builder.query({
      query: (fileName) => ({
        url: `${ENDPOINTS.minio}/videourl?fileName=${fileName}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationHistoryQuery,
  useCreateUpdateHistoryMutation,
  useGetVideoUrlQuery,
} = notificationsApi;

export default notificationsApi;
