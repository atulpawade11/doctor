import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Plus, Save, FileText, X, Image, Video } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import type { Wall, Employee } from "./wallType";

// ----------------- Types -----------------
type LocationState = {
  wall: Wall;
  isEditing: boolean;
};

// ----------------- Sample Employees -----------------
const sampleEmployees: Employee[] = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Sarah Johnson" },
  { id: 3, name: "Mike Williams" },
  { id: 4, name: "Lisa Brown" },
  { id: 5, name: "David Wilson" },
];

// ----------------- Quill Config -----------------
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "bullet",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
];

// ----------------- File Handling -----------------
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "video/mp4",
];
const ALLOWED_FILE_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "svg", "mp4"];

// ----------------- Main Component -----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const wallData = state?.wall || null;

  const employees = sampleEmployees;

  const [formData, setFormData] = useState({
    description: "",
    addedByEmployee: "",
    file: null as File | null,
    fileName: "",
    fileType: "" as Wall["fileType"] | "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && wallData) {
      setFormData({
        description: wallData.description || "",
        addedByEmployee: wallData.addedByEmployee || "",
        file: null,
        fileName: wallData.fileName || "",
        fileType: wallData.fileType || "",
      });
    }
  }, [isEditing, wallData]);

  // ----------------- Handlers -----------------
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  const handleFileSelect = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      ALLOWED_FILE_TYPES.includes(file.type) ||
      (extension && ALLOWED_FILE_EXTENSIONS.includes(extension));

    if (!isValidType) {
      showToast("Only PDF, PNG, JPG, JPEG, SVG, and MP4 files are allowed.", "error");
      return;
    }

    let fileType: Wall["fileType"] = "pdf";
    if (file.type.includes("image")) {
      if (extension === "png") fileType = "png";
      else if (extension === "jpg") fileType = "jpg";
      else if (extension === "jpeg") fileType = "jpeg";
      else if (extension === "svg") fileType = "svg";
    } else if (file.type.includes("video") || extension === "mp4") {
      fileType = "mp4";
    }

    setFormData((prev) => ({
      ...prev,
      file,
      fileName: file.name,
      fileType,
    }));

    if (errors.file) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr.file;
        return newErr;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, file: null, fileName: "", fileType: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (isEditing && wallData) {
      wallData.fileName = "";
      wallData.fileType = undefined;
    }
  };

  const getFileIcon = () => {
    switch (formData.fileType) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "svg":
        return <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "mp4":
        return <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getFileTypeLabel = () => {
    switch (formData.fileType) {
      case "pdf":
        return "PDF";
      case "png":
        return "PNG Image";
      case "jpg":
        return "JPG Image";
      case "jpeg":
        return "JPEG Image";
      case "svg":
        return "SVG Image";
      case "mp4":
        return "MP4 Video";
      default:
        return "File";
    }
  };

  // ----------------- Validation -----------------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description?.trim()) newErrors.description = "Wall description is required.";
    if (!formData.addedByEmployee) newErrors.addedByEmployee = "Please select an employee.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      errorRefs.current[firstErrorKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return Object.keys(newErrors).length === 0;
  };

  // ----------------- Submit -----------------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append("addedByEmployee", formData.addedByEmployee);

      if (formData.file) {
        formDataToSend.append("file", formData.file);
        formDataToSend.append("fileType", formData.fileType || "");
      }

      if (isEditing && wallData) {
        formDataToSend.append("id", wallData.id.toString());
        if (!formData.file && wallData.fileName) {
          formDataToSend.append("existingFileName", wallData.fileName);
          formDataToSend.append("existingFileType", wallData.fileType || "");
        }
      }

      console.log("Submit payload:", Object.fromEntries(formDataToSend.entries()));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast(isEditing ? "Wall updated successfully!" : "Wall added successfully!", "success");
      navigate("/all-walls");
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  // ----------------- UI -----------------
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Wall | Admin Dashboard" : "Add Wall | Admin Dashboard"}
        description={isEditing ? "Edit wall details" : "Add new wall to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Wall" : "Add New Wall"}
          btnLabel="Cancel"
          navigatePath="/all-walls"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6 scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Description */}
              <div ref={setErrorRef("description")}>
                <Label htmlFor="description">
                  Wall Description <span className="text-error-500">*</span>
                </Label>
                <div className="mt-2">
                  <ReactQuill
                    value={formData.description}
                    onChange={(val) => handleInputChange("description", val)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter wall description..."
                    className="min-h-[200px] [&_.ql-editor]:min-h-[150px]"
                  />
                </div>
                {errors.description && (
                  <p className="mt-2 text-sm text-red-500">{errors.description}</p>
                )}
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Employee */}
                <div ref={setErrorRef("addedByEmployee")} className="flex flex-col">
                  <Label htmlFor="addedByEmployee">
                    Added By Employee <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    id="addedByEmployee"
                    options={employees.map((emp) => ({ value: emp.name, label: emp.name }))}
                    placeholder="Select Employee"
                    selectedValue={formData.addedByEmployee}
                    onValueChange={(v) => handleInputChange("addedByEmployee", v)}
                    error={!!errors.addedByEmployee}
                    hint={errors.addedByEmployee}
                    className="mt-2"
                  />
                </div>

                {/* File Upload */}
                <div className="flex flex-col">
                  <Label htmlFor="file">Upload File (PDF, PNG, JPG, JPEG, SVG, MP4)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.svg,.mp4,application/pdf,image/png,image/jpeg,image/svg+xml,video/mp4"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!formData.fileName ? (
                    <div
                      className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                        ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-600"
                        : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                        }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Drag & drop your file here
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          or click to browse files
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Supported formats: PDF, PNG, JPG, JPEG, SVG, MP4
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 h-[42px] flex items-center px-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {getFileIcon()}
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate max-w-[180px]">
                              {formData.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {getFileTypeLabel()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>








              </div>


            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <Button size="sm" variant="primary" disabled>
                  <Loader size="sm" /> Processing...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  variant="primary"
                  startIcon={isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
                >
                  {isEditing ? "Update Wall" : "Add Wall"}
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
