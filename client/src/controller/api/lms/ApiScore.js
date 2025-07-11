import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiScore = createApi({
  reducerPath: "ApiScore",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/scores`,
  }),
  endpoints: (builder) => ({
    getScore: builder.query({
      query: () => "/get-score",
    }),
  }),
});

export const { useGetScoreQuery } = ApiScore;
