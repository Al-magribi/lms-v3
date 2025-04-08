import express from "express"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Otentikasi
import routerAuth from "./router/auth/routerAuth.js"

// Admin Pusat
import routerHomebase from "./router/center/routerHomebase.js"
import routerAdmin from "./router/center/routerAdmin.js"

// Admin Satuan
import routerPeriode from "./router/admin/routerPeriode.js"
import routerGrade from "./router/admin/routerGrade.js"
import routerStudent from "./router/admin/routerStudent.js"
import routerMajor from "./router/admin/routerMajor.js"
import routerClass from "./router/admin/routerClass.js"
import routerTeacher from "./router/admin/routerTeacher.js"
import routerSubject from "./router/admin/routerSubject.js"

// CBT
import routerBank from "./router/cbt/routerBank.js"
import routerExam from "./router/cbt/routerExam.js"

// LMS
import routerChapter from "./router/lms/routerChapter.js"

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Static Folder
app.use("/assets", express.static(path.join(__dirname, "assets")))

// Router
app.use("/api/auth", routerAuth)
app.use("/api/center/homebase", routerHomebase)
app.use("/api/center/admin", routerAdmin)

app.use("/api/admin/periode", routerPeriode)
app.use("/api/admin/major", routerMajor)
app.use("/api/admin/grade", routerGrade)
app.use("/api/admin/student", routerStudent)
app.use("/api/admin/class", routerClass)
app.use("/api/admin/teacher", routerTeacher)
app.use("/api/admin/subject", routerSubject)

app.use("/api/bank", routerBank)
app.use("/api/exam", routerExam)

app.use("/api/chapter", routerChapter)

export default app
