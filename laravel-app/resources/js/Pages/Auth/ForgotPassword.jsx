import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Quên mật khẩu" />

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

                <h1 className="mt-4 text-3xl font-bold text-gray-800">Quên mật khẩu?</h1>
                <p className="mt-2 text-sm text-gray-600">Chúng tôi sẽ gửi link đặt lại mật khẩu qua email</p>
            </div>

            <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-gray-600">
                Quên mật khẩu? Không vấn đề gì. Chỉ cần cho chúng tôi biết địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết đặt lại mật khẩu qua email để bạn có thể chọn một mật khẩu mới.
            </div>

            {status && (
                <div className="mb-6 rounded-md bg-green-50 p-4 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        isFocused={true}
                        placeholder="your@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Quay lại đăng nhập
                    </Link>

                    <PrimaryButton
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        disabled={processing}
                    >
                        {processing ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
