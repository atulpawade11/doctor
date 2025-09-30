import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Plus, Save, Trash2 } from "lucide-react";
import { EyeCloseIcon, EyeIcon } from "../../../icons";
import Switch from "../../../components/form/switch/Switch";
import Checkbox from "../../../components/form/input/Checkbox";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import type { Accountant, AccountantLocation } from "./accountantType";

// Location state type
type LocationState = {
  accountant: Accountant;
  isEditing: boolean;
};

// Sample options
const EMPLOYEES_LIST = [
  { value: "john", label: "John Smith", EmpID: "EUM-1" },
  { value: "sarah", label: "Sarah Johnson", EmpID: "EUM-2" },
  { value: "mike", label: "Mike Williams", EmpID: "EUM-3" },
  { value: "lisa", label: "Lisa Brown", EmpID: "EUM-4" },
];

const CATEGORIES = [
  { value: "All", label: "All" },
  { value: "Sales", label: "Sales" },
  { value: "Corporate", label: "Corporate" },
];

const UNITS = [
  { id: "unit1", value: "Unit 1", label: "Unit 1" },
  { id: "unit2", value: "Unit 2", label: "Unit 2" },
  { id: "unit3", value: "Unit 3", label: "Unit 3" },
];

const ZONES = {
  unit1: [
    { value: "zone1-1", label: "North Zone" },
    { value: "zone1-2", label: "South Zone" },
  ],
  unit2: [
    { value: "zone2-1", label: "East Zone" },
    { value: "zone2-2", label: "West Zone" },
  ],
  unit3: [
    { value: "zone3-1", label: "Central Zone" },
    { value: "zone3-2", label: "Metro Zone" },
  ],
};

const LOCATIONS = {
  "zone1-1": [
    { value: "loc1-1-1", label: "Headquarters" },
    { value: "loc1-1-2", label: "Main Office" },
  ],
  "zone1-2": [
    { value: "loc1-2-1", label: "Branch Office 1" },
    { value: "loc1-2-2", label: "Branch Office 2" },
  ],
  "zone2-1": [
    { value: "loc2-1-1", label: "Regional Office" },
    { value: "loc2-1-2", label: "Service Center" },
  ],
  "zone2-2": [
    { value: "loc2-2-1", label: "Remote Office" },
    { value: "loc2-2-2", label: "Field Office" },
  ],
  "zone3-1": [
    { value: "loc3-1-1", label: "Central Hub" },
    { value: "loc3-1-2", label: "Distribution Center" },
  ],
  "zone3-2": [
    { value: "loc3-2-1", label: "Metro Branch" },
    { value: "loc3-2-2", label: "City Office" },
  ],
};

// ---------------- Main Component ----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const accountantData = state?.accountant || null;

  const [formData, setFormData] = useState({
    selectedEmployee: "",
    isAdmin: false,
    userName: "",
    password: "",
    category: "",
    unit: "",
    zone: "",
    location: "",
  });

  const [locations, setLocations] = useState<AccountantLocation[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isZoneDisabled, setIsZoneDisabled] = useState(true);
  const [isLocationDisabled, setIsLocationDisabled] = useState(true);
  const [availableZones, setAvailableZones] = useState<{ value: string; label: string }[]>([]);
  const [availableLocations, setAvailableLocations] = useState<{ value: string; label: string }[]>([]);

  // Ref to track errors for scrolling
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  // Load form data if editing
  useEffect(() => {
    if (isEditing && accountantData) {
      setFormData({
        selectedEmployee: accountantData.selectedEmployee || "",
        isAdmin: accountantData.isAdmin || false,
        userName: accountantData.userName || "",
        password: accountantData.password || "",
        category: accountantData.category || "",
        unit: "",
        zone: "",
        location: "",
      });
      setLocations(accountantData.locations || []);
    }
  }, [isEditing, accountantData]);

  useEffect(() => {
    if (formData.unit) {
      const unitId = UNITS.find(u => u.value === formData.unit)?.id;
      if (unitId && ZONES[unitId as keyof typeof ZONES]) {
        setAvailableZones(ZONES[unitId as keyof typeof ZONES]);
        setIsZoneDisabled(false);
      }
    } else {
      setAvailableZones([]);
      setIsZoneDisabled(true);
      setFormData(prev => ({ ...prev, zone: "", location: "" }));
    }
  }, [formData.unit]);

  useEffect(() => {
    if (formData.zone) {
      if (LOCATIONS[formData.zone as keyof typeof LOCATIONS]) {
        setAvailableLocations(LOCATIONS[formData.zone as keyof typeof LOCATIONS]);
        setIsLocationDisabled(false);
      }
    } else {
      setAvailableLocations([]);
      setIsLocationDisabled(true);
      setFormData(prev => ({ ...prev, location: "" }));
    }
  }, [formData.zone]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const handleAddLocation = () => {
    if (!formData.unit || !formData.zone || !formData.location) return;

    const unitLabel = UNITS.find(u => u.value === formData.unit)?.label || formData.unit;
    const zoneLabel = availableZones.find(z => z.value === formData.zone)?.label || formData.zone;
    const locationLabel = availableLocations.find(l => l.value === formData.location)?.label || formData.location;

    const newLocation: AccountantLocation = {
      id: Date.now(),
      unit: unitLabel,
      zone: zoneLabel,
      location: locationLabel,
    };

    setLocations(prev => [...prev, newLocation]);
    setFormData(prev => ({ ...prev, unit: "", zone: "", location: "" }));
  };

  const handleRemoveLocation = (id: number) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.selectedEmployee) newErrors.selectedEmployee = "Please select an employee.";
    if (!formData.userName.trim()) newErrors.userName = "Username is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.category) newErrors.category = "Please select a category.";
    if (locations.length === 0) newErrors.locations = "At least one location is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to the first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const selectedEmployee = EMPLOYEES_LIST.find(emp => emp.value === formData.selectedEmployee);

      const payload = {
        user: {
          name: selectedEmployee?.label || "",
          email: `${formData.selectedEmployee}@company.com`,
          employeeId: selectedEmployee?.EmpID || ""
        },
        selectedEmployee: formData.selectedEmployee,
        isAdmin: formData.isAdmin,
        userName: formData.userName,
        password: formData.password,
        category: formData.category,
        locations: locations,
      };

      let response;
      if (isEditing && accountantData) {
        response = await apiService.put(`/accountants/${accountantData.id}`, payload);
      } else {
        response = await apiService.post("/accountants", payload);
      }

      if (response.error) {
        const errorMsg = typeof response.error === "string"
          ? response.error
          : (response.error as any)?.message || "Failed to save accountant";
        console.log(errorMsg);
        // showToast(errorMsg, "error");
      } else {
        showToast(
          isEditing ? "Accountant updated successfully!" : "Accountant added successfully!",
          "success"
        );
        navigate("/all-accountants");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
      showToast(
        isEditing ? "Accountant updated successfully!" : "Accountant added successfully!",
        "success"
      );
      navigate("/all-accountants");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Accountant | Admin Dashboard" : "Add Accountant | Admin Dashboard"}
        description={isEditing ? "Edit accountant details" : "Add new accountant to the system"}
      />
      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Accountant" : "Add New Accountant"}
          btnLabel="Cancel"
          navigatePath="/all-accountants"
          isEditing={isEditing}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div ref={setErrorRef("selectedEmployee")}>
                  <Label htmlFor="selectedEmployee">Select Accountant <span className="text-error-500">*</span></Label>
                  <Select
                    id="selectedEmployee"
                    options={EMPLOYEES_LIST.map(emp => ({
                      value: emp.value,
                      label: emp.label,
                      EmpID: emp.EmpID
                    }))}
                    placeholder="Select Accountant"
                    selectedValue={formData.selectedEmployee}
                    onValueChange={(v) => handleInputChange("selectedEmployee", v)}
                    error={!!errors.selectedEmployee}
                    hint={errors.selectedEmployee}
                  />
                </div>
                <div ref={setErrorRef("userName")}>
                  <Label htmlFor="userName">Accountant Username <span className="text-error-500">*</span></Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) => handleInputChange("userName", e.target.value)}
                    placeholder="Enter username"
                    type="text"
                    error={!!errors.userName}
                    hint={errors.userName}
                  />
                </div>
                <div ref={setErrorRef("password")}>
                  <Label htmlFor="password">Password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      error={!!errors.password}
                      hint={errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="isAdmin">
                    Is Admin <span className="text-error-500">*</span>
                  </Label>
                  <div className="flex items-center mt-4">
                    <Switch
                      label=""
                      checked={formData.isAdmin}
                      onChange={(checked) => handleInputChange("isAdmin", checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {formData.isAdmin ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div ref={setErrorRef("category")} className="pt-2">
                  <Label htmlFor="category">Category <span className="text-error-500">*</span></Label>
                  <div className="flex flex-wrap gap-6 mt-4">
                    {CATEGORIES.map(c => (
                      <div key={c.value} className="flex items-center">
                        <Checkbox
                          checked={formData.category === c.value}
                          onChange={() => handleInputChange("category", formData.category === c.value ? "" : c.value)}
                          label={c.label}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Locations</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    id="unit"
                    options={UNITS.map(u => ({ value: u.value, label: u.label }))}
                    placeholder="Select Unit"
                    selectedValue={formData.unit}
                    onValueChange={(v) => handleInputChange("unit", v)}
                  />
                </div>

                <div>
                  <Label htmlFor="zone">Zone</Label>
                  <Select
                    id="zone"
                    options={availableZones}
                    placeholder="Select Zone"
                    selectedValue={formData.zone}
                    onValueChange={(v) => handleInputChange("zone", v)}
                    disabled={isZoneDisabled}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    id="location"
                    options={availableLocations}
                    placeholder="Select Location"
                    selectedValue={formData.location}
                    onValueChange={(v) => handleInputChange("location", v)}
                    disabled={isLocationDisabled}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleAddLocation}
                    disabled={!formData.unit || !formData.zone || !formData.location}
                    size="sm"
                    variant="outline"
                    startIcon={<Plus className="size-6" />}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div ref={setErrorRef("locations")}>
                {locations.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Unit</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Zone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {locations.map((loc, index) => (
                          <tr key={loc.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{index + 1}.</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{loc.unit}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{loc.zone}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{loc.location}</td>
                            <td className="px-4 py-3">

                              <button
                                onClick={() => handleRemoveLocation(loc.id)}
                                className="flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-2 text-sm text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                              >
                                <Trash2 size={16} />
                              </button>

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No locations added yet. Please add at least one location.
                  </div>
                )}
                {errors.locations && <p className="mt-1 text-sm text-red-500">{errors.locations}</p>}
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
                  {isEditing ? "Update Accountant" : "Add Accountant"}
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
