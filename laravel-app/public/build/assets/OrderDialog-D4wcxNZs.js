import{r as N,j as e,a as W}from"./app-DM5lWH7w.js";import{D as X,a as Y,b as Z,c as J}from"./dialog-_yQDYPAD.js";import{B as ee}from"./button-D_azY7HU.js";import{T as te,a as se,b as G,c as x,d as ae,e as h}from"./table-BGT-YAZs.js";import{C as j,a as f,b,c as v}from"./card-DjyVTpSh.js";import{P as ne}from"./printer-Br_SKlEC.js";import{f as L}from"./format-D9VrrLpI.js";import{v as A}from"./vi-DmPgEhae.js";import"./index-v8iwHGUi.js";import"./utils-De8wPBUk.js";import"./index-ijvaBZ7a.js";import"./index-B4EdUvDt.js";import"./x-ToVJaZZw.js";import"./index-H22tECQ6.js";const fe=({orderId:i,isOpen:m,onClose:z})=>{var T,$,C,k,H,D;const[t,B]=N.useState(null),[E,w]=N.useState(!0),K={paid:"Đã thu tiền",confirmed:"Đã xác nhận",pending:"Chờ thanh toán",rejected:"Đã từ chối",cancelled:"Đã hủy"},F={paid:"bg-green-100 text-green-800",confirmed:"bg-blue-100 text-blue-800",pending:"bg-yellow-100 text-yellow-800",rejected:"bg-red-100 text-red-800",cancelled:"bg-red-100 text-red-800"},R={new:"Mới tạo",confirmed:"Đã xác nhận",processing:"Đang xử lý",cancelled:"Đã hủy",preparing:"Đang chuẩn bị",packed:"Đã đóng gói",shipping:"Đang giao hàng",delivered:"Đã giao hàng",shipping_failed:"Giao hàng thất bại"},U={new:"bg-blue-100 text-blue-800",confirmed:"bg-cyan-100 text-cyan-800",processing:"bg-green-100 text-green-800",cancelled:"bg-red-100 text-red-800",preparing:"bg-yellow-100 text-yellow-800",packed:"bg-purple-100 text-purple-800",shipping:"bg-indigo-100 text-indigo-800",delivered:"bg-emerald-100 text-emerald-800",shipping_failed:"bg-rose-100 text-rose-800"},q=async()=>{if(!(!i||!m))try{w(!0);const s=await W.get(`/api/v1/orders/${i}`);s.data&&s.data.data&&B(s.data.data)}catch(s){console.error("Lỗi khi tải đơn hàng:",s)}finally{w(!1)}};N.useEffect(()=>{m&&i&&q()},[i,m]);const a=s=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(s),_=s=>s?L(new Date(s),"dd/MM/yyyy HH:mm",{locale:A}):"",V=()=>{var r,d,l,c,o,p;const s=window.open("","_blank");document.getElementById("print-content").innerHTML;const g=L(new Date,"dd/MM/yyyy HH:mm",{locale:A});s.document.write(`
            <html>
                <head>
                    <title>Đơn hàng #${(t==null?void 0:t.order_id)||""}</title>
                    <style>
                        @page { size: A4; margin: 1cm }
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            line-height: 1.5;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #000;
                        }
                        .shop-info {
                            font-size: 12px;
                            margin-bottom: 10px;
                        }
                        .document-title {
                            font-size: 24px;
                            font-weight: bold;
                            margin: 10px 0;
                        }
                        .order-info {
                            margin-bottom: 20px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .order-info-section {
                            width: 48%;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 8px;
                            text-align: left;
                            font-size: 12px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        .total-section {
                            width: 300px;
                            margin-left: auto;
                            font-size: 12px;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 5px 0;
                        }
                        .total-final {
                            font-weight: bold;
                            border-top: 1px solid #000;
                            padding-top: 5px;
                        }
                        .signature-section {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 50px;
                            text-align: center;
                        }
                        .signature-box {
                            width: 200px;
                        }
                        .signature-title {
                            font-weight: bold;
                            margin-bottom: 60px;
                        }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="shop-info">
                            <div>TÊN CỬA HÀNG THỜI TRANG</div>
                            <div>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</div>
                            <div>Điện thoại: 0123.456.789 - Email: example@email.com</div>
                        </div>
                        <div class="document-title">PHIẾU MUA HÀNG</div>
                        <div>Số: #${(t==null?void 0:t.order_id)||""}</div>
                    </div>

                    <div class="order-info">
                        <div class="order-info-section">
                            <p><strong>Thông tin người nhận:</strong></p>
                            <p>Họ tên: ${(r=t.shipping_address)==null?void 0:r.recipient_name}</p>
                            <p>SĐT: ${(d=t.shipping_address)==null?void 0:d.phone}</p>
                            <p>Địa chỉ: ${(l=t.shipping_address)==null?void 0:l.street_address}, ${(c=t.shipping_address)==null?void 0:c.ward}, ${(o=t.shipping_address)==null?void 0:o.district}, ${(p=t.shipping_address)==null?void 0:p.province}</p>
                        </div>
                        <div class="order-info-section">
                            <p><strong>Thông tin đơn hàng:</strong></p>
                            <p>Ngày đặt: ${_(t.order_date)}</p>
                            <p>Ngày in: ${g}</p>
                            <p>Phương thức thanh toán: ${t.payment_method}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên sản phẩm</th>
                                <th>Thuộc tính</th>
                                <th class="text-right">SL</th>
                                <th class="text-right">Đơn giá</th>
                                <th class="text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${t.details.map((n,u)=>{var y,S,M,P;return`
                                <tr>
                                    <td class="text-center">${u+1}</td>
                                    <td>${(S=(y=n.variant)==null?void 0:y.product)==null?void 0:S.name}</td>
                                    <td>${(P=(M=n.variant)==null?void 0:M.attribute_values)==null?void 0:P.map(Q=>Q.value).join(", ")}</td>
                                    <td class="text-right">${n.quantity}</td>
                                    <td class="text-right">${a(n.unit_price)}</td>
                                    <td class="text-right">${a(n.subtotal)}</td>
                                </tr>
                            `}).join("")}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span>Tổng tiền hàng:</span>
                            <span>${a(t.subtotal)}</span>
                        </div>
                        ${t.discount_amount>0?`
                        <div class="total-row">
                            <span>Giảm giá:</span>
                            <span>-${a(t.discount_amount)}</span>
                        </div>
                        `:""}
                        <div class="total-row">
                            <span>Phí vận chuyển:</span>
                            <span>${a(t.shipping_fee)}</span>
                        </div>
                        <div class="total-row total-final">
                            <span>Tổng thanh toán:</span>
                            <span>${a(t.total_amount)}</span>
                        </div>
                    </div>

                    ${t.note?`
                    <div style="margin: 20px 0;">
                        <strong>Ghi chú:</strong>
                        <p>${t.note}</p>
                    </div>
                    `:""}

                    <div class="signature-section">
                        <div class="signature-box">
                            <p class="signature-title">Người lập phiếu</p>
                            <p>(Ký, họ tên)</p>
                        </div>
                        <div class="signature-box">
                            <p class="signature-title">Người nhận hàng</p>
                            <p>(Ký, họ tên)</p>
                        </div>
                    </div>
                </body>
            </html>
        `),s.document.close(),s.focus(),s.print()},I=()=>e.jsx("div",{className:"flex justify-center items-center h-64",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"})}),O=()=>e.jsxs("div",{className:"text-center p-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-800",children:"Không tìm thấy đơn hàng"}),e.jsx("p",{className:"mt-2 text-gray-600",children:"Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."})]});return e.jsx(X,{open:m,onOpenChange:z,children:e.jsxs(Y,{className:"sm:max-w-4xl max-h-[90vh] overflow-y-auto",children:[e.jsx(Z,{children:e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs(J,{className:"text-xl",children:["Chi tiết đơn hàng #",i]})})}),E?I():t?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"flex justify-end mb-4",children:e.jsxs(ee,{onClick:V,children:[e.jsx(ne,{className:"mr-2 h-4 w-4"}),"In đơn"]})}),e.jsxs("div",{id:"print-content",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 mb-6",children:[e.jsxs(j,{children:[e.jsx(f,{className:"py-3",children:e.jsx(b,{children:"Thông tin đơn hàng"})}),e.jsx(v,{className:"py-3",children:e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Mã đơn:"}),e.jsxs("span",{className:"font-medium",children:["#",t.order_id]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Ngày đặt:"}),e.jsx("span",{children:_(t.order_date)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Trạng thái đơn hàng:"}),e.jsx("span",{className:`px-2 py-1 text-xs font-semibold rounded-full ${U[t.order_status]}`,children:R[t.order_status]||t.order_status})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Phương thức thanh toán:"}),e.jsx("span",{children:t.payment_method})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Trạng thái thanh toán:"}),e.jsx("span",{className:`px-2 py-1 text-xs font-semibold rounded-full ${F[t.payment_status]}`,children:K[t.payment_status]||t.payment_status})]})]})})]}),e.jsxs(j,{children:[e.jsx(f,{className:"py-3",children:e.jsx(b,{children:"Thông tin khách hàng"})}),e.jsx(v,{className:"py-3",children:e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Người nhận:"}),e.jsx("span",{className:"font-medium",children:(T=t.shipping_address)==null?void 0:T.recipient_name})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Điện thoại:"}),e.jsx("span",{children:($=t.shipping_address)==null?void 0:$.phone})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Địa chỉ:"}),e.jsxs("span",{className:"text-right",children:[(C=t.shipping_address)==null?void 0:C.street_address,","," ",(k=t.shipping_address)==null?void 0:k.ward,","," ",(H=t.shipping_address)==null?void 0:H.district,","," ",(D=t.shipping_address)==null?void 0:D.province]})]})]})})]})]}),e.jsxs(j,{className:"mb-6",children:[e.jsx(f,{className:"py-3",children:e.jsx(b,{children:"Chi tiết đơn hàng"})}),e.jsxs(v,{className:"py-3",children:[e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(te,{children:[e.jsx(se,{children:e.jsxs(G,{className:"bg-gray-50",children:[e.jsx(x,{className:"py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"#"}),e.jsx(x,{className:"py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Sản phẩm"}),e.jsx(x,{className:"py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Số lượng"}),e.jsx(x,{className:"py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Đơn giá"}),e.jsx(x,{className:"py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Thành tiền"})]})}),e.jsx(ae,{children:t.details&&t.details.map((s,g)=>{var r,d,l,c,o,p,n,u;return e.jsxs(G,{className:"hover:bg-gray-50",children:[e.jsx(h,{className:"py-2 px-4 text-sm text-gray-900",children:g+1}),e.jsx(h,{className:"py-2 px-4 text-sm text-gray-900",children:e.jsxs("div",{className:"flex items-center",children:[((r=s.variant)==null?void 0:r.image_url)&&e.jsx("img",{src:s.variant.image_url,alt:(l=(d=s.variant)==null?void 0:d.product)==null?void 0:l.name,className:"w-10 h-10 mr-3 object-cover rounded"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:(o=(c=s.variant)==null?void 0:c.product)==null?void 0:o.name}),e.jsx("div",{className:"text-xs text-gray-500",children:(n=(p=s.variant)==null?void 0:p.attribute_values)==null?void 0:n.map(y=>y.value).join(", ")}),e.jsxs("div",{className:"text-xs text-gray-500",children:["SKU:"," ",(u=s.variant)==null?void 0:u.sku]})]})]})}),e.jsx(h,{className:"py-2 px-4 text-sm text-gray-900 text-right",children:s.quantity}),e.jsx(h,{className:"py-2 px-4 text-sm text-gray-900 text-right",children:a(s.unit_price)}),e.jsx(h,{className:"py-2 px-4 text-sm text-gray-900 font-medium text-right",children:a(s.subtotal)})]},g)})})]})}),e.jsx("div",{className:"mt-6 flex flex-col items-end",children:e.jsxs("div",{className:"w-full max-w-md space-y-2",children:[e.jsxs("div",{className:"flex justify-between py-2",children:[e.jsx("span",{className:"text-gray-600",children:"Tổng tiền hàng:"}),e.jsx("span",{className:"font-medium",children:a(t.subtotal)})]}),t.discount_amount>0&&e.jsxs("div",{className:"flex justify-between py-2",children:[e.jsx("span",{className:"text-gray-600",children:"Giảm giá:"}),e.jsxs("span",{className:"font-medium text-red-600",children:["-",a(t.discount_amount)]})]}),e.jsxs("div",{className:"flex justify-between py-2",children:[e.jsx("span",{className:"text-gray-600",children:"Phí vận chuyển:"}),e.jsx("span",{className:"font-medium",children:a(t.shipping_fee)})]}),e.jsxs("div",{className:"flex justify-between py-2 border-t border-gray-200",children:[e.jsx("span",{className:"text-gray-800 font-medium",children:"Tổng thanh toán:"}),e.jsx("span",{className:"font-bold text-lg",children:a(t.total_amount)})]})]})})]})]}),t.note&&e.jsxs(j,{className:"mb-6",children:[e.jsx(f,{className:"py-3",children:e.jsx(b,{children:"Ghi chú"})}),e.jsx(v,{className:"py-3",children:e.jsx("p",{className:"text-gray-700",children:t.note})})]})]})]}):O()]})})};export{fe as default};
