import{ac as e,j as a,e as s,ad as t,ae as n}from"./index-BAWIGdgW.js";import{b as i}from"./vendor-DfXzdC0j.js";import{L as l}from"./Layout-Doij1l_7.js";import{T as r}from"./Table-Cz3IM_IN.js";import"./index-Cjq_QsmG.js";import"./index-33-gAEu4.js";import"./index-C1AnEztE.js";const d=({detail:t,setDetail:n})=>{const[l,r]=i.useState(""),[d,c]=i.useState(""),[o,{isSuccess:m,isLoading:x,error:g,reset:u}]=e();return i.useEffect((()=>{t&&(r(t.id),c(t.name))}),[t]),i.useEffect((()=>{m&&(u(),r(""),c(""),n("")),g&&u()}),[m,g]),a.jsxs("form",{onSubmit:e=>{e.preventDefault();const a={id:l,name:d};s.promise(o(a).unwrap().then((e=>e.message)),{loading:"Menyimpan data...",success:e=>e,error:e=>e.data.message})},className:"bg-white rounded border p-2 d-flex flex-column gap-2",children:[a.jsx("p",{className:"m-0 h6",children:"Tingkat Satuan Pendidikan"}),a.jsx("input",{type:"text",name:"grade",id:"grade",className:"form-control",placeholder:"Tingkat",required:!0,value:d||"",onChange:e=>c(e.target.value)}),a.jsxs("div",{className:"d-flex justify-content-end gap-2",children:[a.jsx("button",{type:"button",className:"btn btn-sm btn-warning",onClick:()=>{r(""),c(""),n("")},children:"Batal"}),a.jsx("button",{type:"submit",className:"btn btn-sm btn-success",disabled:x,children:"Simpan"})]})]})},c=({setDetail:e})=>{const[l,d]=i.useState(1),[c,o]=i.useState(10),[m,x]=i.useState(""),{data:g={},isLoading:u}=t({page:l,limit:c,search:m}),{grades:h=[],totalData:j,totalPages:b}=g,[p,{isSuccess:N,isLoading:f,error:k,reset:v}]=n();return i.useEffect((()=>{N&&v(),k&&v()}),[N,k]),a.jsx(r,{page:l,setPage:d,setLimit:o,setSearch:x,totalData:j,totalPages:b,isLoading:u,children:a.jsxs("table",{className:"table table-bordered table-striped table-hover",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{className:"text-center",children:"No"}),a.jsx("th",{className:"text-center",children:"Satuan"}),a.jsx("th",{className:"text-center",children:"Tingkat"}),a.jsx("th",{className:"text-center",children:"Aksi"})]})}),a.jsx("tbody",{children:null==h?void 0:h.map(((t,n)=>a.jsxs("tr",{children:[a.jsx("td",{className:"text-center align-middle",children:(l-1)*c+n+1}),a.jsx("td",{className:"align-middle",children:t.homebase}),a.jsx("td",{className:"text-center align-middle",children:t.name}),a.jsx("td",{className:"text-center align-middle",children:a.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[a.jsx("button",{className:"btn btn-sm btn-warning",onClick:()=>e(t),children:a.jsx("i",{className:"bi bi-pencil-square"})}),a.jsx("button",{className:"btn btn-sm btn-danger",disabled:f,onClick:()=>{return e=t.id,void(window.confirm("Apakah anda yakin ingin menghapus data tingkat dan semua data yang terkait dengan tingkat ini?")&&s.promise(p(e).unwrap().then((e=>e.message)),{loading:"Memproses...",success:e=>e,error:e=>e.data.message}));var e},children:a.jsx("i",{className:"bi bi-folder-minus"})})]})})]},n)))})]})})},o=()=>{const[e,s]=i.useState("");return a.jsx(l,{title:"Tingkat Pendidikan",levels:["admin"],children:a.jsxs("div",{className:"row g-2",children:[a.jsx("div",{className:"col-lg-3 col-12",children:a.jsx(d,{detail:e,setDetail:s})}),a.jsx("div",{className:"col-lg-9 col-12",children:a.jsx(c,{setDetail:s})})]})})};export{o as default};
//# sourceMappingURL=AdminGrade-BH4mH-VF.js.map
