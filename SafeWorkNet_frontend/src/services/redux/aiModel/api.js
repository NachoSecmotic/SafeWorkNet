import defaultApi from '../api';
import { ENDPOINTS } from '../../../constants/api';
import { transformParamsToPath } from '../../../utils/utils';

const aiModelsApi = defaultApi.injectEndpoints({
  endpoints: (builder) => ({
    getAImodels: builder.query({
      query: (payload) => {
        const pathQuery = transformParamsToPath(payload);
        return `${ENDPOINTS.aiModels}${pathQuery}`;
      },
      providesTags: (result) => (result
        ? [
          result.data.map(({ id }) => ({ type: 'AImodels', id })),
          { type: 'AImodels', id: 'LIST' },
        ]
        : [{ type: 'AImodels', id: 'LIST' }]),
    }),
    getAImodelById: builder.query({
      query: (id) => `${ENDPOINTS.aiModels}/${id}`,
      providesTags: (result) => [{ type: 'AImodels', id: result.id }],
    }),
    createAImodel: builder.mutation({
      query: (newAImodel) => ({
        url: ENDPOINTS.aiModels,
        method: 'POST',
        body: newAImodel,
      }),
      invalidatesTags: ['AImodels'],
    }),
    updateAImodel: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `${ENDPOINTS.aiModels}/${id}`,
        method: 'PATCH',
        body: updateData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'AImodels', id: arg.id }, { type: 'AImodels', id: 'LIST' }],
    }),
    deleteAImodels: builder.mutation({
      query: (ids) => ({
        url: ENDPOINTS.aiModels,
        method: 'DELETE',
        body: ids,
      }),
      invalidatesTags: (result, error, arg) => arg.ids.map((id) => [{ type: 'AImodels', id }, { type: 'AImodels', id: 'LIST' }]),
    }),
  }),
});

export const {
  useGetAImodelsQuery,
  useLazyGetAImodelsQuery,
  useGetAImodelByIdQuery,
  useCreateAImodelMutation,
  useUpdateAImodelMutation,
  useDeleteAImodelsMutation,
} = aiModelsApi;

export default aiModelsApi;
