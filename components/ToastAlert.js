import { useEffect } from 'react';

export default function ToastAlert({ message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in-up">
            <div className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg">
                {message}
            </div>
        </div>
    );
} 