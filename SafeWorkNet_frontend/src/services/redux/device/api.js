import defaultApi from '../api';
import { ENDPOINTS } from '../../../constants/api';
import { transformParamsToPath } from '../../../utils/utils';

const devicesApi = defaultApi.injectEndpoints({
  endpoints: (builder) => ({
    getDevices: builder.query({
      query: (payload) => {
        const pathQuery = transformParamsToPath(payload);
        return `${ENDPOINTS.devices}${pathQuery}`;
      },
      providesTags: (result) => (result
        ? [
          result.data.map(({ id }) => ({ type: 'Devices', id })),
          { type: 'Devices', id: 'LIST' },
        ]
        : [{ type: 'Devices', id: 'LIST' }]),
    }),
    getDeviceById: builder.query({
      query: (id) => `${ENDPOINTS.devices}/${id}`,
      providesTags: (result) => [{ type: 'Devices', id: result.id }, 'Devices'],
    }),
    createDevice: builder.mutation({
      query: (newDevice) => ({
        url: ENDPOINTS.devices,
        method: 'POST',
        body: newDevice,
      }),
      invalidatesTags: ['Devices'],
    }),
    updateDevice: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `${ENDPOINTS.devices}/${id}`,
        method: 'PATCH',
        body: updateData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Devices', id: arg.id }],
    }),
    deleteDevice: builder.mutation({
      query: (ids) => ({
        url: ENDPOINTS.devices,
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: (result, error, arg) => arg.ids.map((id) => [{ type: 'Devices', id }, { type: 'Devices', id: 'LIST' }]),
    }),
  }),
});

export const {
  useGetDevicesQuery,
  useLazyGetDeviceByIdQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
} = devicesApi;

export default devicesApi;
