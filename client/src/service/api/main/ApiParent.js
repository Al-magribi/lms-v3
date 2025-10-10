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
    saveParent: builder.mutation({
      query: (body) => ({
        url: "/add-parent",
        method: "POST",
        body,
      }),
      invalidatesTags: ["parents"],
    }),
    deleteParent: builder.mutation({
      query: (id) => ({
        url: "/delete-parent",
        params: { id },
        method: "DELETE",
      }),
      invalidatesTags: ["parents"],
    }),
    uploadParents: builder.mutation({
      query: (body) => ({
        url: "/upload-parents",
        method: "POST",
        body,
      }),
      invalidatesTags: ["parents"],
    }),
  }),
});

export const {
  useGetParentsQuery,
  useSaveParentMutation,
  useDeleteParentMutation,
  useUploadParentsMutation,
} = ApiParent;
