import React from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm } from "@inertiajs/react";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    user,
    className = "",
    translations = {}, // Add translations prop with default empty object
}) {
    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            full_name: user.profile?.full_name || "",
            email: user.email,
            phone: user.profile?.phone || "",
            date_of_birth: user.profile?.date_of_birth
                ? user.profile.date_of_birth.split("T")[0]
                : "",
            gender: user.profile?.gender || "",
            avatar_url: null,
        });

    const submit = (e) => {
        e.preventDefault();

        post(route("profile.update"), {
            forceFormData: true,
        });
    };

    // Merge default translations with provided translations
    const t = {
        title: "Thông tin cá nhân",
        description: "Cập nhật thông tin tài khoản và địa chỉ email của bạn.",
        fullNameLabel: "Họ và tên",
        emailLabel: "Địa chỉ Email",
        phoneLabel: "Số điện thoại",
        dobLabel: "Ngày sinh",
        genderLabel: "Giới tính",
        avatarLabel: "Ảnh đại diện",
        saveButton: "Lưu thay đổi",
        savingButton: "Đang lưu...",
        successMessage: "Lưu thành công.",
        genderOptions: {
            default: "Chọn giới tính",
            male: "Nam",
            female: "Nữ",
            other: "Khác",
        },
        emailVerification: {
            unverified: "Địa chỉ email của bạn chưa được xác minh.",
            resendLink: "Nhấn vào đây để gửi lại email xác minh.",
            linkSent:
                "Một liên kết xác minh mới đã được gửi đến địa chỉ email của bạn.",
        },
        ...translations, // Allow overriding of default translations
    };

    return (
        <section
            className={`${className} bg-white rounded-2xl shadow-xl p-6 md:p-8`}
        >
            <header className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {t.title}
                </h2>

                <p className="mt-2 text-sm text-gray-600">{t.description}</p>
            </header>

            <form
                onSubmit={submit}
                className="space-y-6"
                encType="multipart/form-data"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel
                            htmlFor="full_name"
                            value={t.fullNameLabel}
                            className="mb-2 text-gray-700 font-medium"
                        />

                        <TextInput
                            id="full_name"
                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={data.full_name}
                            onChange={(e) =>
                                setData("full_name", e.target.value)
                            }
                            required
                            isFocused
                            autoComplete="name"
                        />

                        <InputError
                            className="mt-2 text-sm"
                            message={errors.full_name}
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="email"
                            value={t.emailLabel}
                            className="mb-2 text-gray-700 font-medium"
                        />

                        <TextInput
                            id="email"
                            type="email"
                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                            autoComplete="email"
                            readOnly
                        />

                        <InputError
                            className="mt-2 text-sm"
                            message={errors.email}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel
                            htmlFor="phone"
                            value={t.phoneLabel}
                            className="mb-2 text-gray-700 font-medium"
                        />

                        <TextInput
                            id="phone"
                            type="tel"
                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            onBlur={(e) => {
                                const value = e.target.value;
                                if (!/^0\d{9}$/.test(value)) {
                                    setData("phone", "");
                                }
                            }}
                            autoComplete="tel"
                        />
                        {data.phone && !/^0\d{9}$/.test(data.phone) && (
                            <InputError
                                className="mt-2 text-sm"
                                message="Số điện thoại phải có 10 số và bắt đầu bằng 0."
                            />
                        )}

                    </div>

                    <div>
                        <InputLabel
                            htmlFor="date_of_birth"
                            value={t.dobLabel}
                            className="mb-2 text-gray-700 font-medium"
                        />

                        <TextInput
                            id="date_of_birth"
                            type="date"
                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={data.date_of_birth}
                            onChange={(e) =>
                                setData("date_of_birth", e.target.value)
                            }
                        />

                        <InputError
                            className="mt-2 text-sm"
                            message={errors.date_of_birth}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel
                            htmlFor="gender"
                            value={t.genderLabel}
                            className="mb-2 text-gray-700 font-medium"
                        />

                        <select
                            id="gender"
                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={data.gender}
                            onChange={(e) => setData("gender", e.target.value)}
                        >
                            <option value="">{t.genderOptions.default}</option>
                            <option value="male">{t.genderOptions.male}</option>
                            <option value="female">
                                {t.genderOptions.female}
                            </option>
                            <option value="other">
                                {t.genderOptions.other}
                            </option>
                        </select>

                        <InputError
                            className="mt-2 text-sm"
                            message={errors.gender}
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="avatar_url"
                            value={t.avatarLabel}
                            className="mb-2 text-gray-700 font-medium"
                        />

                        <input
                            id="avatar_url"
                            type="file"
                            className="w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                            onChange={(e) =>
                                setData("avatar_url", e.target.files[0])
                            }
                            accept="image/*"
                        />

                        <InputError
                            className="mt-2 text-sm"
                            message={errors.avatar_url}
                        />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <p className="text-yellow-700">
                            {t.emailVerification.unverified}
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="ml-2 text-indigo-600 hover:text-indigo-900 font-semibold"
                            >
                                {t.emailVerification.resendLink}
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 text-sm text-green-600">
                                {t.emailVerification.linkSent}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-end space-x-4">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">
                            {t.successMessage}
                        </p>
                    </Transition>

                    <PrimaryButton
                        disabled={processing}
                        className="px-6 py-2 rounded-lg transition-colors duration-300"
                    >
                        {processing ? t.savingButton : t.saveButton}
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}
