import{r as o,ak as M,j as e,f as B,d as J,af as U,al as G,e as S,am as A,ai as F,an as H,ao as q,ap as Q,aq as W}from"./index-B88h2kYZ.js";import{L as K}from"./Layout-BzzV81EK.js";import{T as P}from"./Table-BvY52Fag.js";import{C as O,b as Y,L as Z,e as D,f as X,c as V,p as ee,a as se,i as ae,g as te}from"./index-BbGvQZUe.js";import{u as L,w as T}from"./xlsx-BPPrXeCd.js";const ne=({classid:s,setClassid:d,examid:r,name:n,token:f,onRefetch:i,activeView:b,setActiveView:m,onExport:l})=>{const[g,t]=o.useState(null),{data:N,refetch:p}=M({exam:r},{skip:!r}),j=()=>{t(new Date().toLocaleString()),p(),i()};return e.jsx("div",{className:"card my-1",children:e.jsxs("div",{className:"card-body d-flex justify-content-between align-items-center",children:[e.jsxs("div",{className:"d-flex flex-column gap-1 align-items-start",children:[e.jsxs("div",{className:"d-flex gap-2 align-items-center",children:[e.jsx("p",{className:"m-0 h5",children:n==null?void 0:n.replace(/-/g," ")}),e.jsx("span",{className:"badge bg-primary m-0",children:f})]}),g&&e.jsxs("span",{className:"badge bg-danger",children:["Terakhir diperbarui: ",g]})]}),e.jsxs("div",{className:"btn-group",children:[e.jsx("button",{className:`btn btn-sm ${b==="table"?"btn-success":"btn-outline-success"}`,onClick:()=>m("table"),children:e.jsx("i",{className:"bi bi-person-lines-fill"})}),e.jsx("button",{className:`btn btn-sm ${b==="chart"?"btn-success":"btn-outline-success"}`,onClick:()=>m("chart"),children:e.jsx("i",{className:"bi bi-bar-chart"})}),e.jsx("button",{className:`btn btn-sm ${b==="list"?"btn-success":"btn-outline-success"}`,onClick:()=>m("list"),children:e.jsx("i",{className:"bi bi-file-earmark-excel"})}),(b==="table"||b==="list")&&e.jsx("button",{className:"btn btn-sm btn-primary",onClick:l,title:"Export to Excel",children:e.jsx("i",{className:"bi bi-file-earmark-arrow-down"})})]}),e.jsxs("div",{className:"btn-group",children:[N==null?void 0:N.map(h=>e.jsx("button",{className:`btn btn-sm ${s===h.id?"btn-secondary":"btn-outline-secondary"}`,onClick:()=>d(h.id),children:h.name},h.id)),e.jsx("button",{className:"btn btn-sm btn-dark",onClick:()=>d(""),children:e.jsx("i",{className:"bi bi-recycle"})}),e.jsx("button",{className:"btn btn-sm btn-danger",onClick:j,children:e.jsx("i",{className:"bi bi-repeat"})})]})]})})},ie=(s,d,r)=>{if(!s)return;const n=window.open("","_blank");if(!n){alert("Please allow popups for this website to print.");return}const i=new Date().toLocaleString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1}),b=window.location.href,m=`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${d==null?void 0:d.replace(/-/g," ")} - ${r==null?void 0:r.student_name}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { 
            padding: 20px; 
            font-size: 12px;
          }
          .card { 
            margin-bottom: 15px; 
            border: 1px solid rgba(0,0,0,.125);
            border-radius: 0.25rem;
          }
          .card-body {
            padding: 1rem;
          }
          .badge { 
            font-size: 0.9em; 
            padding: 0.35em 0.65em;
            border-radius: 0.25rem;
            font-weight: 700;
          }
          .bg-primary {
            background-color: #0d6efd !important;
            color: white;
          }
          .bg-success {
            background-color: #198754 !important;
            color: white;
          }
          .bg-danger {
            background-color: #dc3545 !important;
            color: white;
          }
          .table {
            width: 100%;
            margin-bottom: 1rem;
            color: #212529;
            border-collapse: collapse;
          }
          .table-sm td {
            padding: 0.3rem;
          }
          .table-borderless {
            border: 0;
          }
          .d-flex {
            display: flex !important;
          }
          .justify-content-between {
            justify-content: space-between !important;
          }
          .align-items-center {
            align-items: center !important;
          }
          .gap-4 {
            gap: 1.5rem !important;
          }
          .mt-3 {
            margin-top: 1rem !important;
          }
          .mb-2 {
            margin-bottom: 0.5rem !important;
          }
          .mb-3 {
            margin-bottom: 1rem !important;
          }
          .mb-0 {
            margin-bottom: 0 !important;
          }
          .m-0 {
            margin: 0 !important;
          }
          .text-muted {
            color: #6c757d !important;
          }
          .h5 {
            font-size: 1.25rem;
            margin-top: 0;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          .alert {
            position: relative;
            padding: 0.75rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.25rem;
          }
          .alert-info {
            color: #0c5460;
            background-color: #d1ecf1;
            border-color: #bee5eb;
          }
          .alert-warning {
            color: #856404;
            background-color: #fff3cd;
            border-color: #ffeeba;
          }
          .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
          }
          .print-header {
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 5px;
            margin-bottom: 5px;
            font-size: 10px;
            color: #6c757d;
            display: flex;
            justify-content: space-between;
          }
          .print-header p {
            margin-bottom: 5px;
          }
          .print-footer {
            border-top: 1px solid #dee2e6;
            padding-top: 5px;
            margin-top: 5px;
            font-size: 10px;
            color: #6c757d;
            display: flex;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: white;
            padding: 10px 20px;
          }
          .content {
            margin-bottom: 40px; /* Space for footer */
          }
          @media print {
            .no-print { display: none; }
            body { font-size: 12px; }
            .card { page-break-inside: avoid; }
            .print-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              padding: 10px 20px;
              background-color: white;
              z-index: 1000;
            }
            .content {
              margin-top: 40px;
              margin-bottom: 40px;
            }
            @page {
              margin-top: 60px;
              margin-bottom: 60px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="print-header">
            <p>${b}</p>
          </div>
          
          <div class="content">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-3">Lembar Jawaban</h5>
                <table class="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td><strong>NIS</strong></td>
                      <td>: ${s.student_nis}</td>
                      <td><strong>Tingkat</strong></td>
                      <td>: ${s.student_grade}</td>
                      <td><strong>Ujian</strong></td>
                      <td>: ${d.replace(/-/g," ")}</td>
                    </tr>
                    <tr>
                      <td><strong>Nama</strong></td>
                      <td>: ${s.student_name}</td>
                      <td><strong>Kelas</strong></td>
                      <td>: ${s.student_class}</td>
                      <td><strong>Tanggal</strong></td>
                      <td>: ${s.log_exam?new Date(s.log_exam).toLocaleString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1}):"-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Score Summary Card -->
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title mb-3">Ringkasan Nilai</h5>
                <div class="row">
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Jawaban Benar:</span>
                      <span class="badge bg-success">${s.correct}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Jawaban Salah:</span>
                      <span class="badge bg-danger">${s.incorrect}</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Nilai PG:</span>
                      <span class="badge bg-primary">${s.pg_score}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Nilai Essay:</span>
                      <span class="badge bg-info">${s.essay_score}</span>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Total Nilai:</span>
                      <span class="badge bg-success fs-5">${s.score}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            ${s.answers&&s.answers.length>0?s.answers.map((l,g)=>{var t;return`
                <div class="card mb-3">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="card-title mb-0">
                        <span class="badge bg-primary">Pertanyaan ${g+1}</span>
                      </h6>
                      <span class="badge ${l.point>0?"bg-success":"bg-danger"}">
                        ${l.point} Poin
                      </span>
                    </div>
                    <div class="card-text">${l.question_text}</div>
                    <div class="mt-3 d-flex gap-4">
                      <p class="m-0 badge ${l.point>0?"bg-success":"bg-danger"}">
                        Jawaban Siswa: <strong>${((t=l.answer)==null?void 0:t.toUpperCase())||"-"}</strong>
                      </p>
                      <p class="m-0 badge bg-success">
                        Jawaban Benar: <strong>${l.correct}</strong>
                      </p>
                    </div>
                    ${l.essay?`
                    <div class="mt-3">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h6 class="card-subtitle mb-2 text-muted">Jawaban Essay</h6>
                          <p class="card-text">${l.essay}</p>
                          <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-info">Nilai: ${l.point}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    `:""}
                  </div>
                </div>
              `}).join(""):'<div class="alert alert-info mt-3">Tidak ada data jawaban untuk siswa ini.</div>'}
            
            <div class="no-print text-center mt-4">
              <button class="btn btn-primary" onclick="window.print()">Cetak</button>
            </div>
          </div>
          
          <div class="print-footer">
            <div>${i}</div>
            <div>Halaman <span class="pageNumber"></span></div>
          </div>
        </div>
        
        <script>
          // Add page numbers when printing
          window.onbeforeprint = function() {
            const pages = document.querySelectorAll('.pageNumber');
            for (let i = 0; i < pages.length; i++) {
              pages[i].textContent = (i + 1).toString();
            }
          };
        <\/script>
      </body>
    </html>
  `;n.document.open(),n.document.write(m),n.document.close(),n.onload=function(){n.focus(),n.print()}},le=({studentData:s})=>e.jsx("div",{className:"card mb-3",children:e.jsxs("div",{className:"card-body",children:[e.jsx("h5",{className:"card-title mb-3",children:"Ringkasan Nilai"}),e.jsxs("div",{className:"row",children:[e.jsxs("div",{className:"col-md-4",children:[e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("span",{children:"Jawaban Benar:"}),e.jsx("span",{className:"badge bg-success",children:s.correct})]}),e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("span",{children:"Jawaban Salah:"}),e.jsx("span",{className:"badge bg-danger",children:s.incorrect})]})]}),e.jsxs("div",{className:"col-md-4",children:[e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("span",{children:"Nilai PG:"}),e.jsx("span",{className:"badge bg-primary",children:s.pg_score})]}),e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("span",{children:"Nilai Essay:"}),e.jsx("span",{className:"badge bg-info",children:s.essay_score})]})]}),e.jsx("div",{className:"col-md-4",children:e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("span",{children:"Total Nilai:"}),e.jsx("span",{className:"badge bg-success fs-5",children:s.score})]})})]})]})}),re=({studentData:s,name:d})=>e.jsx("div",{className:"card mb-3",children:e.jsxs("div",{className:"card-body",children:[e.jsx("h5",{className:"card-title mb-3",children:"Lembar Jawaban"}),e.jsx("table",{className:"table table-sm table-borderless mb-0",children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:"NIS"})}),e.jsxs("td",{children:[": ",s.student_nis]}),e.jsx("td",{children:e.jsx("strong",{children:"Tingkat"})}),e.jsxs("td",{children:[": ",s.student_grade]}),e.jsx("td",{children:e.jsx("strong",{children:"Ujian"})}),e.jsxs("td",{children:[": ",d.replace(/-/g," ")]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("strong",{children:"Nama"})}),e.jsxs("td",{children:[": ",s.student_name]}),e.jsx("td",{children:e.jsx("strong",{children:"Kelas"})}),e.jsxs("td",{children:[": ",s.student_class]}),e.jsx("td",{children:e.jsx("strong",{children:"Tanggal"})}),e.jsxs("td",{children:[":"," ",s.log_exam?new Date(s.log_exam).toLocaleString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1}):"-"]})]})]})})]})}),ce=({answer:s,index:d,isTeacherOrAdmin:r,gradingAnswers:n,setGradingAnswers:f,handleGradeEssay:i,isGrading:b})=>e.jsx("div",{className:"card mb-3",children:e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-2",children:[e.jsx("h6",{className:"card-title mb-0",children:e.jsxs("span",{className:"badge bg-primary",children:["Pertanyaan ",d+1]})}),e.jsxs("span",{className:`badge ${s.point>0?"bg-success":"bg-danger"}`,children:[s.point," Poin"]})]}),e.jsx("p",{className:"card-text",dangerouslySetInnerHTML:{__html:s.question_text}}),e.jsx("div",{className:"mt-3",children:s.answer?e.jsxs("div",{className:"d-flex gap-4",children:[e.jsxs("p",{className:`m-0 badge ${s.point>0?"bg-success":"bg-danger"}`,children:["Jawaban Siswa: ",e.jsx("strong",{children:s.answer.toUpperCase()})]}),e.jsxs("p",{className:"m-0 badge bg-success",children:["Jawaban Benar: ",e.jsx("strong",{children:s.correct})]})]}):e.jsx("div",{className:"card bg-light",children:e.jsxs("div",{className:"card-body",children:[e.jsx("h6",{className:"card-subtitle mb-2 text-muted",children:"Jawaban Essay"}),e.jsx("p",{className:"card-text",children:s.essay||"-"}),r&&e.jsxs("div",{className:"mt-3",children:[e.jsxs("div",{className:"d-flex align-items-center gap-2",children:[e.jsx("input",{type:"number",className:"form-control form-control-sm",style:{width:"80px"},placeholder:"Nilai",min:"0",max:s.max_point||100,value:n[s.id]||"",onChange:m=>f({...n,[s.id]:m.target.value})}),e.jsx("button",{className:"btn btn-sm btn-primary",onClick:()=>i(s.id,s.max_point||100),disabled:b,children:b?"Menyimpan...":"Simpan Nilai"})]}),e.jsxs("small",{className:"text-muted",children:["Maksimal nilai: ",s.max_point||100]})]})]})})})]})}),de=({detail:s})=>{var $;const{examid:d,name:r}=B(),[n,f]=o.useState(!1),{user:i}=J(w=>w.auth),b=(i==null?void 0:i.level)==="teacher"||(i==null?void 0:i.level)==="admin",[m,l]=o.useState({}),{data:g,isLoading:t,isError:N,error:p,refetch:j}=U({student:s.student_id,exam:d},{skip:!s.student_id}),[h,{isLoading:a}]=G(),x=g==null?void 0:g[0];o.useEffect(()=>{x&&f(!0)},[x]);const v=()=>{x&&ie(x,r,s)},y=async(w,_)=>{var R;const k=m[w];if(k===void 0||k===""){S.error("Nilai tidak boleh kosong");return}if(k<0||k>_){S.error(`Nilai harus antara 0 dan ${_}`);return}try{await h({answer_id:w,point:parseInt(k)}).unwrap(),S.success("Nilai berhasil disimpan"),j()}catch(E){S.error(((R=E.data)==null?void 0:R.message)||"Gagal menyimpan nilai")}};return e.jsx("div",{className:"modal fade",id:"answerSheet","data-bs-backdrop":"static","data-bs-keyboard":"false",tabIndex:"-1","aria-labelledby":"staticBackdropLabel","aria-hidden":"true",children:e.jsx("div",{className:"modal-dialog modal-lg modal-dialog-scrollable",children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"modal-header",children:[e.jsxs("div",{className:"modal-title d-flex flex-column justify-content-end align-items-start",id:"staticBackdropLabel",children:[e.jsx("p",{className:"m-0 h5",children:r==null?void 0:r.replace(/-/g," ")}),e.jsxs("small",{className:"text-muted",children:[s==null?void 0:s.nis," - ",s==null?void 0:s.student_name]})]}),e.jsx("button",{type:"button",className:"btn-close","data-bs-dismiss":"modal","aria-label":"Close"})]}),e.jsx("div",{className:"modal-body",children:t?e.jsx("p",{children:"Loading..."}):N?e.jsxs("div",{className:"alert alert-danger",role:"alert",children:["Gagal memuat data jawaban:"," ",(($=p==null?void 0:p.data)==null?void 0:$.message)||p.message]}):x?e.jsxs(e.Fragment,{children:[e.jsx(le,{studentData:x}),e.jsx(re,{studentData:x,name:r}),x.answers&&x.answers.length>0?x.answers.map((w,_)=>e.jsx(ce,{answer:w,index:_,isTeacherOrAdmin:b,gradingAnswers:m,setGradingAnswers:l,handleGradeEssay:y,isGrading:a},w.question_id)):e.jsx("div",{className:"alert alert-info mt-3",role:"alert",children:"Tidak ada data jawaban untuk siswa ini."})]}):e.jsx("div",{className:"alert alert-warning",role:"alert",children:"Data siswa tidak ditemukan."})}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{type:"button",className:"btn btn-sm btn-secondary","data-bs-dismiss":"modal",children:"Tutup"}),e.jsx("button",{type:"button",className:"btn btn-sm btn-danger",onClick:j,children:e.jsx("i",{className:"bi bi-repeat"})}),e.jsxs("button",{type:"button",className:"btn btn-sm btn-primary",onClick:v,children:[e.jsx("i",{className:"bi bi-printer"})," Cetak"]})]})]})})})},oe=o.forwardRef(({classid:s,examid:d},r)=>{const[n,f]=o.useState(1),[i,b]=o.useState(10),[m,l]=o.useState(""),g=o.useRef(),{data:t={},isLoading:N,refetch:p}=A({exam:d,classid:s,page:n,limit:i,search:m}),{result:j=[],totalData:h,totalPages:a}=t,[x,v]=o.useState({}),[y,{isLoading:$}]=F(),[w,{isLoading:_}]=H(),[k,{isLoading:R}]=q();o.useImperativeHandle(r,()=>({refetch:p,getTableElement:()=>g.current}));const E=c=>{S.promise(y({id:c,exam:d}).unwrap().then(u=>u.message),{loading:"Memuat data...",success:u=>u,error:u=>u.data.message})},z=c=>{S.promise(w({id:c}).unwrap().then(u=>u.message),{loading:"Memuat data...",success:u=>u,error:u=>u.data.message})},I=(c,u)=>{S.promise(k({id:c,student:u,exam:d}).unwrap().then(C=>C.message),{loading:"Memuat data...",success:C=>C,error:C=>C.data.message})};return e.jsxs(e.Fragment,{children:[e.jsx(P,{isLoading:N,page:n,setPage:f,totalPages:a,limit:i,setLimit:b,setSearch:l,totalData:h,children:e.jsxs("table",{ref:g,className:"table table-striped table-hover table-bordered",children:[e.jsx("thead",{className:"table-light",children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",className:"text-center",children:"No"}),e.jsx("th",{scope:"col",className:"text-center",children:"NIS"}),e.jsx("th",{scope:"col",className:"text-center",children:"Nama Siswa"}),e.jsx("th",{scope:"col",className:"text-center",children:"Kelas"}),e.jsx("th",{scope:"col",className:"text-center",children:"Tingkat"}),e.jsx("th",{scope:"col",className:"text-center",children:"IP Address"}),e.jsx("th",{scope:"col",className:"text-center",children:"Browser"}),e.jsx("th",{scope:"col",className:"text-center",children:"Waktu Mulai"}),e.jsx("th",{scope:"col",className:"text-center",children:"Status"}),e.jsx("th",{scope:"col",className:"text-center",children:"Aksi"})]})}),e.jsx("tbody",{children:j.length>0?j.map((c,u)=>e.jsxs("tr",{children:[e.jsx("td",{className:"text-center align-middle",children:(n-1)*i+u+1}),e.jsx("td",{className:"text-center align-middle",children:c.nis}),e.jsx("td",{className:"align-middle",children:c.student_name}),e.jsx("td",{className:"text-center align-middle",children:c.class_name}),e.jsx("td",{className:"text-center align-middle",children:c.grade_name}),e.jsx("td",{className:"text-center align-middle",children:c.ip||"-"}),e.jsx("td",{className:"text-center align-middle",children:c.browser||"-"}),e.jsx("td",{className:"text-center align-middle",children:c.createdat?e.jsx("span",{className:"badge bg-success",children:new Date(c.createdat).toLocaleString()}):"-"}),e.jsx("td",{className:"text-center align-middle",children:c.ispenalty?e.jsx("span",{className:"badge bg-danger",children:"Melanggar"}):c.isactive?e.jsx("span",{className:"badge bg-warning",children:"Mengerjakan"}):c.isdone?e.jsx("span",{className:"badge bg-success",children:"Selesai"}):e.jsx("span",{className:"badge bg-secondary",children:"Belum Masuk"})}),e.jsx("td",{className:"text-center align-middle",children:e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("button",{className:"btn btn-sm btn-primary",title:"Lihat Detail","data-bs-toggle":"modal","data-bs-target":"#answerSheet",onClick:()=>v(c),children:e.jsx("i",{className:"bi bi-eye"})}),e.jsx("button",{className:"btn btn-sm btn-warning",title:"Izinkan Masuk",onClick:()=>z(c.log_id),disabled:_||!c.isactive,children:e.jsx("i",{className:"bi bi-arrow-repeat"})}),e.jsx("button",{className:"btn btn-sm btn-success",title:"Selesaikan",onClick:()=>E(c.log_id),disabled:$||c.isdone||!c.isactive,children:e.jsx("i",{className:"bi bi-check-circle"})}),e.jsx("button",{className:"btn btn-sm btn-danger",title:"Ulangi Ujian",onClick:()=>I(c.log_id,c.student_id),disabled:R||!c.isdone,children:e.jsx("i",{className:"bi bi-recycle"})})]})})]},c.student_id||u)):e.jsx("tr",{children:e.jsx("td",{colSpan:"10",className:"text-center",children:N?"Memuat data...":"Tidak ada data yang ditemukan"})})})]})}),e.jsx(de,{detail:x})]})});O.register(Y,Z,D,X,V,ee,se,ae);const me=o.forwardRef(({examid:s},d)=>{const{data:r,isLoading:n,error:f,refetch:i}=Q(s,{skip:!s});o.useImperativeHandle(d,()=>({refetch:i}));const b={labels:(r==null?void 0:r.map(l=>l.score))||[],datasets:[{label:"Jumlah Siswa",data:(r==null?void 0:r.map(l=>l.quantity))||[],borderColor:"rgb(53, 162, 235)",backgroundColor:"rgba(53, 162, 235, 0.5)",tension:.4,fill:!0,pointStyle:"circle",pointRadius:6,pointHoverRadius:8,pointBackgroundColor:"rgb(53, 162, 235)",pointBorderColor:"white",pointBorderWidth:2}]},m={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",labels:{font:{size:14,weight:"bold"}}},title:{display:!0,text:"Distribusi Nilai Siswa",font:{size:20,weight:"bold"},padding:20},tooltip:{backgroundColor:"rgba(255, 255, 255, 0.9)",titleColor:"#333",bodyColor:"#666",titleFont:{size:14,weight:"bold"},bodyFont:{size:13},padding:12,borderColor:"rgba(53, 162, 235, 0.5)",borderWidth:1,displayColors:!1,callbacks:{title:l=>`Rentang Nilai: ${l[0].label}`,label:l=>`Jumlah Siswa: ${l.raw} orang`}}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(0, 0, 0, 0.1)",drawBorder:!1},ticks:{font:{size:12},stepSize:1},title:{display:!0,text:"Jumlah Siswa",font:{size:14,weight:"bold"},padding:10}},x:{grid:{display:!1},ticks:{font:{size:12}},title:{display:!0,text:"Rentang Nilai",font:{size:14,weight:"bold"},padding:10}}},interaction:{intersect:!1,mode:"index"},elements:{line:{borderWidth:3}}};return n?e.jsx("div",{className:"card shadow w-100 h-75 d-flex justify-content-center align-items-center",children:e.jsx("div",{className:"spinner-border text-primary",role:"status",children:e.jsx("span",{className:"visually-hidden",children:"Loading..."})})}):f?e.jsx("div",{className:"card shadow w-100 h-75 d-flex justify-content-center align-items-center text-danger",children:e.jsx("div",{children:"Error loading chart data"})}):e.jsx("div",{className:"card shadow w-100 h-75 p-3",children:e.jsx("div",{style:{width:"100%",height:"100%",minHeight:"550px"},children:e.jsx(te,{options:m,data:b})})})}),be=o.forwardRef(({examid:s,classid:d},r)=>{const[n,f]=o.useState(1),[i,b]=o.useState(10),[m,l]=o.useState(""),g=o.useRef(),{data:t={},isLoading:N,error:p,refetch:j}=W({exam:s,classid:d,page:n,limit:i,search:m},{skip:!s});o.useImperativeHandle(r,()=>({refetch:j,getTableElement:()=>g.current}));const h=(t==null?void 0:t.students)||[];return e.jsx(P,{isLoading:N,page:n,setPage:f,limit:i,setLimit:b,setSearch:l,totalData:t==null?void 0:t.totalData,totalPages:t==null?void 0:t.totalPages,children:e.jsxs("table",{ref:g,className:"mb-0 table table-bordered table-striped",children:[e.jsxs("thead",{children:[e.jsxs("tr",{children:[e.jsx("td",{colSpan:2,className:"text-muted align-middle",children:t==null?void 0:t.homebase_name}),e.jsx("td",{colSpan:2,className:"text-muted align-middle",children:e.jsxs("p",{className:"m-0",children:[t==null?void 0:t.exam_name," ",e.jsx("span",{className:"badge bg-success",children:t==null?void 0:t.exam_token})]})}),e.jsx("td",{colSpan:6,className:"text-muted align-middle",children:t==null?void 0:t.teacher_name})]}),e.jsxs("tr",{children:[e.jsx("th",{rowSpan:2,className:"text-center align-middle",children:"No"}),e.jsx("th",{rowSpan:2,className:"text-center align-middle",children:"NIS"}),e.jsx("th",{rowSpan:2,className:"text-center align-middle",children:"Nama"}),e.jsx("th",{rowSpan:2,className:"text-center align-middle",children:"Tingkat"}),e.jsx("th",{rowSpan:2,className:"text-center align-middle",children:"Kelas"}),e.jsx("th",{colSpan:3,className:"text-center align-middle",children:"PG"}),e.jsx("th",{rowSpan:2,className:"text-center align-middle",children:"Essay"}),e.jsx("th",{rowSpan:2,className:"text-center align-middle",children:"Total"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"text-center align-middle",children:"Benar"}),e.jsx("td",{className:"text-center align-middle",children:"Salah"}),e.jsx("td",{className:"text-center align-middle",children:"Total"})]})]}),e.jsx("tbody",{children:h==null?void 0:h.map((a,x)=>e.jsxs("tr",{children:[e.jsx("td",{className:"text-center align-middle",children:(n-1)*i+x+1}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.student_nis}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.student_name}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.student_grade}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.student_class}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.correct}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.incorrect}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.mc_score}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.essay_score}),e.jsx("td",{className:"text-center align-middle",children:a==null?void 0:a.score})]},a==null?void 0:a.student_id))})]})})}),ue=()=>{const{name:s,examid:d,token:r}=B(),[n,f]=o.useState(""),[i,b]=o.useState("table"),m=o.useRef(),l=o.useRef(),g=o.useRef(),t=()=>{var p,j,h;(p=m.current)==null||p.refetch(),(j=l.current)==null||j.refetch(),(h=g.current)==null||h.refetch()},N=()=>{if(i==="table"&&m.current){const p=L.book_new(),j=m.current.getTableElement(),h=L.table_to_sheet(j);L.book_append_sheet(p,h,"Sheet1");const a=T(p,{bookType:"xlsx",type:"array"}),x=new Blob([a],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),v=`table_${s}.xlsx`;if(navigator.msSaveBlob)navigator.msSaveBlob(x,v);else{const y=document.createElement("a");y.href=window.URL.createObjectURL(x),y.download=v,y.click()}}else if(i==="list"&&g.current){const p=L.book_new(),j=g.current.getTableElement(),h=L.table_to_sheet(j);L.book_append_sheet(p,h,"Sheet1");const a=T(p,{bookType:"xlsx",type:"array"}),x=new Blob([a],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),v=`list_${s}.xlsx`;if(navigator.msSaveBlob)navigator.msSaveBlob(x,v);else{const y=document.createElement("a");y.href=window.URL.createObjectURL(x),y.download=v,y.click()}}};return e.jsxs(K,{title:`Laporan Ujian ${s.replace(/-/g," ")}`,levels:["admin","teacher"],children:[e.jsx(ne,{classid:n,setClassid:f,examid:d,name:s,token:r,onRefetch:t,activeView:i,setActiveView:b,onExport:N}),e.jsxs("div",{className:"mt-3",children:[i==="table"&&e.jsx(oe,{ref:m,examid:d,classid:n}),i==="chart"&&e.jsx(me,{ref:l,examid:d,classid:n}),i==="list"&&e.jsx(be,{ref:g,examid:d,classid:n})]})]})};export{ue as default};
