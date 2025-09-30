import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextAreaa from "../../../components/form/input/TextAreaa";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Plus, Save } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { QuoteOfTheDay, Employee } from "./QuoteOfTheDayType";

// Define the location state type
type LocationState = {
  quote: QuoteOfTheDay;
  isEditing: boolean;
};

// Sample employees data
const sampleEmployees: Employee[] = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Emma Johnson" },
  { id: 3, name: "Michael Brown" },
  { id: 4, name: "Sarah Davis" },
  { id: 5, name: "David Wilson" },
  { id: 6, name: "Jennifer Miller" },
  { id: 7, name: "Robert Taylor" },
  { id: 8, name: "Lisa Anderson" }
];

// ---------------- Main Form Component ----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const quoteData = state?.quote || null;

  // Use the sample employees directly
  const employees = sampleEmployees;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    addedBy: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && quoteData) {
      setFormData({
        title: quoteData.title || "",
        description: quoteData.description || "",
        addedBy: quoteData.addedBy || "",
      });
    }
  }, [isEditing, quoteData]);

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

    if (!formData.title?.trim()) newErrors.title = "Quote title is required.";
    if (!formData.description?.trim()) newErrors.description = "Quote description is required.";
    if (!formData.addedBy) newErrors.addedBy = "Please select an employee.";

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
        id: isEditing && quoteData ? quoteData.id : null,
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Quote updated successfully!" : "Quote added successfully!",
        "success"
      );

      navigate("/all-quotes");
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
        title={isEditing ? "Edit Quote | Admin Dashboard" : "Add Quote | Admin Dashboard"}
        description={isEditing ? "Edit quote details" : "Add new quote to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Quote" : "Add New Quote"}
          btnLabel="Cancel"
          navigatePath="/all-quotes"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Two-column grid layout for normal screens, single column for mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quote title field */}
              <div ref={setErrorRef("title")}>
                <Label htmlFor="title">Quote Title <span className="text-error-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter quote title"
                  type="text"
                  error={!!errors.title}
                  hint={errors.title}
                />
              </div>

              {/* Added by employee select field */}
              <div ref={setErrorRef("addedBy")}>
                <Label htmlFor="addedBy">Added By Employee <span className="text-error-500">*</span></Label>
                <Select
                  id="addedBy"
                  options={employees.map(emp => ({ value: emp.name, label: emp.name }))}
                  placeholder="Select Employee"
                  selectedValue={formData.addedBy}
                  onValueChange={(v) => handleInputChange("addedBy", v)}
                  error={!!errors.addedBy}
                  hint={errors.addedBy}
                />
              </div>
            </div>

            {/* Quote description field (full width) */}
            <div ref={setErrorRef("description")}>
              <Label htmlFor="description">Quote Description <span className="text-error-500">*</span></Label>
              <TextAreaa
                id="description"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Enter quote description"
                rows={5}
                error={!!errors.description}
                hint={errors.description}
              />
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
                  {isEditing ? "Update Quote" : "Add Quote"}
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