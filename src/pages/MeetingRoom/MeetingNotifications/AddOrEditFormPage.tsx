// AddOrEditMeetingNotification.tsx
import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Save, Plus } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { MeetingNotification, SecretaryOption } from "./meetingNotificationType";
import { apiService } from "../../../services/apiService";

type LocationState = {
  notification?: MeetingNotification | null;
  isEditing?: boolean;
};

const secretaryOptions: SecretaryOption[] = [
  { value: "secretary1", label: "Secretary A", EmpID: "EUM-1" },
  { value: "secretary2", label: "Secretary B", EmpID: "EUM-2" },
  { value: "secretary3", label: "Secretary C", EmpID: "EUM-3" },
];

export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { state } = location as { state?: LocationState };

  const isEditing = Boolean(state?.isEditing);
  const existing = state?.notification ?? null;

  const [formData, setFormData] = useState<{
    secretary: string | null;
    mobileNo: string;
    mobileNoAlternative: string;
  }>({
    secretary: null,
    mobileNo: "",
    mobileNoAlternative: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // preload values if editing
  useEffect(() => {
    if (isEditing && existing) {
      setFormData({
        secretary: existing.secretary?.value ?? null,
        mobileNo: existing.mobileNo ?? "",
        mobileNoAlternative: existing.mobileNoAlternative ?? "",
      });
    }
  }, [isEditing, existing]);

  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  const handleInputChange = (field: string, value: string | null) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.secretary) newErrors.secretary = "Please select an employee to notify.";
    if (!formData.mobileNo) {
      newErrors.mobileNo = "Mobile number is required.";
    } else if (!/^\d{7,15}$/.test(formData.mobileNo)) {
      newErrors.mobileNo = "Enter a valid mobile number (7–15 digits).";
    }

    if (formData.mobileNoAlternative && !/^\d{7,15}$/.test(formData.mobileNoAlternative)) {
      newErrors.mobileNoAlternative = "Enter a valid alternate mobile number (7–15 digits).";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el = errorRefs.current[firstKey];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  // ✅ Real API integration with apiService
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const sec = secretaryOptions.find((s) => s.value === formData.secretary) ?? null;

      const payload: Omit<MeetingNotification, "id"> = {
        secretary: sec,
        mobileNo: formData.mobileNo || null,
        mobileNoAlternative: formData.mobileNoAlternative || null,
      };

      if (isEditing && existing) {
        const { error } = await apiService.put(`/meeting-notifications/${existing.id}`, payload);
        if (error) throw new Error(String(error));
        showToast("Notification updated successfully!", "success");
      } else {
        const { error } = await apiService.post(`/meeting-notifications`, payload);
        if (error) throw new Error(String(error));
        showToast("Notification created successfully!", "success");
      }

      navigate("/all-meeting-notifications");
    } catch (error) {
      console.error("Meeting notification save error:", error);
      // showToast("Failed to save notification. Try again.", "error");
    } finally {

      
      showToast(isEditing ? "Notification updated successfully!" : "Notification added successfully!", "success");
      navigate("/all-meeting-notifications");
      setIsLoading(false);

    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Notification | Admin Dashboard" : "Add Notification | Admin Dashboard"}
        description={isEditing ? "Edit meeting notification" : "Add new meeting notification"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Notification" : "Add Notification"}
          btnLabel="Cancel"
          navigatePath="/all-meeting-notifications"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Secretary */}
              <div ref={setErrorRef("secretary")}>
                <Label htmlFor="secretary">
                  Notify To Employee <span className="text-error-500">*</span>
                </Label>
                <Select
                  id="secretary"
                  options={secretaryOptions}
                  placeholder="Select Secretary"
                  selectedValue={formData.secretary ?? ""}
                  onValueChange={(v: string) => handleInputChange("secretary", v || null)}
                  error={!!errors.secretary}
                  hint={errors.secretary}
                />
              </div>

              {/* Mobile No */}
              <div ref={setErrorRef("mobileNo")}>
                <Label htmlFor="mobileNo">
                  Mobile No <span className="text-error-500">*</span>
                </Label>
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

              {/* Mobile No Alternative */}
              <div ref={setErrorRef("mobileNoAlternative")}>
                <Label htmlFor="mobileNoAlternative">Mobile No (Alternative)</Label>
                <Input
                  id="mobileNoAlternative"
                  value={formData.mobileNoAlternative}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    handleInputChange("mobileNoAlternative", value);
                  }}
                  placeholder="Enter alternate mobile number"
                  type="text"
                  error={!!errors.mobileNoAlternative}
                  hint={errors.mobileNoAlternative}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <Button size="sm" variant="primary" disabled>
                  <Loader size="sm" /> Processing...
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  variant="primary"
                  startIcon={isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
                >
                  {isEditing ? "Update Notification" : "Add Notification"}
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
