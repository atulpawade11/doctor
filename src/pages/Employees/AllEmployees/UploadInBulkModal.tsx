import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PopModal } from "../../../components/ui/modal/PopModal";
import Button from "../../../components/ui/button/Button";
import Loader from "../../../components/common/Loader";
import { useToast } from "../../../components/common/ToastProvider";
import { X, FileText, Download, Upload, FileUp } from "lucide-react";
import { apiService } from "../../../services/apiService";
import CentralizedLoader from "../../../components/common/CentralizedLoader";

interface UploadInBulkModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UploadInBulkModal: React.FC<UploadInBulkModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
                showToast("Only CSV files are allowed.", "error");
                e.target.value = "";
                return;
            }
            setFile(selectedFile);
        }
    };

    // Handle drag and drop events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            if (!droppedFile.name.toLowerCase().endsWith(".csv")) {
                showToast("Only CSV files are allowed.", "error");
                return;
            }
            setFile(droppedFile);
        }
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Trigger file input click
    const handleSelectFileClick = () => {
        fileInputRef.current?.click();
    };

    // Upload to API
    const handleUpload = async () => {
        if (!file) {
            showToast("Please select a CSV file to upload.", "warning");
            return;
        }

        setIsUploading(true);

        showToast("File uploaded successfully!", "success");
        setFile(null);
        onClose();
        navigate("/all-employees");
        setIsUploading(false);
        // return;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const { data, error } = await apiService.post<{ message: string }>(
                "/employees/bulk-upload",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (error) {
                console.error("Upload failed:", error);
                showToast(
                    typeof error === "string" ? error : (error as any)?.message || "Failed to upload file.",
                    "error"
                );
            } else {
                showToast(data?.message || "File uploaded successfully!", "success");
                setFile(null);
                onClose();
                navigate("/all-employees");
            }
        } catch (err: any) {
            console.error("Unexpected error:", err);
            showToast(err?.message || "An unexpected error occurred while uploading.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <PopModal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full max-w-xs mx-4 p-4 sm:max-w-sm sm:mx-6 sm:p-6 md:max-w-md lg:max-w-lg xl:max-w-xl"
        >
            <div className="flex flex-col space-y-5 sm:space-y-6">
                {/* Header */}
                <div className="pr-8 sm:pr-10">
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 sm:text-xl lg:text-2xl leading-tight">
                        Bulk Upload Employees
                    </h5>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base leading-relaxed">
                        Upload employee data using a CSV file. Please follow the sample format.
                    </p>
                </div>

                {/* Download Sample CSV */}
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <a
                        href="/uploadBulkSample.csv"
                        download
                        onClick={() => showToast("Sample CSV downloaded!", "info")}
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                        <Download className="w-4 h-4" />
                        Download Sample CSV
                    </a>
                </div>

                {/* File input - Enhanced UI */}
                <div className="space-y-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {!file ? (
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                                ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-600"
                                : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                                }`}
                            onClick={handleSelectFileClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <Upload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Drag & drop your CSV file here
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        or click to browse files
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Supported format: .csv only
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <FileUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveFile}
                                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                    disabled={isUploading}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader size="sm" />
                                <span className="ml-2">Uploading...</span>
                            </>
                        ) : (
                            "Upload"
                        )}
                    </Button>
                </div>
            </div>
            <CentralizedLoader
                isLoading={isUploading}
                message="Processing your request..."
            />
        </PopModal>
    );
};

export default UploadInBulkModal;