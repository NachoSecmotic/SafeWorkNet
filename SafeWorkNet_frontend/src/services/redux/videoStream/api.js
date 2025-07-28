import defaultApi from '../api';
import { ENDPOINTS } from '../../../constants/api';
import { transformParamsToPath } from '../../../utils/utils';

const videoStreamsApi = defaultApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideoStreams: builder.query({
      query: (payload) => {
        const pathQuery = transformParamsToPath(payload);
        return `${ENDPOINTS.videoStreams}${pathQuery}`;
      },
      providesTags: (result) => (result
        ? [
          result.data.map(({ id }) => ({ type: 'AImodels', id })),
          { type: 'VideoStreams', id: 'LIST' },
        ]
        : [{ type: 'VideoStreams', id: 'LIST' }]),
    }),
    getVideoStreamById: builder.query({
      query: (id) => `${ENDPOINTS.videoStreams}/${id}`,
      providesTags: (result) => [{ type: 'VideoStreams', id: result.id }, 'VideoStreams'],
    }),
    createVideoStream: builder.mutation({
      query: (newVideo) => ({
        url: ENDPOINTS.videoStreams,
        method: 'POST',
        body: newVideo,
      }),
      invalidatesTags: ['VideoStreams'],
    }),
    updateVideoStream: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `${ENDPOINTS.videoStreams}/${id}`,
        method: 'PATCH',
        body: updateData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'VideoStreams', id: arg.id }],
    }),
    deleteVideoStream: builder.mutation({
      query: (ids) => ({
        url: ENDPOINTS.videoStreams,
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: (result, error, arg) => arg.ids.map((id) => [{ type: 'VideoStreams', id }, { type: 'VideoStreams', id: 'LIST' }]),
    }),
  }),
});

export const {
  useGetVideoStreamsQuery,
  useGetVideoStreamByIdQuery,
  useCreateVideoStreamMutation,
  useUpdateVideoStreamMutation,
  useDeleteVideoStreamMutation,
} = videoStreamsApi;

export default videoStreamsApi;
