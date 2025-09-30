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
import type { Zone, Unit } from "./zoneType";

// Location state
type LocationState = {
  zone: Zone | null;
  isEditing: boolean;
};

// Sample Units (replace with API later)
const sampleUnits: Unit[] = [
  { id: 1, name: "Unit A" },
  { id: 2, name: "Unit B" },
  { id: 3, name: "Unit C" },
  { id: 4, name: "Unit D" },
];

export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const zoneData = state?.zone || null;

  const [formData, setFormData] = useState({
    name: "",
    unitId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && zoneData) {
      setFormData({
        name: zoneData.name || "",
        unitId: zoneData.unitId.toString(),
      });
    }
  }, [isEditing, zoneData]);

  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Zone name is required.";
    if (!formData.unitId) newErrors.unitId = "Please select a unit.";

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
      const selectedUnit = sampleUnits.find(u => u.id === Number(formData.unitId));
      const payload: Zone = {
        id: isEditing && zoneData ? zoneData.id : Date.now(),
        name: formData.name.trim(),
        unitId: Number(formData.unitId),
        unitName: selectedUnit?.name || "",
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Zone updated successfully!" : "Zone added successfully!",
        "success"
      );

      navigate("/all-zones");
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
        title={isEditing ? "Edit Zone | Admin Dashboard" : "Add Zone | Admin Dashboard"}
        description={isEditing ? "Edit zone details" : "Add new zone to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Zone" : "Add New Zone"}
          btnLabel="Cancel"
          navigatePath="/all-zones"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zone Name */}
              <div ref={setErrorRef("name")}>
                <Label htmlFor="name">Zone Name <span className="text-error-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter zone name"
                  type="text"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>

              {/* Unit Select */}
              <div ref={setErrorRef("unitId")}>
                <Label htmlFor="unitId">Unit <span className="text-error-500">*</span></Label>
                <Select
                  id="unitId"
                  selectedValue={formData.unitId}
                  onValueChange={(val) => handleInputChange("unitId", val)}
                  options={sampleUnits.map((u) => ({ value: u.id.toString(), label: u.name }))}
                  error={!!errors.unitId}
                  hint={errors.unitId}
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
                  {isEditing ? "Update Zone" : "Add Zone"}
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
