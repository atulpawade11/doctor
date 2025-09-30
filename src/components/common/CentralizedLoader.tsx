import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CentralizedLoaderProps {
    isLoading: boolean;
    message?: string;
}

const CentralizedLoader: React.FC<CentralizedLoaderProps> = ({
    isLoading,
    message = "Loading..."
}) => {
    // Prevent body scroll when loader is active
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLoading]);

    if (!isLoading) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl transform transition-all max-w-xs mx-4">
                <div className="mb-4">
                    <img
                        src="/Loading.gif"
                        alt="Loading..."
                        className="w-20 h-20 object-contain"
                    />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
                    {message}
                </p>
            </div>
        </div>,
        document.body
    );
};

export default CentralizedLoader;