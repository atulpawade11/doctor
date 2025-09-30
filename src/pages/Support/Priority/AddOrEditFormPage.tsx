import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextAreaa from "../../../components/form/input/TextAreaa";
import Button from "../../../components/ui/button/Button";
import { Plus, Save } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { Priority } from "./priorityType";

// Define the location state type
type LocationState = {
  priority: Priority;
  isEditing: boolean;
};

export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const priorityData = state?.priority || null;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    limitHour: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (isEditing && priorityData) {
      setFormData({
        name: priorityData.name || "",
        description: priorityData.description || "",
        limitHour: priorityData.limitHour?.toString() || "",
      });
    }
  }, [isEditing, priorityData]);

  // Handle input with validation for numbers
  const handleInputChange = (field: string, value: string) => {
    if (field === "limitHour") {
      if (/^\d*$/.test(value)) {
        // ✅ valid numbers (or empty string for delete)
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
          const n = { ...prev };
          delete n[field]; // clear error if previously shown
          return n;
        });
      } else {
        // ❌ invalid characters
        setErrors((prev) => ({ ...prev, [field]: "Only numbers are allowed." }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => {
          const n = { ...prev };
          delete n[field];
          return n;
        });
      }
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Priority name is required.";
    if (!formData.description?.trim()) newErrors.description = "Priority description is required.";
    if (!formData.limitHour?.trim()) {
      newErrors.limitHour = "Limit hour is required.";
    } else if (isNaN(Number(formData.limitHour))) {
      newErrors.limitHour = "Limit hour must be a number.";
    }

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
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload: Priority = {
        id: isEditing && priorityData ? priorityData.id : Date.now(),
        name: formData.name,
        description: formData.description,
        limitHour: Number(formData.limitHour),
      };

      console.log("Submit payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Priority updated successfully!" : "Priority added successfully!",
        "success"
      );

      navigate("/all-priorities");
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Priority | Admin Dashboard" : "Add Priority | Admin Dashboard"}
        description={isEditing ? "Edit priority details" : "Add new priority to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Priority" : "Add New Priority"}
          btnLabel="Cancel"
          navigatePath="/all-priorities"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div ref={setErrorRef("name")}>
                <Label htmlFor="name">Priority Name <span className="text-error-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter priority name"
                  type="text"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>

              {/* Limit Hour */}
              <div ref={setErrorRef("limitHour")}>
                <Label htmlFor="limitHour">Limit Hour <span className="text-error-500">*</span></Label>
                <Input
                  id="limitHour"
                  value={formData.limitHour}
                  onChange={(e) => handleInputChange("limitHour", e.target.value)}
                  placeholder="Enter limit hour"
                  type="text"
                  error={!!errors.limitHour}
                  hint={errors.limitHour}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2" ref={setErrorRef("description")}>
                <Label htmlFor="description">Priority Description <span className="text-error-500">*</span></Label>
                <TextAreaa
                  id="description"
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Enter priority description"
                  rows={5}
                  error={!!errors.description}
                  hint={errors.description}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <Button size="sm" variant="primary" disabled>
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
                  {isEditing ? "Update Priority" : "Add Priority"}
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
