import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Plus, User, Pencil, Trash2, Save } from "lucide-react";
import { EyeCloseIcon, EyeIcon, EnvelopeIcon } from "../../../icons";
import Checkbox from "../../../components/form/input/Checkbox";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import type { Auditor } from "./auditorType";

// Define the location state type
type LocationState = {
  auditor: Auditor;
  isEditing: boolean;
};
// Sample options for dropdowns
const CATEGORIES = [
  { value: "Corporate", label: "Corporate" },
  { value: "Sales", label: "Sales" },
];

const UNITS = [
  { value: "Unit 1", label: "Unit 1" },
  { value: "Unit 2", label: "Unit 2" },
  { value: "Unit 3", label: "Unit 3" },
];

const ZONES = [
  { value: "North Zone", label: "North Zone" },
  { value: "South Zone", label: "South Zone" },
  { value: "East Zone", label: "East Zone" },
  { value: "West Zone", label: "West Zone" },
];

const LOCATIONS = [
  { value: "Headquarters", label: "Headquarters" },
  { value: "Branch Office 1", label: "Branch Office 1" },
  { value: "Branch Office 2", label: "Branch Office 2" },
  { value: "Remote", label: "Remote" },
];


// ---------------- Main Form Component ----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const auditorData = state?.auditor || null;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNo: "",
    email: "",
    password: "",
    category: "",
    unit: "",
    zone: "",
    location: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [auditorImage, setAuditorImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isZoneDisabled, setIsZoneDisabled] = useState(true);
  const [isLocationDisabled, setIsLocationDisabled] = useState(true);




  // File input ref for reset/click
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && auditorData) {
      console.log(auditorImage, "auditorImage");
      setFormData({
        firstName: auditorData.firstName || "",
        lastName: auditorData.lastName || "",
        mobileNo: auditorData.mobileNo || "",
        email: auditorData.email || "",
        password: auditorData.password || "",
        category: auditorData.category || "",
        unit: auditorData.unit || "",
        zone: auditorData.zone || "",
        location: auditorData.location || "",
      });

      setSelectedCategory(auditorData.category || "");
      setImagePreview(auditorData.user.image || null);
    }
  }, [isEditing, auditorData]);

  // Enable zone dropdown when unit is selected
  useEffect(() => {
    setIsZoneDisabled(!formData.unit);
  }, [formData.unit]);

  // Enable location dropdown when zone is selected
  useEffect(() => {
    setIsLocationDisabled(!formData.zone);
  }, [formData.zone]);

  // Handle file change and create preview (safe)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedMime = ["image/png", "image/jpeg", "image/svg+xml"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["png", "jpg", "jpeg", "svg"];

    if (!allowedMime.includes(file.type) && !(extension && allowedExt.includes(extension))) {
      setErrors(prev => ({ ...prev, auditorImage: "Please upload a valid image (PNG, JPG, JPEG or SVG)." }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrors(prev => {
      const n = { ...prev };
      delete n.auditorImage;
      return n;
    });

    if (imagePreview && imagePreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }

    const objectUrl = URL.createObjectURL(file);
    setAuditorImage(file);
    setImagePreview(objectUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove selected image
  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }
    setAuditorImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // cleanup on unmount (revoke any blob URL)
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
      }
    };
  }, [imagePreview]);

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

    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email?.trim()) newErrors.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email address.";

    if (!formData.mobileNo?.trim()) newErrors.mobileNo = "Mobile number is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!selectedCategory) newErrors.category = "Please select a category.";
    if (!formData.unit) newErrors.unit = "Please select a unit.";
    if (!formData.zone) newErrors.zone = "Please select a zone.";
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
        user: {
          image: imagePreview || "",
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        },
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNo: formData.mobileNo,
        email: formData.email,
        password: formData.password,
        category: selectedCategory,
        unit: formData.unit,
        zone: formData.zone,
        location: formData.location,
      };

      let response;
      if (isEditing && auditorData) {
        response = await apiService.put(`/auditors/${auditorData.id}`, payload);
      } else {
        response = await apiService.post("/auditors", payload);
      }

      if (response.error) {
        const errorMsg =
          typeof response.error === "string"
            ? response.error
            : (response.error as any)?.message || "Failed to save auditor";
        console.log(errorMsg)
        // showToast(errorMsg, "error");
      } else {
        showToast(
          isEditing ? "Auditor updated successfully!" : "Auditor added successfully!",
          "success"
        );
        navigate("/all-auditors");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // showToast(
      //   "An error occurred. Please try again.",
      //   "error"
      // );
    } finally {
      setIsLoading(false);
      showToast(
        isEditing ? "Auditor updated successfully!" : "Auditor added successfully!",
        "success"
      );
      navigate("/all-auditors");
    }
  };

  // Set ref callback function
  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Auditor | Admin Dashboard" : "Add Auditor | Admin Dashboard"}
        description={isEditing ? "Edit auditor details" : "Add new auditor to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Auditor" : "Add New Auditor"}
          btnLabel="Cancel"
          navigatePath="/all-auditors"
          isEditing={isEditing}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-6" ref={setErrorRef("auditorImage")}>
              <div className="w-full flex flex-col items-center">
                <div className="relative mb-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpg,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                    aria-label="Upload or change image"
                  >
                    <Pencil size={16} />
                  </button>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-2 text-sm text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      aria-label="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {errors.auditorImage && <p className="mt-1 text-sm text-red-500">{errors.auditorImage}</p>}
              </div>
            </div>

            {/* Two-column grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div ref={setErrorRef("firstName")}>
                  <Label htmlFor="firstName">First Name <span className="text-error-500">*</span> </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    type="text"
                    error={!!errors.firstName}
                    hint={errors.firstName}
                  />
                </div>

                <div ref={setErrorRef("email")}>
                  <Label htmlFor="email">Email Id <span className="text-error-500">*</span> </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                      className="pl-[62px]"
                      error={!!errors.email}
                      hint={errors.email}
                    />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500">
                      <EnvelopeIcon className="size-6" />
                    </span>
                  </div>
                </div>

                <div ref={setErrorRef("unit")}>
                  <Label htmlFor="unit">Unit <span className="text-error-500">*</span> </Label>
                  <Select
                    id="unit"
                    options={UNITS}
                    placeholder="Select Unit"
                    selectedValue={formData.unit}
                    onValueChange={(v) => handleInputChange("unit", v)}
                    error={!!errors.unit}
                    hint={errors.unit}
                  />
                </div>

                <div ref={setErrorRef("location")}>
                  <Label htmlFor="location">Location <span className="text-error-500">*</span> </Label>
                  <Select
                    id="location"
                    options={LOCATIONS}
                    placeholder="Select Location"
                    selectedValue={formData.location}
                    onValueChange={(v) => handleInputChange("location", v)}
                    error={!!errors.location}
                    hint={errors.location}
                    disabled={isLocationDisabled}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div ref={setErrorRef("lastName")}>
                  <Label htmlFor="lastName">Last Name <span className="text-error-500">*</span> </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    type="text"
                    error={!!errors.lastName}
                    hint={errors.lastName}
                  />
                </div>

                <div ref={setErrorRef("mobileNo")}>
                  <Label htmlFor="mobileNo">Mobile No <span className="text-error-500">*</span> </Label>
                  <Input
                    id="mobileNo"
                    value={formData.mobileNo}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      handleInputChange("mobileNo", value);
                    }}
                    placeholder="Enter mobile number"
                    type="text"
                    error={!!errors.mobileNo}
                    hint={errors.mobileNo}
                  />
                </div>

                <div ref={setErrorRef("zone")}>
                  <Label htmlFor="zone">Zone <span className="text-error-500">*</span> </Label>
                  <Select
                    id="zone"
                    options={ZONES}
                    placeholder="Select Zone"
                    selectedValue={formData.zone}
                    onValueChange={(v) => handleInputChange("zone", v)}
                    error={!!errors.zone}
                    hint={errors.zone}
                    disabled={isZoneDisabled}
                  />
                </div>

                <div ref={setErrorRef("password")}>
                  <Label htmlFor="password">Password <span className="text-error-500">*</span> </Label>
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
            </div>

            {/* Category and Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div ref={setErrorRef("category")} className="pt-2">
                <Label htmlFor="category">Category <span className="text-error-500">*</span> </Label>
                <div className="flex flex-wrap gap-6 mt-3">
                  {CATEGORIES.map(c => (
                    <div key={c.value} className="flex items-center">
                      <Checkbox
                        checked={selectedCategory === c.value}
                        onChange={() => setSelectedCategory(selectedCategory === c.value ? "" : c.value)}
                        label={c.label}
                      />
                    </div>
                  ))}
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
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
                  {isEditing ? "Update Auditor" : "Add Auditor"}
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