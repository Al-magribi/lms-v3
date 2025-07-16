import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiScore = createApi({
  reducerPath: "ApiScore",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/scores` }),

  endpoints: (builder) => ({
    getStudents: builder.query({
      query: ({ page, limit, search, classid }) => ({
        url: "/get-students",
        method: "GET",
        params: { page, limit, search, classid },
      }),
    }),
  }),
});

export const { useGetStudentsQuery } = ApiScore;
