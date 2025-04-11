import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiScoring = createApi({
  reducerPath: "ApiScoring",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/scoring",
    credentials: "include",
  }),
  tagTypes: ["target"],
  endpoints: (builder) => ({
    getGrades: builder.query({
      query: () => "/get-grades",
    }),
    getTargets: builder.query({
      query: () => "/get-targets",
      providesTags: ["target"],
    }),
    addTarget: builder.mutation({
      query: (target) => ({
        url: "/add-target",
        method: "POST",
        body: target,
      }),
      invalidatesTags: ["target"],
    }),
    deleteTarget: builder.mutation({
      query: (id) => ({
        url: "/delete-target",
        method: "DELETE",
        params: { id },
      }),
      invalidatesTags: ["target"],
    }),
  }),
});

export const {
  useGetTargetsQuery,
  useGetGradesQuery,
  useAddTargetMutation,
  useDeleteTargetMutation,
} = ApiScoring;
