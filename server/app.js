import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import useragent from "express-useragent";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Otentikasi
import routerAuth from "./router/auth/routerAuth.js";

// Admin Pusat
import routerHomebase from "./router/center/routerHomebase.js";
import routerAdmin from "./router/center/routerAdmin.js";

// Admin Satuan
import routerPeriode from "./router/admin/routerPeriode.js";
import routerGrade from "./router/admin/routerGrade.js";
import routerStudent from "./router/admin/routerStudent.js";
import routerMajor from "./router/admin/routerMajor.js";
import routerClass from "./router/admin/routerClass.js";
import routerTeacher from "./router/admin/routerTeacher.js";
import routerSubject from "./router/admin/routerSubject.js";

// CBT
import routerBank from "./router/cbt/routerBank.js";
import routerExam from "./router/cbt/routerExam.js";
import routerAnswer from "./router/cbt/routerAnswer.js";
// LMS
import routerChapter from "./router/lms/routerChapter.js";
import routerLmsStudent from "./router/lms/routerLms.js";

// Tahfiz
import routerSurah from "./router/tahfiz/routerSurah.js";
import routerScoring from "./router/tahfiz/routerScoring.js";
import routerExaminer from "./router/tahfiz/routerExaminer.js";
import routerMetrics from "./router/tahfiz/routerMetrics.js";
import routerReport from "./router/tahfiz/routerReport.js";

// Dashboard
import routerDash from "./router/dashboard/routerDash.js";

// Logs
import routerLogs from "./router/logs/routersLogs.js";

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(useragent.express());
// Static Folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Router
app.use("/api/auth", routerAuth);
app.use("/api/center/homebase", routerHomebase);
app.use("/api/center/admin", routerAdmin);

app.use("/api/admin/periode", routerPeriode);
app.use("/api/admin/major", routerMajor);
app.use("/api/admin/grade", routerGrade);
app.use("/api/admin/student", routerStudent);
app.use("/api/admin/class", routerClass);
app.use("/api/admin/teacher", routerTeacher);
app.use("/api/admin/subject", routerSubject);

app.use("/api/bank", routerBank);
app.use("/api/exam", routerExam);
app.use("/api/answer", routerAnswer);
app.use("/api/chapter", routerChapter);
app.use("/api/lms", routerLmsStudent);

app.use("/api/quran", routerSurah);
app.use("/api/scoring", routerScoring);
app.use("/api/examiner", routerExaminer);
app.use("/api/metrics", routerMetrics);
app.use("/api/report", routerReport);

app.use("/api/dash", routerDash);

app.use("/api/logs", routerLogs);

export default app;
