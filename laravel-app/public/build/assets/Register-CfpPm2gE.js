import{m as x,j as e,L as g,$ as m}from"./app-DM5lWH7w.js";import{I as t,T as i,a as n}from"./TextInput-DORfEDLv.js";import{P as f}from"./PrimaryButton-C25L6qDR.js";import{G as h}from"./GuestLayout-_XeTgq3q.js";function b(){const{data:o,setData:r,post:d,processing:l,errors:a,reset:c}=x({name:"",email:"",password:"",password_confirmation:""}),u=s=>{s.preventDefault(),d(route("register"),{onFinish:()=>c("password","password_confirmation")})};return e.jsxs(h,{children:[e.jsx(g,{title:"Đăng ký"}),e.jsxs("div",{className:"mb-8 flex flex-col items-center justify-center",children:[e.jsx(m,{href:"/",children:e.jsx("img",{src:"/logo.png",alt:"Logo",className:"h-20 w-auto",onError:s=>{s.target.onerror=null,s.target.src="https://via.placeholder.com/150x80?text=Your+Logo"}})}),e.jsx("h1",{className:"mt-4 text-3xl font-bold text-gray-800",children:"Tạo tài khoản mới"}),e.jsx("p",{className:"mt-2 text-sm text-gray-600",children:"Đăng ký để bắt đầu sử dụng dịch vụ"})]}),e.jsxs("div",{className:"mb-6 flex flex-col space-y-3",children:[e.jsxs("button",{type:"button",className:"flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",children:[e.jsx("svg",{className:"h-5 w-5",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("path",{d:"M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"})}),e.jsx("span",{children:"Đăng ký với Google"})]}),e.jsxs("button",{type:"button",className:"flex w-full items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",children:[e.jsx("svg",{className:"h-5 w-5 text-[#1877F2]",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("path",{d:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"})}),e.jsx("span",{children:"Đăng ký với Facebook"})]})]}),e.jsxs("div",{className:"my-6 flex items-center",children:[e.jsx("div",{className:"flex-grow border-t border-gray-300"}),e.jsx("span",{className:"mx-4 flex-shrink text-sm text-gray-600",children:"hoặc"}),e.jsx("div",{className:"flex-grow border-t border-gray-300"})]}),e.jsxs("form",{onSubmit:u,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx(t,{htmlFor:"name",value:"Họ tên",className:"text-sm font-medium text-gray-700"}),e.jsx(i,{id:"name",name:"name",value:o.name,className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",autoComplete:"name",isFocused:!0,onChange:s=>r("name",s.target.value),required:!0,placeholder:"Nguyễn Văn A"}),e.jsx(n,{message:a.name,className:"mt-2"})]}),e.jsxs("div",{children:[e.jsx(t,{htmlFor:"email",value:"Email",className:"text-sm font-medium text-gray-700"}),e.jsx(i,{id:"email",type:"email",name:"email",value:o.email,className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",autoComplete:"username",onChange:s=>r("email",s.target.value),required:!0,placeholder:"email@example.com"}),e.jsx(n,{message:a.email,className:"mt-2"})]}),e.jsxs("div",{children:[e.jsx(t,{htmlFor:"password",value:"Mật khẩu",className:"text-sm font-medium text-gray-700"}),e.jsx(i,{id:"password",type:"password",name:"password",value:o.password,className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",autoComplete:"new-password",onChange:s=>r("password",s.target.value),required:!0,placeholder:"••••••••"}),e.jsx(n,{message:a.password,className:"mt-2"})]}),e.jsxs("div",{children:[e.jsx(t,{htmlFor:"password_confirmation",value:"Xác nhận mật khẩu",className:"text-sm font-medium text-gray-700"}),e.jsx(i,{id:"password_confirmation",type:"password",name:"password_confirmation",value:o.password_confirmation,className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",autoComplete:"new-password",onChange:s=>r("password_confirmation",s.target.value),required:!0,placeholder:"••••••••"}),e.jsx(n,{message:a.password_confirmation,className:"mt-2"})]}),e.jsx("div",{children:e.jsx(f,{className:"w-full justify-center rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",disabled:l,children:l?"Đang tạo tài khoản...":"Đăng ký ngay"})}),e.jsxs("div",{className:"mt-6 text-center text-sm text-gray-600",children:["Bạn đã có tài khoản?"," ",e.jsx(m,{href:route("login"),className:"font-semibold text-indigo-600 hover:text-indigo-500",children:"Đăng nhập"})]})]})]})}export{b as default};
