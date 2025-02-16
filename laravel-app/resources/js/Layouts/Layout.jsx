import React from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import { usePage } from '@inertiajs/react';

const Layout = ({ children }) => {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col">
            <Header user={auth.user} />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
