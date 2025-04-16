import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CalendarIcon, X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function BieuMauDonDatHang({ purchaseOrder, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [nhaCungCap, setNhaCungCap] = useState([]);
    const [sanPham, setSanPham] = useState([]);
    const [formData, setFormData] = useState({
        supplier_id: '',
        order_date: '',
        expected_date: '',
        status: 'pending',
        note: '',
        details: [],
        isPending: true
    });
    const [errors, setErrors] = useState({});
    const [sanPhamDaChon, setSanPhamDaChon] = useState('');
    const [soLuong, setSoLuong] = useState('');
    const [donGia, setDonGia] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [tongTien, setTongTien] = useState(0);
    const [loiChung, setLoiChung] = useState('');

    useEffect(() => {
        // Chỉ chạy effect này khi purchaseOrder thay đổi và không phải null/undefined
        if (purchaseOrder) {
            setIsEdit(true);

            // Tạo một đối tượng dữ liệu đã được chuyển đổi
            const formattedData = {
                supplier_id: purchaseOrder.supplier_id.toString(),
                order_date: format(new Date(purchaseOrder.order_date), 'yyyy-MM-dd'),
                expected_date: format(new Date(purchaseOrder.expected_date), 'yyyy-MM-dd'),
                status: purchaseOrder.status || 'pending',
                note: purchaseOrder.note || '',
                details: purchaseOrder.details.map(detail => ({
                    product_id: detail.product_id,
                    product: detail.product,
                    quantity: detail.quantity,
                    unit_price: detail.unit_price,
                    subtotal: Number(detail.quantity) * Number(detail.unit_price)
                })),
                isPending: (purchaseOrder.status || 'pending') === 'pending'
            };

            // Cập nhật trạng thái trong một thao tác
            setFormData(formattedData);
        }

    }, [purchaseOrder]);

    // useEffect riêng biệt cho việc tải dữ liệu ban đầu - không phụ thuộc vào purchaseOrder
    useEffect(() => {
        layDanhSachNhaCungCap();
        layDanhSachSanPham();
    }, []);

    useEffect(() => {
        if (formData.status) {
            setFormData(prev => ({
                ...prev,
                isPending: prev.status === 'pending'
            }));
        }
    }, [formData.status]);

    useEffect(() => {
        // Tính tổng số tiền khi chi tiết thay đổi
        const total = formData.details.reduce((sum, item) => sum + Number(item.subtotal), 0);
        setTongTien(total);
    }, [formData.details]);

    const layDanhSachNhaCungCap = async () => {
        try {
            const response = await axios.get('/api/v1/suppliers');
            if (response.data && response.data.data) {
                setNhaCungCap(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
            setLoiChung('Không thể tải danh sách nhà cung cấp. Vui lòng thử lại.');
        }
    };

    const layDanhSachSanPham = async () => {
        try {
            const response = await axios.get('/api/v1/products');
            if (response.data && response.data.data) {
                setSanPham(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách sản phẩm:', error);
            setLoiChung('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'status' ? { isPending: value === 'pending' } : {})
          }));
        // Xóa lỗi liên quan
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDateChange = (field, e) => {
        const value = e.target.value;
        if (value) {
            setFormData(prev => ({ ...prev, [field]: value }));
            // Xóa lỗi liên quan
            if (errors[field]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        }
    };

    const themSanPhamVaoDonHang = () => {
        if (!sanPhamDaChon || !soLuong || !donGia) {
            setErrors({
                ...errors,
                product_details: 'Vui lòng chọn sản phẩm, số lượng và đơn giá'
            });
            return;
        }

        const product = sanPham.find(p => p.product_id.toString() === sanPhamDaChon);
        if (!product) return;

        const subtotal = Number(soLuong) * Number(donGia);

        // Kiểm tra xem sản phẩm đã tồn tại trong đơn hàng chưa
        const existingProductIndex = formData.details.findIndex(
            d => d.product_id.toString() === sanPhamDaChon
        );

        if (existingProductIndex >= 0) {
            // Cập nhật sản phẩm đã tồn tại
            const updatedDetails = [...formData.details];
            const existingItem = updatedDetails[existingProductIndex];

            updatedDetails[existingProductIndex] = {
                ...existingItem,
                quantity: Number(existingItem.quantity) + Number(soLuong),
                unit_price: Number(donGia),
                subtotal: Number(existingItem.subtotal) + subtotal
            };

            setFormData(prev => ({ ...prev, details: updatedDetails }));
        } else {
            // Thêm sản phẩm mới
            setFormData(prev => ({
                ...prev,
                details: [
                    ...prev.details,
                    {
                        product_id: sanPhamDaChon,
                        product: product,
                        quantity: Number(soLuong),
                        unit_price: Number(donGia),
                        subtotal: subtotal
                    }
                ]
            }));
        }

        // Đặt lại biểu mẫu
        setSanPhamDaChon('');
        setSoLuong('');
        setDonGia('');
        setErrors({...errors, product_details: ''});
    };

    const xoaSanPhamKhoiDonHang = (productId) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter(d => d.product_id.toString() !== productId.toString())
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setLoiChung('');

        if (!formData.supplier_id) {
            setErrors({...errors, supplier_id: 'Vui lòng chọn nhà cung cấp'});
            setLoading(false);
            return;
        }

        if (formData.details.length === 0) {
            setErrors({...errors, details: 'Vui lòng thêm ít nhất một sản phẩm vào đơn hàng'});
            setLoading(false);
            return;
        }

        try {
            // Chuẩn bị dữ liệu để gửi
            const dataToSend = {
                ...formData,
                details: formData.details.map(detail => ({
                    product_id: detail.product_id,
                    quantity: detail.quantity,
                    unit_price: detail.unit_price
                }))
            };

            delete dataToSend.isPending;

            let response;
            if (isEdit) {
                response = await axios.put(`/admin/purchase-orders/${purchaseOrder.po_id}`, dataToSend);
            } else {
                response = await axios.post('/admin/purchase-orders', dataToSend);
            }

            if (response.data.status === 'success') {
                toast.success(isEdit ? 'Cập nhật đơn đặt hàng thành công' : 'Tạo đơn đặt hàng mới thành công');
                onSuccess();
            }
        } catch (error) {
            console.error('Lỗi khi lưu đơn đặt hàng:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setLoiChung(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu đơn đặt hàng');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getMinExpectedDate = () => {
        // Ngày dự kiến không thể sớm hơn ngày đặt hàng
        return formData.order_date || format(new Date(), 'yyyy-MM-dd');
    };

    return(
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Chỉnh Sửa Đơn Đặt Hàng' : 'Tạo Đơn Đặt Hàng Mới'}
                    </DialogTitle>
                </DialogHeader>

                {loiChung && (
                    <Alert variant="destructive">
                        <AlertDescription>{loiChung}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Lựa chọn nhà cung cấp */}
                        <div className="space-y-2">
                            <Label>Nhà Cung Cấp</Label>
                            <Select
                                value = {formData.supplier_id}
                                onValueChange={(value) => handleSelectChange('supplier_id', value)}
                                disabled={loading || (isEdit && !formData.isPending)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhà cung cấp" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nhaCungCap.map((supplier) => (
                                        <SelectItem
                                            key={supplier.id}
                                            value={supplier.id.toString()}
                                        >
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.supplier_id && <span className="text-red-500 text-sm">{errors.supplier_id}</span>}
                        </div>

                        {/* Lựa chọn trạng thái */}
                        <div className="space-y-2">
                            <Label>Trạng Thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange('status', value)}
                                disabled={loading || isEdit}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                                    <SelectItem value="processing">Đang xử lí</SelectItem>
                                    <SelectItem value="completed">Đã nhận hàng</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <span className="text-red-500 text-sm">{errors.status}</span>}
                        </div>

                        {/* Ngày đặt hàng */}
                        <div className="space-y-2">
                            <Label htmlFor="order_date">Ngày Đặt Hàng</Label>
                            <div className="relative">
                                <div className="flex">
                                    <Input
                                        id="order_date"
                                        type="date"
                                        name="order_date"
                                        value={formData.order_date}
                                        onChange={(e) => handleDateChange('order_date', e)}
                                        className="w-full pr-10"
                                        disabled={loading || (isEdit && !formData.isPending)}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            {errors.order_date && <span className="text-red-500 text-sm">{errors.order_date}</span>}
                        </div>

                        {/* Ngày dự kiến */}
                        <div className="space-y-2">
                            <Label htmlFor="expected_date">Ngày Dự Kiến Nhận Hàng</Label>
                            <div className="relative">
                                <div className="flex">
                                    <Input
                                        id="expected_date"
                                        type="date"
                                        name="expected_date"
                                        value={formData.expected_date}
                                        onChange={(e) => handleDateChange('expected_date', e)}
                                        min={getMinExpectedDate()}
                                        className="w-full pr-10"
                                        disabled={loading || (isEdit && !formData.isPending)}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            {errors.expected_date && <span className="text-red-500 text-sm">{errors.expected_date}</span>}
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Ghi Chú</Label>
                        <Textarea
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            rows={3}
                            disabled={loading || (isEdit && !formData.isPending)}
                        />
                        {errors.note && <span className="text-red-500 text-sm">{errors.note}</span>}
                    </div>

                    {/* Khu vực lựa chọn sản phẩm */}
                    {(!isEdit || formData.status === 'pending') && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-medium">Thêm Sản Phẩm</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Sản Phẩm</Label>
                                    <Select
                                        value={sanPhamDaChon}
                                        onValueChange={setSanPhamDaChon}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn sản phẩm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sanPham.map((product) => (
                                                <SelectItem
                                                    key={product.product_id}
                                                    value={product.product_id.toString()}
                                                >
                                                    {product.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Số Lượng</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={soLuong}
                                        onChange={(e) => setSoLuong(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <Label>Đơn Giá</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={donGia}
                                        onChange={(e) => setDonGia(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        onClick={themSanPhamVaoDonHang}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Thêm
                                    </Button>
                                </div>
                            </div>
                            {errors.product_details && (
                                <span className="text-red-500 text-sm block mt-2">{errors.product_details}</span>
                            )}
                        </div>
                    )}

                    {/* Bảng sản phẩm */}
                    <div className="space-y-2">
                        <Label>Chi Tiết Đơn Hàng</Label>
                        {errors.details && <span className="text-red-500 text-sm block">{errors.details}</span>}

                        {formData.details.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sản Phẩm</TableHead>
                                        <TableHead className="text-right">Số Lượng</TableHead>
                                        <TableHead className="text-right">Đơn Giá</TableHead>
                                        <TableHead className="text-right">Thành Tiền</TableHead>
                                        {(!isEdit || formData.status === 'pending') && (
                                            <TableHead className="w-[50px]"></TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.details.map((detail) => (
                                        <TableRow key={detail.product_id}>
                                            <TableCell>{detail.product?.name || `Sản phẩm #${detail.product_id}`}</TableCell>
                                            <TableCell className="text-right">{detail.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(detail.unit_price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(detail.subtotal)}</TableCell>
                                            {(!isEdit || formData.status === 'pending') && (
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => xoaSanPhamKhoiDonHang(detail.product_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={(!isEdit || formData.status === 'pending') ? 3 : 2} className="font-medium text-right">Tổng cộng:</TableCell>
                                        <TableCell className="font-bold text-right">{formatCurrency(tongTien)}</TableCell>
                                        {(!isEdit || formData.status === 'pending') && <TableCell></TableCell>}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-4 border rounded-md bg-gray-50">
                                Chưa có sản phẩm nào được thêm vào đơn hàng
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <div className="flex justify-end gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || (isEdit && formData.status !== 'pending')}
                                className="min-w-[100px]"
                            >
                                {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
