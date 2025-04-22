import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAuth = createApi({
  reducerPath: "ApiAuth",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/auth`,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Cache-Control", "no-cache");
      return headers;
    },
    timeout: 10000,
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    signin: builder.mutation({
      query: (body) => ({
        url: "/signin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    signup: builder.mutation({
      query: (body) => ({
        url: "/signup",
        method: "POST",
        body,
      }),
    }),
    loadUser: builder.mutation({
      query: () => ({
        url: "/load-user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSigninMutation,
  useSignupMutation,
  useLoadUserMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = ApiAuth;
