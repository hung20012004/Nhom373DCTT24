import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function SetPassword({ userId, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: userId,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.set'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Đặt mật khẩu" />

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

                <h1 className="mt-4 text-3xl font-bold text-gray-800">Đặt mật khẩu</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Email của bạn đã được xác thực. Vui lòng đặt mật khẩu cho tài khoản.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="email"
                        type="email"
                        value={email}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        disabled
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Mật khẩu" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Xác nhận mật khẩu" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
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
                        {processing ? 'Đang xử lý...' : 'Đặt mật khẩu'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
