import { baseApi } from "./baseApi";

export const balanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserBalance: builder.query<any, string>({
      query: (objectId) => `/transaction/balance/${objectId}`,
      providesTags: (result, error, objectId) => [
        { type: "UserBalance", id: objectId },
      ],
    }),
  }),
});

export const { useGetUserBalanceQuery } = balanceApi;
