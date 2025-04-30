import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiHomepage = createApi({
  reducerPath: "ApiHomepage",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/cms/homepage`,
    credentials: "include",
  }),
  tagTypes: ["Homepage"],
  endpoints: (builder) => ({
    getHomepage: builder.query({
      query: () => "/get-data",
      providesTags: ["Homepage"],
    }),
    updateHomepage: builder.mutation({
      query: (data) => ({
        url: "/homepage",
        method: "PUT",
        body: data,
        // Don't set Content-Type header, let the browser set it with the boundary
        formData: true,
      }),
      invalidatesTags: ["Homepage"],
    }),
  }),
});

export const { useGetHomepageQuery, useUpdateHomepageMutation } = ApiHomepage;
