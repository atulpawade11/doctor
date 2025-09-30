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
import type { Room, Location, Floor } from "./roomType";

// -------------------- Location state type --------------------
type LocationState = {
  room: Room;
  isEditing: boolean;
};

// -------------------- Sample Locations & Floors --------------------
const sampleLocations: Location[] = [
  { id: 1, name: "Building A" },
  { id: 2, name: "Building B" },
  { id: 3, name: "Building C" },
];

const sampleFloorsByLocation: Record<number, Floor[]> = {
  1: [
    { id: 1, name: "Ground Floor" },
    { id: 2, name: "1st Floor" },
    { id: 3, name: "2nd Floor" },
  ],
  2: [
    { id: 4, name: "1st Floor" },
    { id: 5, name: "2nd Floor" },
    { id: 6, name: "Basement" },
  ],
  3: [
    { id: 7, name: "Ground Floor" },
    { id: 8, name: "3rd Floor" },
  ],
};

// -------------------- Main Component --------------------
export default function AddOrEditFormPage() {
  const locationHook = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = locationHook as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const roomData = state?.room || null;

  const [formData, setFormData] = useState({
    name: "",
    locationId: "",
    floorId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // -------------------- Prefill when editing --------------------
  useEffect(() => {
    if (isEditing && roomData) {
      const selectedLocation = sampleLocations.find(
        (loc) => loc.name === roomData.location
      );
      const selectedLocationId = selectedLocation ? String(selectedLocation.id) : "";

      const selectedFloorList = selectedLocation
        ? sampleFloorsByLocation[selectedLocation.id]
        : [];
      const selectedFloor = selectedFloorList.find(
        (fl) => fl.name === roomData.floor
      );

      setFormData({
        name: roomData.name || "",
        locationId: selectedLocationId,
        floorId: selectedFloor ? String(selectedFloor.id) : "",
      });
    }
  }, [isEditing, roomData]);

  // -------------------- Derived Floor Options --------------------
  const floorOptions =
    formData.locationId && sampleFloorsByLocation[Number(formData.locationId)]
      ? sampleFloorsByLocation[Number(formData.locationId)].map((fl) => ({
        value: String(fl.id),
        label: fl.name,
      }))
      : [];

  // -------------------- Refs for error scrolling --------------------
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // -------------------- Input Handler --------------------
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "locationId" ? { floorId: "" } : {}), // reset floor when location changes
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // -------------------- Validation --------------------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Room name is required.";
    }

    if (!formData.locationId) {
      newErrors.locationId = "Please select a Location.";
    }


    if (!formData.locationId && !formData.floorId) {
      newErrors.floorId = "Select Location first to enable Floor selection.";
    } else if (formData.locationId && !formData.floorId) {
      newErrors.floorId = "Please select a Floor.";
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

  // -------------------- Submit --------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const locationObj = sampleLocations.find(
        (loc) => String(loc.id) === formData.locationId
      );
      const floorObj = sampleFloorsByLocation[Number(formData.locationId)]?.find(
        (fl) => String(fl.id) === formData.floorId
      );

      const payload: Room = {
        id: isEditing && roomData ? roomData.id : Date.now(),
        name: formData.name,
        location: locationObj?.name || "",
        floor: floorObj?.name || "",
      };

      console.log("Submit payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Room updated successfully!" : "Room added successfully!",
        "success"
      );

      navigate("/all-rooms");
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
        title={isEditing ? "Edit Room | Admin Dashboard" : "Add Room | Admin Dashboard"}
        description={isEditing ? "Edit room details" : "Add new room to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Room" : "Add New Room"}
          btnLabel="Cancel"
          navigatePath="/all-rooms"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Name */}
              <div ref={setErrorRef("name")}>
                <Label htmlFor="name">
                  Room Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter room name"
                  type="text"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>

              {/* Location */}
              <div ref={setErrorRef("locationId")}>
                <Label htmlFor="locationId">
                  Location <span className="text-error-500">*</span>
                </Label>
                <Select
                  id="locationId"
                  options={sampleLocations.map((loc) => ({
                    value: String(loc.id),
                    label: loc.name,
                  }))}
                  placeholder="Select Location"
                  selectedValue={formData.locationId}
                  onValueChange={(v) => handleInputChange("locationId", v)}
                  error={!!errors.locationId}
                  hint={errors.locationId}
                />
              </div>

              {/* Floor */}
              <div ref={setErrorRef("floorId")}>
                <Label htmlFor="floorId">
                  Floor <span className="text-error-500">*</span>
                </Label>
                <Select
                  id="floorId"
                  options={floorOptions}
                  placeholder={
                    formData.locationId
                      ? "Select Floor"
                      : "Select Location first"
                  }
                  selectedValue={formData.floorId}
                  onValueChange={(v) => handleInputChange("floorId", v)}
                  disabled={!formData.locationId}
                  error={!!errors.floorId}
                  hint={errors.floorId}
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
                  {isEditing ? "Update Room" : "Add Room"}
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
