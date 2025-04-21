import{j as e,r as n}from"./index-B88h2kYZ.js";import{C as o,b as h,L as m,B as x,c as v,p as b,a as j,d as p}from"./index-BbGvQZUe.js";o.register(h,m,x,v,b,j);const d=({data:a,title:s,level:t})=>{const i={labels:(a==null?void 0:a.map(c=>c[`${t}_name`]))||[],datasets:[{label:"Jumlah Siswa",data:(a==null?void 0:a.map(c=>c.student_count))||[],backgroundColor:["rgba(54, 162, 235, 0.8)","rgba(255, 99, 132, 0.8)","rgba(75, 192, 192, 0.8)","rgba(255, 206, 86, 0.8)","rgba(153, 102, 255, 0.8)"],borderColor:["rgba(54, 162, 235, 1)","rgba(255, 99, 132, 1)","rgba(75, 192, 192, 1)","rgba(255, 206, 86, 1)","rgba(153, 102, 255, 1)"],borderWidth:1}]},r={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom"},title:{display:!0,text:s}}};return e.jsx("div",{style:{height:"300px",position:"relative"},children:e.jsx(p,{data:i,options:r})})},l=({data:a,level:s})=>{const t=(a==null?void 0:a.reduce((r,c)=>r+c.student_count,0))||0,i=r=>(r/t*100).toFixed(1);return e.jsx("div",{className:"table-responsive",children:e.jsxs("table",{className:"table table-striped table-hover table-bordered",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"text-center",children:s==="province"?"Provinsi":s==="city"?"Kota":s==="district"?"Kecamatan":"Desa"}),s!=="province"&&e.jsx("th",{children:"Provinsi"}),s==="district"&&e.jsx("th",{children:"Kota"}),s==="village"&&e.jsx("th",{children:"Kecamatan"}),e.jsx("th",{className:"text-center",children:"Jumlah"}),e.jsx("th",{className:"text-center",children:"Persentase"})]})}),e.jsx("tbody",{children:a==null?void 0:a.map((r,c)=>e.jsxs("tr",{children:[e.jsx("td",{className:"text-center",children:r[`${s}_name`]}),s!=="province"&&e.jsx("td",{className:"text-center",children:r.province_name}),s==="district"&&e.jsx("td",{className:"text-center",children:r.city_name}),s==="village"&&e.jsx("td",{className:"text-center",children:r.district_name}),e.jsx("td",{className:"text-center",children:r.student_count}),e.jsxs("td",{className:"text-center",children:[i(r.student_count),"%"]})]},c))})]})})},u=({data:a})=>{const[s,t]=n.useState("province"),i=(a==null?void 0:a.geographical_data)||{},r=[{id:"province",title:"Provinsi"},{id:"city",title:"Kota"},{id:"district",title:"Kecamatan"},{id:"village",title:"Desa"}];return e.jsxs("div",{children:[e.jsx("div",{className:"col-12",children:e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header d-flex justify-content-between align-items-center",children:e.jsx("h5",{className:"card-title mb-0",children:"Distribusi Geografis Siswa"})}),e.jsxs("div",{className:"card-body",children:[e.jsx("ul",{className:"nav nav-tabs mb-4",role:"tablist",children:r.map(c=>e.jsx("li",{className:"nav-item",role:"presentation",children:e.jsx("button",{className:`nav-link ${s===c.id?"active":""}`,onClick:()=>t(c.id),role:"tab",children:c.title})},c.id))}),e.jsxs("div",{className:"tab-content",children:[s==="province"&&e.jsxs("div",{className:"row g-4",children:[e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(d,{data:i.provinces,title:"Distribusi Siswa per Provinsi",level:"province"})})})}),e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(l,{data:i.provinces,level:"province"})})})})]}),s==="city"&&e.jsxs("div",{className:"row g-4",children:[e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(d,{data:i.cities,title:"Distribusi Siswa per Kota",level:"city"})})})}),e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(l,{data:i.cities,level:"city"})})})})]}),s==="district"&&e.jsxs("div",{className:"row g-4",children:[e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(d,{data:i.districts,title:"Distribusi Siswa per Kecamatan",level:"district"})})})}),e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(l,{data:i.districts,level:"district"})})})})]}),s==="village"&&e.jsxs("div",{className:"row g-4",children:[e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(d,{data:i.villages,title:"Distribusi Siswa per Desa",level:"village"})})})}),e.jsx("div",{className:"col-md-6",children:e.jsx("div",{className:"card h-100 border-0 shadow-sm",children:e.jsx("div",{className:"card-body",children:e.jsx(l,{data:i.villages,level:"village"})})})})]})]})]})]})}),e.jsx("style",{jsx:!0,children:`
        .nav-tabs {
          border-bottom: 1px solid #dee2e6;
        }
        .nav-tabs .nav-link {
          margin-bottom: -1px;
          border: 1px solid transparent;
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
          padding: 0.5rem 1rem;
          color: #6c757d;
          cursor: pointer;
          transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out;
        }
        .nav-tabs .nav-link:hover {
          border-color: #e9ecef #e9ecef #dee2e6;
          isolation: isolate;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          background-color: #fff;
          border-color: #dee2e6 #dee2e6 #fff;
        }
        .card {
          transition: box-shadow 0.3s ease-in-out;
        }
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .tab-content {
          padding-top: 1rem;
        }
      `})]})};export{u as G};
