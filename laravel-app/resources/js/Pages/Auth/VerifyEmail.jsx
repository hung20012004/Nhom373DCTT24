import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Xác thực email" />

            <div className="mb-8 flex flex-col items-center justify-center">
                <Link href="/">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-20 w-auto"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://via.placeholder.com/150x80?text=Your+Logo";
                        }}
                    />
                </Link>

                <h1 className="mt-4 text-3xl font-bold text-gray-800">Xác thực email</h1>
            </div>

            <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-gray-600">
                Cảm ơn bạn đã đăng ký! Trước khi bắt đầu, vui lòng xác thực địa chỉ email của bạn bằng cách nhấp vào liên kết mà chúng tôi vừa gửi cho bạn. Nếu bạn không nhận được email, chúng tôi sẽ sẵn lòng gửi cho bạn một email khác.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-md bg-green-50 p-4 text-sm font-medium text-green-700">
                    Một liên kết xác thực mới đã được gửi đến địa chỉ email mà bạn đã cung cấp trong quá trình đăng ký.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <PrimaryButton
                        disabled={processing}
                        className="justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        {processing ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-center text-sm font-medium text-gray-600 hover:text-gray-900 sm:text-right"
                    >
                        Đăng xuất
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
