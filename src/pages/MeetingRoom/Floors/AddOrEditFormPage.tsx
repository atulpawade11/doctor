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
import type { Floor, Location } from "./floorType";

// Define the location state type
type LocationState = {
  floor: Floor;
  isEditing: boolean;
};

// Sample locations data
const sampleLocations: Location[] = [
  { id: 1, name: "New York Office" },
  { id: 2, name: "London Branch" },
  { id: 3, name: "Tokyo Center" },
  { id: 4, name: "Paris Facility" },
  { id: 5, name: "Berlin Site" },
  { id: 6, name: "Sydney Office" },
  { id: 7, name: "Toronto Branch" }
];

// ---------------- Main Form Component ----------------
export default function AddOrEditFormPage() {
  const locationHook = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = locationHook as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const floorData = state?.floor || null;

  // Use the sample locations directly
  const locations = sampleLocations;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Set form data if editing
  useEffect(() => {
    if (isEditing && floorData) {
      setFormData({
        name: floorData.name || "",
        location: floorData.location || "",
      });
    }
  }, [isEditing, floorData]);

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

    if (!formData.name?.trim()) newErrors.name = "Floor name is required.";
    if (!formData.location) newErrors.location = "Please select a location.";

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
        id: isEditing && floorData ? floorData.id : null,
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Floor updated successfully!" : "Floor added successfully!",
        "success"
      );

      navigate("/all-floors");
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
        title={isEditing ? "Edit Floor | Admin Dashboard" : "Add Floor | Admin Dashboard"}
        description={isEditing ? "Edit floor details" : "Add new floor to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Floor" : "Add New Floor"}
          btnLabel="Cancel"
          navigatePath="/all-floors"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Two-column grid layout for normal screens, single column for mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Floor name field */}
              <div ref={setErrorRef("name")}>
                <Label htmlFor="name">Floor Name <span className="text-error-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter floor name"
                  type="text"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>

              {/* Location select field */}
              <div ref={setErrorRef("location")}>
                <Label htmlFor="location">Location <span className="text-error-500">*</span></Label>
                <Select
                  id="location"
                  options={locations.map(loc => ({ value: loc.name, label: loc.name }))}
                  placeholder="Select Location"
                  selectedValue={formData.location}
                  onValueChange={(v) => handleInputChange("location", v)}
                  error={!!errors.location}
                  hint={errors.location}
                />
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
                  {isEditing ? "Update Floor" : "Add Floor"}
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