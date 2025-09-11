import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiParent = createApi({
  reducerPath: "ApiParent",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/parent",
    credentials: "include",
  }),
  tagTypes: ["parents"],
  endpoints: (builder) => ({
    getParents: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get-parents",
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["parents"],
    }),
  }),
});

export const { useGetParentsQuery } = ApiParent;
