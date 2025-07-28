import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import { API_URL, ENDPOINTS } from '../../../constants/api';

const minioApi = createApi({
  reducerPath: 'minioApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createAImodelInRepository: builder.mutation({
      query: (newAImodel) => ({
        url: ENDPOINTS.aiModelsRepository,
        method: 'POST',
        body: newAImodel,
      }),
    }),
    getAImodelsInRepository: builder.query({
      query: () => ENDPOINTS.aiModelsRepository,
    }),
  }),
});

export const {
  useCreateAImodelInRepositoryMutation,
  useLazyGetAImodelsInRepositoryQuery,
  useGetAImodelsInRepositoryQuery,
} = minioApi;

export default minioApi;
