import{r as s,j as e,L as H,a as I}from"./app-DM5lWH7w.js";import{A as k,B as A}from"./Breadcrumb-DriWI8JK.js";import{I as K}from"./input-C9qzQYtQ.js";import{T as L,a as E,b as l,c as m,d as B,e as a}from"./table-BGT-YAZs.js";import O from"./CustomerDetailsDialog-Blugriy6.js";import{A as F}from"./arrow-up-down-BlfunGSh.js";import"./shopping-cart-CZJG6TeG.js";import"./index-H22tECQ6.js";import"./utils-De8wPBUk.js";import"./star-NL1IKTr_.js";import"./truck-PZjfZowP.js";import"./shopping-bag-D-8jhm6x.js";import"./users-Bg5QJiIM.js";import"./search-DZ4Pfh-R.js";import"./user-DrHZ__g_.js";import"./dialog-_yQDYPAD.js";import"./index-v8iwHGUi.js";import"./index-ijvaBZ7a.js";import"./index-B4EdUvDt.js";import"./x-ToVJaZZw.js";import"./button-D_azY7HU.js";import"./index-BeqeRdpr.js";import"./badge-D2PfSuDc.js";import"./mail-CpnXhq4x.js";import"./calendar-D95ocz5F.js";import"./map-pin-CxyWG5si.js";function me(){const[i,x]=s.useState([]),[f,p]=s.useState(!0),[n,j]=s.useState(""),[y,h]=s.useState(null),[b,g]=s.useState(!1),[o,N]=s.useState({current_page:1,per_page:10,total:0,last_page:1}),[c,_]=s.useState("full_name"),[d,u]=s.useState("asc"),w=async()=>{try{p(!0);const t=await I.get("customers/index",{params:{search:n,page:o.current_page,per_page:o.per_page,sort_field:c,sort_direction:d}});t.data&&t.data.data&&(x(t.data.data),N({current_page:t.data.current_page,per_page:t.data.per_page,total:t.data.total,last_page:t.data.last_page}))}catch{x([])}finally{p(!1)}};s.useEffect(()=>{const t=setTimeout(()=>{w()},300);return()=>clearTimeout(t)},[n,o.current_page,c,d]);const S=t=>{c===t?u(d==="asc"?"desc":"asc"):(_(t),u("asc"))},v=t=>{h(t),g(!0)},T=()=>{g(!1),h(null)},C=[{label:"Khách Hàng",href:"/admin/customers"}],r=({field:t,children:D})=>e.jsx(m,{className:"py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer",onClick:()=>S(t),children:e.jsxs("div",{className:"flex items-center space-x-1",children:[e.jsx("span",{children:D}),e.jsx(F,{className:"w-4 h-4"})]})});return e.jsxs(k,{children:[e.jsx(H,{title:"Quản Lý Khách Hàng"}),e.jsxs("div",{className:"container mx-auto py-6 px-4",children:[e.jsx(A,{items:C}),e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:"Khách Hàng"}),e.jsx(K,{type:"text",placeholder:"Tìm kiếm khách hàng...",value:n,onChange:t=>j(t.target.value),className:"w-full sm:w-64"})]}),e.jsx("div",{className:"bg-white rounded-lg shadow overflow-hidden",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(L,{children:[e.jsx(E,{children:e.jsxs(l,{className:"bg-gray-50",children:[e.jsx(r,{field:"id",children:"ID"}),e.jsx(r,{field:"full_name",children:"Họ Tên"}),e.jsx(r,{field:"email",children:"Email"}),e.jsx(r,{field:"phone",children:"Điện Thoại"}),e.jsx(m,{children:"Trạng Thái"}),e.jsx(m,{children:"Hành Động"})]})}),e.jsx(B,{children:f?e.jsx(l,{children:e.jsx(a,{colSpan:6,className:"text-center py-4",children:e.jsx("div",{className:"flex justify-center",children:e.jsx("div",{className:"animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"})})})}):!i||i.length===0?e.jsx(l,{children:e.jsx(a,{colSpan:6,className:"text-center py-4 text-gray-500",children:"Không tìm thấy khách hàng"})}):i.map(t=>e.jsxs(l,{className:"hover:bg-gray-50 transition-colors",children:[e.jsx(a,{className:"py-4 px-6 text-sm text-gray-900",children:t.user_id}),e.jsx(a,{className:"py-4 px-6 text-sm text-gray-900",children:t.full_name}),e.jsx(a,{className:"py-4 px-6 text-sm text-gray-900",children:t.email}),e.jsx(a,{className:"py-4 px-6 text-sm text-gray-900",children:t.phone||"N/A"}),e.jsx(a,{className:"py-4 px-6 text-sm",children:e.jsx("span",{className:`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.is_active?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`,children:t.is_active?"Hoạt động":"Không hoạt động"})}),e.jsx(a,{className:"py-4 px-6 text-sm text-gray-900",children:e.jsx("button",{onClick:()=>v(t.user_id),className:"text-blue-600 hover:text-blue-800 font-medium",children:"Xem Chi Tiết"})})]},t.user_id))})]})})}),e.jsx(O,{customerId:y,isOpen:b,onClose:T})]})]})}export{me as default};
