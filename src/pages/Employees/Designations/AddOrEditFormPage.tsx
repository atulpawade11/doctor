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
import type { Designation, DepartmentCategory } from "./designationType";

// -------------------- Location state type --------------------
type LocationState = {
  designation: Designation;
  isEditing: boolean;
};

// -------------------- Category options --------------------
const categoryOptions = [
  { value: "Corporate" as DepartmentCategory, label: "Corporate" },
  { value: "Sales" as DepartmentCategory, label: "Sales" },
];

// -------------------- Department options by category --------------------
const departmentOptionsByCategory: Record<DepartmentCategory, { value: string; label: string }[]> = {
  Corporate: [
    { value: "Engineering", label: "Engineering" },
    { value: "Marketing", label: "Marketing" },
    { value: "HR", label: "Human Resources" },
    { value: "Finance", label: "Finance" },
    { value: "Operations", label: "Operations" },
    { value: "IT", label: "Information Technology" },
    { value: "Legal", label: "Legal" },
    { value: "Admin", label: "Administration" },
  ],
  Sales: [
    { value: "Domestic Sales", label: "Domestic Sales" },
    { value: "International Sales", label: "International Sales" },
    { value: "Channel Sales", label: "Channel Sales" },
    { value: "Retail Sales", label: "Retail Sales" },
    { value: "Online Sales", label: "Online Sales" },
    { value: "Key Accounts", label: "Key Accounts" },
  ],
};

// -------------------- Main Component --------------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const designationData = state?.designation || null;

  const [formData, setFormData] = useState({
    name: "",
    category: "" as DepartmentCategory | "",
    department: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // -------------------- Prefill form when editing --------------------
  useEffect(() => {
    if (isEditing && designationData) {
      setFormData({
        name: designationData.name || "",
        category: designationData.category || "",
        department: designationData.department || "",
      });
    }
  }, [isEditing, designationData]);

  // -------------------- Refs for error scrolling --------------------
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // -------------------- Input Handler --------------------
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error on change
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Reset department if category changes
    if (field === "category") {
      setFormData(prev => ({ ...prev, department: "" }));
    }
  };

  // -------------------- Validation --------------------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Designation name is required.";
    }

    if (!formData.category) {
      newErrors.category = "Please select a Department Category.";
    }

    if (!formData.category && !formData.department) {
      newErrors.department = "Select Department Category first to enable Department selection.";
    } else if (formData.category && !formData.department) {
      newErrors.department = "Please select a Department.";
    }

    setErrors(newErrors);

    // Scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // -------------------- Submit --------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload: Designation = {
        ...formData,
        id: isEditing && designationData ? designationData.id : Date.now(),
        category: formData.category as DepartmentCategory,
        department: formData.department,
      };

      console.log("Submit payload:", payload);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Designation updated successfully!" : "Designation added successfully!",
        "success"
      );

      navigate("/all-designations");
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- Set ref for errors --------------------
  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  // -------------------- Department options based on category --------------------
  const filteredDepartments = formData.category
    ? departmentOptionsByCategory[formData.category]
    : [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Designation | Admin Dashboard" : "Add Designation | Admin Dashboard"}
        description={isEditing ? "Edit designation details" : "Add new designation to the system"}
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Designation" : "Add New Designation"}
          btnLabel="Cancel"
          navigatePath="/all-designations"
        />
      </div>

      {/* Main Form */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div ref={setErrorRef("name")}>
                <Label htmlFor="name">Designation Name <span className="text-error-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter designation name"
                  type="text"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>

              {/* Category */}
              <div ref={setErrorRef("category")}>
                <Label htmlFor="category">Department Category <span className="text-error-500">*</span></Label>
                <Select
                  id="category"
                  options={categoryOptions}
                  placeholder="Select Category"
                  selectedValue={formData.category}
                  onValueChange={(v) => handleInputChange("category", v)}
                  error={!!errors.category}
                  hint={errors.category}
                />
              </div>

              {/* Department */}
              <div ref={setErrorRef("department")}>
                <Label htmlFor="department">Department <span className="text-error-500">*</span></Label>
                <Select
                  id="department"
                  options={filteredDepartments}
                  placeholder={
                    formData.category
                      ? "Select Department"
                      : "Select Category first"
                  }
                  selectedValue={formData.department}
                  onValueChange={(v) => handleInputChange("department", v)}
                  error={!!errors.department}
                  hint={errors.department}
                  disabled={!formData.category}
                />
              </div>
            </div>

            {/* Submit */}
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
                  {isEditing ? "Update Designation" : "Add Designation"}
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
