import { ReactNode } from "react";
import { PopModal } from "./modal/PopModal";
import Loader from "../common/Loader";

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "success" | "primary";
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false,
}) => {
    const getButtonClass = () => {
        switch (variant) {
            case "danger":
                return "bg-red-500 hover:bg-red-600 focus:ring-red-500";
            case "warning":
                return "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500";
            case "success":
                return "bg-green-500 hover:bg-green-600 focus:ring-green-500";
            case "primary":
            default:
                return "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500";
        }
    };

    return (
        <PopModal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full max-w-xs mx-4 p-4 sm:max-w-sm sm:mx-6 sm:p-6 md:max-w-md lg:max-w-lg xl:max-w-xl"
        >
            {/* Responsive container */}
            <div className="flex flex-col space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="pr-8 sm:pr-10">
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 sm:text-xl lg:text-2xl leading-tight">
                        {title}
                    </h5>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base leading-relaxed">
                        {message}
                    </div>
                </div>

                {/* Action buttons - Responsive layout */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-full order-2 sm:order-1 sm:w-auto flex justify-center items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:focus:ring-gray-700"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        type="button"
                        className={`w-full order-1 sm:order-2 sm:w-auto flex justify-center items-center rounded-lg px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader size="sm" />
                                <span className="ml-2">Processing...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </PopModal>
    );
};

export default ConfirmationModal;