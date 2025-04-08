import { configureStore } from "@reduxjs/toolkit"
// otentikasi
import AuthSlice from "./slice/AuthSlice"
import { ApiAuth } from "./api/auth/ApiAuth"

// center
import { ApiHomebase } from "./api/center/ApiHomebase"
import { ApiAdmin } from "./api/center/ApiAdmin"

// Admin satuan
import { ApiPeriode } from "./api/admin/ApiPeriode"
import { ApiGrade } from "./api/admin/ApiGrade"
import { ApiStudent } from "./api/admin/ApiStudent"
import { ApiTeacher } from "./api/admin/ApiTeacher"
import { ApiMajor } from "./api/admin/ApiMajor"
import { ApiClass } from "./api/admin/ApiClass"
import { ApiSubject } from "./api/admin/ApiSubject"

// CBT
import { ApiBank } from "./api/cbt/ApiBank"
import { ApiExam } from "./api/cbt/ApiExam"

// LMS
import { ApiChapter } from "./api/lms/ApiChapter"

const store = configureStore({
	reducer: {
		auth: AuthSlice,
		[ApiAuth.reducerPath]: ApiAuth.reducer,
		[ApiHomebase.reducerPath]: ApiHomebase.reducer,
		[ApiAdmin.reducerPath]: ApiAdmin.reducer,

		[ApiPeriode.reducerPath]: ApiPeriode.reducer,
		[ApiGrade.reducerPath]: ApiGrade.reducer,
		[ApiStudent.reducerPath]: ApiStudent.reducer,
		[ApiTeacher.reducerPath]: ApiTeacher.reducer,
		[ApiMajor.reducerPath]: ApiMajor.reducer,
		[ApiClass.reducerPath]: ApiClass.reducer,
		[ApiSubject.reducerPath]: ApiSubject.reducer,

		[ApiBank.reducerPath]: ApiBank.reducer,
		[ApiExam.reducerPath]: ApiExam.reducer,

		[ApiChapter.reducerPath]: ApiChapter.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat([
			ApiAuth.middleware,
			ApiHomebase.middleware,
			ApiAdmin.middleware,

			ApiPeriode.middleware,
			ApiGrade.middleware,
			ApiStudent.middleware,
			ApiTeacher.middleware,
			ApiMajor.middleware,
			ApiClass.middleware,
			ApiSubject.middleware,

			ApiBank.middleware,
			ApiExam.middleware,

			ApiChapter.middleware,
		]),
})

export default store
