import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Xác nhận mật khẩu" />

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

                <h1 className="mt-4 text-3xl font-bold text-gray-800">Xác nhận mật khẩu</h1>
                <p className="mt-2 text-sm text-gray-600">Vui lòng xác nhận mật khẩu trước khi tiếp tục</p>
            </div>

            <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-gray-600">
                Đây là khu vực bảo mật của ứng dụng. Vui lòng xác nhận mật khẩu của bạn trước khi tiếp tục.
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="password" value="Mật khẩu" className="text-sm font-medium text-gray-700" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2" />
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
                        {processing ? 'Đang xác nhận...' : 'Xác nhận'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
