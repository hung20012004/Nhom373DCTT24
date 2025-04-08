import{r as o,j as e,L as f,$ as h}from"./app-DM5lWH7w.js";import{L as N}from"./Layout-DVh4xpEi.js";import{C as d,a as y,b as w,c as _}from"./card-DjyVTpSh.js";import{B as r}from"./button-D_azY7HU.js";import{B as x}from"./badge-D2PfSuDc.js";import{I as C}from"./input-C9qzQYtQ.js";import{S}from"./search-DZ4Pfh-R.js";import{S as g}from"./shopping-bag-D-8jhm6x.js";import"./index-o3Sz-yc3.js";import"./index-H22tECQ6.js";import"./utils-De8wPBUk.js";import"./index-v8iwHGUi.js";import"./dialog-_yQDYPAD.js";import"./index-ijvaBZ7a.js";import"./index-B4EdUvDt.js";import"./x-ToVJaZZw.js";import"./trash-2-Dy2jXSrq.js";import"./plus-DECCMGFS.js";import"./alert-cZJMHzEk.js";import"./checkbox-D22MXWb1.js";import"./check-Ct5f1nwX.js";import"./shopping-cart-CZJG6TeG.js";import"./user-DrHZ__g_.js";import"./mail-CpnXhq4x.js";const p=s=>s==null||isNaN(s)?"0 ₫":new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(s),W=({orders:s})=>{const[l,u]=o.useState(""),[n,b]=o.useState("all"),i=s.filter(a=>{const t=a.order_id.toString().includes(l)||a.shipping_address&&a.shipping_address.recipient_name.toLowerCase().includes(l.toLowerCase());return n==="all"?t:t&&a.order_status===n}),c=a=>{switch(a){case"new":return{label:"Mới",color:"bg-blue-500"};case"processing":return{label:"Đang xử lý",color:"bg-orange-500"};case"confirmed":return{label:"Đã xác nhận",color:"bg-teal-500"};case"preparing":return{label:"Đang chuẩn bị hàng",color:"bg-yellow-500"};case"packed":return{label:"Đã đóng hàng",color:"bg-indigo-500"};case"shipping":return{label:"Đang giao hàng",color:"bg-purple-500"};case"delivered":return{label:"Đã giao hàng",color:"bg-green-500"};case"cancelled":return{label:"Đã hủy",color:"bg-red-500"};case"completed":return{label:"Đã nhận hàng",color:"bg-green-500"};default:return{label:"Khác",color:"bg-gray-500"}}},m=a=>{switch(a){case"paid":return{label:"Đã thanh toán",color:"bg-green-500"};case"pending":return{label:"Chờ thanh toán",color:"bg-yellow-500"};case"awaiting_payment":return{label:"Chờ thanh toán",color:"bg-yellow-500"};default:return{label:"Chưa thanh toán",color:"bg-red-500"}}},j=a=>new Date(a).toLocaleDateString("vi-VN"),v=[{value:"all",label:"Tất cả"},{value:"new",label:"Mới"},{value:"processing",label:"Đang xử lý"},{value:"confirmed",label:"Đã xác nhận"},{value:"preparing",label:"Đang chuẩn bị hàng"},{value:"packed",label:"Đã đóng hàng"},{value:"shipping",label:"Đang giao"},{value:"delivered",label:"Đã giao"},{value:"completed",label:"Đã nhận hàng"},{value:"cancelled",label:"Đã hủy"}];return e.jsxs(N,{children:[e.jsx(f,{title:"Đơn hàng của tôi"}),e.jsx("div",{className:"max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8",children:e.jsxs(d,{children:[e.jsxs(y,{className:"flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0",children:[e.jsxs("div",{children:[e.jsx(w,{className:"text-2xl font-bold mb-1",children:"Đơn hàng của tôi"}),e.jsx("p",{className:"text-gray-600",children:"Quản lý và theo dõi đơn hàng của bạn"})]}),e.jsxs("div",{className:"relative w-full md:w-64",children:[e.jsx(S,{className:"absolute left-2 top-2.5 h-4 w-4 text-gray-500"}),e.jsx(C,{placeholder:"Tìm kiếm đơn hàng...",className:"pl-8",value:l,onChange:a=>u(a.target.value)})]})]}),e.jsxs(_,{children:[e.jsx("div",{className:"flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2",children:v.map(a=>e.jsx(r,{variant:n===a.value?"default":"outline",onClick:()=>b(a.value),className:n===a.value?"text-white":"",children:a.label},a.value))}),i.length>0?e.jsx("div",{className:"space-y-4",children:i.map(a=>e.jsxs(d,{className:"overflow-hidden",children:[e.jsxs("div",{className:"bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(g,{className:"h-5 w-5 text-gray-600"}),e.jsxs("h3",{className:"font-semibold",children:["Đơn hàng #",a.order_id]}),e.jsx(x,{className:c(a.order_status).color+" text-white",children:c(a.order_status).label})]}),e.jsxs("p",{className:"text-sm text-gray-600 mt-1",children:["Ngày đặt: ",j(a.order_date)]})]}),e.jsxs("div",{className:"mt-2 md:mt-0 text-right",children:[e.jsx("p",{className:"text-lg font-medium",children:p(a.total_amount)}),e.jsx(x,{className:m(a.payment_status).color+" text-white mt-1",children:m(a.payment_status).label})]})]}),e.jsxs("div",{className:"p-4",children:[e.jsxs("div",{className:"space-y-3",children:[a.details&&a.details.length>0?a.details.slice(0,2).map(t=>e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("img",{src:t.variant&&t.variant.image_url?t.variant.image_url:"/placeholder.png",alt:t.variant?t.variant.name:"Sản phẩm",className:"w-16 h-16 object-cover rounded"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:t.variant?t.variant.product.name:"Sản phẩm"}),e.jsxs("p",{className:"text-xs text-gray-500 mb-2",children:[t.variant.color.name," - ",t.variant.size.name]}),e.jsxs("p",{className:"text-sm text-gray-500",children:[p(t.unit_price)," x ",t.quantity]})]})]},t.order_detail_id)):e.jsx("p",{className:"text-gray-500 text-center py-2",children:"Chi tiết đơn hàng đang được tải..."}),a.details&&a.details.length>2&&e.jsxs("p",{className:"text-gray-500 text-sm",children:["+",a.details.length-2," sản phẩm khác"]})]}),e.jsxs("div",{className:"flex justify-between items-center mt-4 pt-3 border-t",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:a.payment_method==="cod"?"Thanh toán khi nhận hàng (COD)":"VNPAY"}),e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:a.shipping_address?a.shipping_address.recipient_name:"Đang tải thông tin..."})]}),e.jsx(r,{asChild:!0,variant:"outline",children:e.jsx(h,{href:`/order/${a.order_id}`,children:"Chi tiết"})})]})]})]},a.order_id))}):e.jsxs("div",{className:"text-center py-12",children:[e.jsx(g,{className:"h-12 w-12 text-gray-400 mx-auto mb-3"}),e.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"Không tìm thấy đơn hàng"}),e.jsx("p",{className:"mt-1 text-gray-500",children:l?"Không tìm thấy đơn hàng phù hợp với tìm kiếm của bạn.":"Bạn chưa có đơn hàng nào."}),!l&&e.jsx("div",{className:"mt-6",children:e.jsx(r,{asChild:!0,children:e.jsx(h,{href:"/products",children:"Mua sắm ngay"})})})]})]})]})})]})};export{W as default};
