import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import Button from "../../../components/ui/button/Button";
import { Plus, Save } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { Department, DepartmentCategory } from "./departmentType";

// Define the location state type
type LocationState = {
  department: Department;
  isEditing: boolean;
};

// Category options
const categories = [
  { value: "Corporate" as DepartmentCategory, label: "Corporate" },
  { value: "Sales" as DepartmentCategory, label: "Sales" }
];

// ---------------- Main Form Component ----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const departmentData = state?.department || null;

  const [formData, setFormData] = useState({
    name: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<DepartmentCategory | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Set form data if editing
  useEffect(() => {
    if (isEditing && departmentData) {
      setFormData({
        name: departmentData.name || "",
      });
      setSelectedCategory(departmentData.category || "");
    }
  }, [isEditing, departmentData]);

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

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Department name is required.";
    if (!selectedCategory) newErrors.category = "Please select a category.";


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
        category: selectedCategory,
        id: isEditing && departmentData ? departmentData.id : null,
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Department updated successfully!" : "Department added successfully!",
        "success"
      );

      navigate("/all-departments");
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
        title={isEditing ? "Edit Department | Admin Dashboard" : "Add Department | Admin Dashboard"}
        description={isEditing ? "Edit department details" : "Add new department to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Department" : "Add New Department"}
          btnLabel="Cancel"
          navigatePath="/all-departments"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Single input field for department name */}
              <div ref={setErrorRef("name")}>
                <Label htmlFor="name">Department Name <span className="text-error-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter department name"
                  type="text"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>

              {/* Category selection */}
              <div ref={setErrorRef("category")}>
                <Label htmlFor="category">Department Category <span className="text-error-500">*</span></Label>
                <div className="flex flex-wrap gap-8 mt-4">
                  {categories.map(c => (
                    <div key={c.value} className="flex items-center">
                      <Checkbox
                        checked={selectedCategory === c.value}
                        onChange={() =>
                          setSelectedCategory(selectedCategory === c.value ? null : c.value)
                        }
                        label={c.label}
                      />
                    </div>
                  ))}
                </div>
                {errors.category && <p className="mt-4 text-sm text-red-500">{errors.category}</p>}
              </div>
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
                  {isEditing ? "Update Department" : "Add Department"}
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