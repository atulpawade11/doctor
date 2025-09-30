import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Plus, Save } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { Message, Employee } from "./messageTypes";

// Define the location state type
type LocationState = {
  message: Message;
  isEditing: boolean;
};

// Sample employees data
const sampleEmployees: Employee[] = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Sarah Johnson" },
  { id: 3, name: "Mike Williams" },
  { id: 4, name: "Lisa Brown" },
  { id: 5, name: "David Wilson" }
];

// Role options
const roleOptions = [
  { value: "Administrator", label: "Administrator" },
  { value: "User", label: "User" }
];

// Quill editor modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

// Quill editor formats
const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

// ---------------- Main Form Component ----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const messageData = state?.message || null;

  // Use the sample employees directly
  const employees = sampleEmployees;

  const [formData, setFormData] = useState({
    title: "",
    quote: "",
    role: "",
    addedByEmployee: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Set form data if editing
  useEffect(() => {
    if (isEditing && messageData) {
      setFormData({
        title: messageData.title || "",
        quote: messageData.quote || "",
        role: messageData.role || "",
        addedByEmployee: messageData.addedByEmployee || "",
      });
    }
  }, [isEditing, messageData]);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const handleQuoteChange = (value: string) => {
    handleInputChange("quote", value);
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = "Message title is required.";
    if (!formData.quote?.trim()) newErrors.quote = "Message quote is required.";
    if (!formData.role) newErrors.role = "Please select a role.";
    if (!formData.addedByEmployee) newErrors.addedByEmployee = "Please select an employee.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        id: isEditing && messageData ? messageData.id : null,
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Message updated successfully!" : "Message added successfully!",
        "success"
      );

      navigate("/all-messages");
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast(
        "An error occurred. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Set ref callback function
  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Message | Admin Dashboard" : "Add Message | Admin Dashboard"}
        description={isEditing ? "Edit message details" : "Add new message to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Message" : "Add New Message"}
          btnLabel="Cancel"
          navigatePath="/all-messages"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Two-column grid layout for better spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Message title field */}
              <div ref={setErrorRef("title")}>
                <Label htmlFor="title">Message Title <span className="text-error-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter message title"
                  type="text"
                  error={!!errors.title}
                  hint={errors.title}
                />
              </div>

              {/* Role select field */}
              <div ref={setErrorRef("role")}>
                <Label htmlFor="role">Role <span className="text-error-500">*</span></Label>
                <Select
                  id="role"
                  options={roleOptions}
                  placeholder="Select Role"
                  selectedValue={formData.role}
                  onValueChange={(v) => handleInputChange("role", v)}
                  error={!!errors.role}
                  hint={errors.role}
                />
              </div>

              {/* Employee select field */}
              <div ref={setErrorRef("addedByEmployee")}>
                <Label htmlFor="addedByEmployee">Added By Employee <span className="text-error-500">*</span></Label>
                <Select
                  id="addedByEmployee"
                  options={employees.map(emp => ({ value: emp.name, label: emp.name }))}
                  placeholder="Select Employee"
                  selectedValue={formData.addedByEmployee}
                  onValueChange={(v) => handleInputChange("addedByEmployee", v)}
                  error={!!errors.addedByEmployee}
                  hint={errors.addedByEmployee}
                />
              </div>
            </div>

            {/* Rich text editor field */}
            <div ref={setErrorRef("quote")}>
              <Label htmlFor="quote">Message Quote <span className="text-error-500">*</span></Label>
              <div className="mt-2">
                <ReactQuill
                  value={formData.quote}
                  onChange={handleQuoteChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter message quote with rich text formatting"
                  className="min-h-[200px] [&_.ql-editor]:min-h-[150px]"
                />
              </div>
              {errors.quote && (
                <p className="mt-2 text-sm text-red-500">{errors.quote}</p>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <Button
                  size="sm"
                  variant="primary"
                  disabled
                >
                  <Loader size="sm" />
                  Processing...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  variant="primary"
                  startIcon={isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
                >
                  {isEditing ? "Update Message" : "Add Message"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <CentralizedLoader
        isLoading={isLoading}
        message="Processing your request..."
      />
    </div>
  );
}