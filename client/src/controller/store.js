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

// Tahfiz
import { ApiQuran } from "./api/tahfiz/ApiQuran"
import { ApiScoring } from "./api/tahfiz/ApiScoring"
import { ApiExaminer } from "./api/tahfiz/ApiExaminer"
import { ApiMetric } from "./api/tahfiz/ApiMetric"
import { ApiReport } from "./api/tahfiz/ApiReport"

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

		[ApiQuran.reducerPath]: ApiQuran.reducer,
		[ApiScoring.reducerPath]: ApiScoring.reducer,
		[ApiExaminer.reducerPath]: ApiExaminer.reducer,
		[ApiMetric.reducerPath]: ApiMetric.reducer,
		[ApiReport.reducerPath]: ApiReport.reducer,
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

			ApiQuran.middleware,
			ApiScoring.middleware,
			ApiExaminer.middleware,
			ApiMetric.middleware,
			ApiReport.middleware,
		]),
})

export default store
