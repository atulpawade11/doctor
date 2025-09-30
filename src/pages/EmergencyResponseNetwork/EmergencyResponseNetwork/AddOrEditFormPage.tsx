import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Plus, Save, FileText, X } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { EmergencyResponseNetwork } from "./emergencyResponseNetworkType";

type LocationState = {
  ern: EmergencyResponseNetwork;
  isEditing: boolean;
};

export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const ernData = state?.ern || null;

  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
    fileName: "",
    createdAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (isEditing && ernData) {
      setFormData({
        title: ernData.title || "",
        file: null,
        fileName: ernData.fileName || "",
        createdAt: ernData.createdAt || new Date().toISOString(),
      });
    }
  }, [isEditing, ernData]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year}, ${time}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        showToast("Only PDF files are allowed.", "error");
        e.target.value = "";
        return;
      }
      setFormData((prev) => ({ ...prev, file: selectedFile, fileName: selectedFile.name }));
      if (errors.file) {
        setErrors((prev) => {
          const n = { ...prev };
          delete n.file;
          return n;
        });
      }
    }
  };

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
      if (droppedFile.type !== "application/pdf") {
        showToast("Only PDF files are allowed.", "error");
        return;
      }
      setFormData((prev) => ({ ...prev, file: droppedFile, fileName: droppedFile.name }));
      if (errors.file) {
        setErrors((prev) => {
          const n = { ...prev };
          delete n.file;
          return n;
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, file: null, fileName: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (isEditing && ernData) ernData.fileName = "";
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required.";
    if (!formData.file && !isEditing) newErrors.file = "PDF file is required.";
    if (isEditing && !formData.file && !ernData?.fileName) newErrors.file = "PDF file is required.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("createdAt", formData.createdAt);
      if (formData.file) formDataToSend.append("file", formData.file);
      if (isEditing && ernData) {
        formDataToSend.append("id", ernData.id.toString());
        if (!formData.file && ernData.fileName) formDataToSend.append("existingFileName", ernData.fileName);
      }

      console.log("Submit payload:", Object.fromEntries(formDataToSend.entries()));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast(isEditing ? "Emergency Response Network updated successfully!" : "Emergency Response Network added successfully!", "success");
      navigate("/all-emergency-response-network");
    } catch (error) {
      console.error(error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Emergency Response Network | Admin Dashboard" : "Add Emergency Response Network | Admin Dashboard"}
        description={isEditing ? "Edit details" : "Add new ERN"}
      />
      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Emergency Response Network" : "Add New Emergency Response Network"}
          btnLabel="Cancel"
          navigatePath="/all-emergency-response-network"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div ref={setErrorRef("title")}>
                <Label htmlFor="title">ERN Title <span className="text-error-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter title"
                  type="text"
                  error={!!errors.title}
                  hint={errors.title}
                />
              </div>

              <div ref={setErrorRef("file")}>
                <Label htmlFor="file">PDF File <span className="text-error-500">*</span></Label>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                {!formData.fileName ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragging ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-600" : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"}`}
                    onClick={handleSelectFileClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drag & drop your PDF here</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or click to browse files</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Supported format: .pdf only</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 h-[42px] flex items-center px-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate max-w-[180px]">{formData.fileName}</p>
                      </div>
                      <button type="button" onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.file && <p className="mt-1 text-sm text-error-500">{errors.file}</p>}
              </div>

              <div>
                <Label htmlFor="createdAt">Created At</Label>
                <Input id="createdAt" value={formatDateTime(formData.createdAt)} readOnly type="text" disabled />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <Button size="sm" variant="primary" disabled>
                  <Loader size="sm" /> Processing...
                </Button>
              ) : (
                <Button onClick={handleSubmit} size="sm" variant="primary" startIcon={isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}>
                  {isEditing ? "Update ERN" : "Add ERN"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      <CentralizedLoader isLoading={isLoading} message="Processing your request..." />
    </div>
  );
}
