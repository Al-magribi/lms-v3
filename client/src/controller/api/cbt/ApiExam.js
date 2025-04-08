import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const ApiExam = createApi({
	reducerPath: "ApiExam",
	baseQuery: fetchBaseQuery({ baseUrl: "/api/exam", credentials: "include" }),
	tagTypes: ["class", "exam"],
	endpoints: (builder) => ({
		getClasses: builder.query({
			query: () => ({
				url: "/get-class",
				method: "GET",
			}),
			invalidatesTags: ["class"],
		}),
		createExam: builder.mutation({
			query: (body) => ({
				url: "/create-exam",
				method: "POST",
				body,
			}),
			invalidatesTags: ["exam"],
		}),
		getExams: builder.query({
			query: ({ page, limit, search }) => ({
				url: "/get-exam",
				method: "GET",
				params: { page, limit, search },
			}),
			providesTags: ["exam"],
		}),
		deleteExam: builder.mutation({
			query: (id) => ({
				url: "/delete-exam",
				method: "DELETE",
				params: { id },
			}),
			invalidatesTags: ["exam"],
		}),
		changeStatus: builder.mutation({
			query: (id) => ({
				url: "/change-status",
				method: "PUT",
				params: { id },
			}),
			invalidatesTags: ["exam"],
		}),
	}),
})

export const {
	useGetClassesQuery,
	useCreateExamMutation,
	useGetExamsQuery,
	useDeleteExamMutation,
	useChangeStatusMutation,
} = ApiExam
