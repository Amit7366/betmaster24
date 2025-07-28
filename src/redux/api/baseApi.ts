// redux/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;

      if (token) {
        headers.set("Authorization", `${token}`);
      }
      console.log(token);
      return headers;
    },
  }),
  // ✅ Declare all valid tag types here
  tagTypes: ["UserBalance","GroupedGames", "GamesByProvider","GamesByCategory"],

  endpoints: () => ({}),
});
