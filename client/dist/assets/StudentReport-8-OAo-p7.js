import{e as m,bf as p,j as s}from"./index-Bk0R0AbM.js";import{L as l}from"./Layout-DtCUdCMC.js";const v=()=>{const{userid:a,name:n,grade:h,classname:b}=m(),{data:e,isLoading:c}=p(a,{skip:!a});return c?s.jsx(l,{title:`Laporan Hafalan ${n.replace(/-/g," ")}`,levels:["tahfiz","student","parent"],children:s.jsx("div",{className:"d-flex justify-content-center",children:s.jsx("div",{className:"spinner-border text-primary",role:"status",children:s.jsx("span",{className:"visually-hidden",children:"Loading..."})})})}):s.jsx(l,{title:"Laporan Hafalan",levels:["tahfiz","student","parent"],children:s.jsxs("div",{className:"print-section container",children:[s.jsxs("div",{className:"my-4",children:[s.jsxs("h6",{className:"mb-3",children:[s.jsx("i",{className:"bi bi-person-circle me-2"}),"Informasi Siswa"]}),s.jsxs("div",{className:"ps-4",children:[s.jsxs("p",{className:"mb-1",children:["Nama: ",e==null?void 0:e.student_name]}),s.jsxs("p",{className:"mb-1",children:["NIS: ",e==null?void 0:e.student_nis]}),s.jsxs("p",{className:"mb-1",children:["Kelas: ",e==null?void 0:e.grade," - ",e==null?void 0:e.class]}),s.jsxs("p",{className:"mb-1",children:["Sekolah: ",e==null?void 0:e.homebase]})]})]}),s.jsx("div",{className:"row g-4",children:e==null?void 0:e.memorization.map((i,t)=>s.jsx("div",{className:"col-6",children:s.jsxs("div",{className:"card border-primary h-100",children:[s.jsx("div",{className:"card-header bg-primary text-white py-2",children:s.jsx("h6",{className:"mb-0",children:i.juz})}),s.jsxs("div",{className:"card-body",children:[s.jsx("div",{className:"mb-3",children:s.jsx("div",{className:"progress",style:{height:"20px"},children:s.jsxs("div",{className:"progress-bar bg-success",style:{width:`${i.progress}%`},children:[i.progress,"%"]})})}),s.jsxs("div",{className:"row mb-3",children:[s.jsx("div",{className:"col-6",children:s.jsxs("div",{className:"d-flex align-items-center",children:[s.jsx("i",{className:"bi bi-layout-text-window me-2"}),s.jsxs("div",{children:[s.jsx("div",{children:"Baris"}),s.jsx("strong",{children:i.lines})]})]})}),s.jsx("div",{className:"col-6",children:s.jsxs("div",{className:"d-flex align-items-center",children:[s.jsx("i",{className:"bi bi-bookmark me-2"}),s.jsxs("div",{children:[s.jsx("div",{children:"Ayat"}),s.jsx("strong",{children:i.verses})]})]})})]}),s.jsxs("div",{children:[s.jsx("h6",{className:"mb-2",children:"Detail Surah:"}),s.jsx("div",{className:"d-flex flex-wrap gap-2",children:i.surah.map((r,o)=>s.jsxs("p",{className:"m-0",children:[r.surah_name,s.jsxs("span",{className:"badge bg-info ms-2",children:[r.verse," ayat | ",r.line," baris"]})]},o))})]})]})]})},t))})]})})},x=`
  @media print {
    body * {
      visibility: hidden;
    }
    .print-section,
    .print-section * {
      visibility: visible;
    }
    .print-section {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px;
    }
    
    .card {
      border: 1px solid #0d6efd !important;
      break-inside: avoid;
    }
    .progress {
      border: 1px solid #dee2e6;
    }
    .progress-bar {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .bg-primary, .bg-info, .bg-success {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .badge {
      border: 1px solid #0dcaf0;
    }
    hr {
      border-top: 1px solid #000;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
    }
    .col-6 {
      width: 50%;
      padding: 0 15px;
    }
  }
`,d=document.createElement("style");d.innerHTML=x;document.head.appendChild(d);export{v as default};
