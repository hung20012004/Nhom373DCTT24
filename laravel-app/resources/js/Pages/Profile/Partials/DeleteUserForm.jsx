import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
    translations = {}
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    // Merge default translations with provided translations
    const t = {
        title: 'Xóa tài khoản',
        description: 'Sau khi xóa tài khoản, tất cả tài nguyên và dữ liệu của bạn sẽ bị xóa vĩnh viễn. Vui lòng tải xuống bất kỳ dữ liệu nào bạn muốn giữ lại trước khi xóa.',
        deleteButton: 'Xóa tài khoản',
        modalTitle: 'Bạn có chắc chắn muốn xóa tài khoản?',
        modalDescription: 'Sau khi xóa tài khoản, tất cả tài nguyên và dữ liệu của bạn sẽ bị xóa vĩnh viễn. Vui lòng nhập mật khẩu để xác nhận bạn muốn xóa tài khoản vĩnh viễn.',
        passwordPlaceholder: 'Mật khẩu',
        cancelButton: 'Hủy',
        confirmDeleteButton: 'Xóa tài khoản',
        ...translations
    };

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className} bg-white rounded-2xl shadow-xl p-6 md:p-8`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    {t.title}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    {t.description}
                </p>
            </header>

            <DangerButton
                onClick={confirmUserDeletion}
                className="transition-all duration-300 hover:bg-red-600"
            >
                {t.deleteButton}
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {t.modalTitle}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        {t.modalDescription}
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value={t.passwordPlaceholder}
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-3/4 rounded-lg border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                            isFocused
                            placeholder={t.passwordPlaceholder}
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                        <SecondaryButton
                            onClick={closeModal}
                            className="transition-all duration-300"
                        >
                            {t.cancelButton}
                        </SecondaryButton>

                        <DangerButton
                            className="transition-all duration-300 hover:bg-red-700"
                            disabled={processing}
                        >
                            {t.confirmDeleteButton}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
