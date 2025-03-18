import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Alert,
    AlertDescription
} from '@/components/ui/alert';
import axios from 'axios';

const SupportForm = ({ orderId, onClose, onSuccess }) => {
    const [submittingRequest, setSubmittingRequest] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const { toast } = useToast();

    const supportForm = useForm({
        issue_type: '',
        description: '',
        contact_preference: 'email',
    });

    const handleSupportRequest = async () => {
        setSubmittingRequest(true);
        setGeneralError('');
        setFieldErrors({});

        try {
            // Create a CSRF token header
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Make a direct axios request instead of using Inertia
            const response = await axios.post(`/support-requests/${orderId}`, {
                issue_type: supportForm.data.issue_type,
                description: supportForm.data.description,
                contact_preference: supportForm.data.contact_preference,
            }, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            // Handle successful response
            setSubmittingRequest(false);
            supportForm.reset();

            toast({
                title: "Thành công",
                description: "Yêu cầu đã được gửi. Nhân viên hỗ trợ sẽ liên hệ với bạn trong thời gian sớm nhất.",
            });

            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (error) {
            setSubmittingRequest(false);

            // Handle validation errors
            if (error.response && error.response.status === 422) {
                // Get validation errors
                setFieldErrors(error.response.data.errors || {});

                // Show error message
                const errorMessage = Object.values(error.response.data.errors || {})
                    .flat()
                    .join(', ');

                toast({
                    title: "Lỗi",
                    description: errorMessage || "Vui lòng kiểm tra các trường dữ liệu",
                    variant: "destructive",
                });
            } else {
                // Handle general error
                const errorMessage = error.response?.data?.error ||
                                   error.response?.data?.message ||
                                   "Đã xảy ra lỗi khi gửi yêu cầu hỗ trợ";

                setGeneralError(errorMessage);

                toast({
                    title: "Lỗi",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Yêu cầu hỗ trợ</DialogTitle>
                    <DialogDescription>
                        Gửi yêu cầu hỗ trợ cho đơn hàng #{orderId}. Nhân viên hỗ trợ sẽ liên hệ với bạn trong thời gian sớm nhất.
                    </DialogDescription>
                </DialogHeader>

                {generalError && (
                    <Alert variant="destructive">
                        <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="issue_type">Vấn đề</Label>
                        <Select
                            value={supportForm.data.issue_type}
                            onValueChange={(value) => supportForm.setData('issue_type', value)}
                        >
                            <SelectTrigger id="issue_type" className={fieldErrors.issue_type ? "border-red-500" : ""}>
                                <SelectValue placeholder="Chọn loại vấn đề" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shipping">Vấn đề vận chuyển</SelectItem>
                                <SelectItem value="product">Vấn đề sản phẩm</SelectItem>
                                <SelectItem value="payment">Vấn đề thanh toán</SelectItem>
                                <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                        {fieldErrors.issue_type && (
                            <p className="text-sm text-red-500">{fieldErrors.issue_type}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả chi tiết</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả chi tiết vấn đề của bạn..."
                            value={supportForm.data.description}
                            onChange={(e) => supportForm.setData('description', e.target.value)}
                            className={`w-full ${fieldErrors.description ? "border-red-500" : ""}`}
                            rows={4}
                        />
                        {fieldErrors.description && (
                            <p className="text-sm text-red-500">{fieldErrors.description}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={submittingRequest}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleSupportRequest}
                        disabled={submittingRequest || !supportForm.data.issue_type || !supportForm.data.description}
                    >
                        {submittingRequest ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SupportForm;
