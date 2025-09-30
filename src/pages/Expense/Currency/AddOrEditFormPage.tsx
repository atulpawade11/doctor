import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Plus, Save } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { Currency } from "./currencyType";

// Location state type
type LocationState = {
  currency: Currency;
  isEditing: boolean;
};

export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const currencyData = state?.currency || null;

  const [formData, setFormData] = useState({
    currencyTitle: "",
    currencyValue: "",
    currencyInr: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && currencyData) {
      setFormData({
        currencyTitle: currencyData.currencyTitle || "",
        currencyValue: currencyData.currencyValue,
        currencyInr: currencyData.currencyInr,
      });
    }
  }, [isEditing, currencyData]);

  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleInputChange = (field: string, value: string) => {
    if (field === "currencyValue" || field === "currencyInr") {
      // Allow only whole numbers (no decimals, no letters)
      if (!/^\d*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Only whole numbers are allowed.",
        }));
        return; // ⛔️ Do not update state if not an integer
      } else {
        setErrors((prev) => {
          const n = { ...prev };
          delete n[field];
          return n;
        });
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currencyTitle?.trim()) {
      newErrors.currencyTitle = "Currency title is required.";
    }

    if (!formData.currencyValue?.trim()) {
      newErrors.currencyValue = "Currency value is required.";
    } else if (!/^\d+$/.test(formData.currencyValue)) {
      newErrors.currencyValue = "Currency value must be a whole number.";
    } else if (parseInt(formData.currencyValue) <= 0) {
      newErrors.currencyValue = "Currency value must be greater than 0.";
    }

    if (!formData.currencyInr?.trim()) {
      newErrors.currencyInr = "Currency INR is required.";
    } else if (!/^\d+$/.test(formData.currencyInr)) {
      newErrors.currencyInr = "Currency INR must be a whole number.";
    } else if (parseInt(formData.currencyInr) <= 0) {
      newErrors.currencyInr = "Currency INR must be greater than 0.";
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
      const payload: Currency = {
        id: isEditing && currencyData ? currencyData.id : Date.now(),
        currencyTitle: formData.currencyTitle.trim(),
        currencyValue: formData.currencyValue,
        currencyInr: formData.currencyInr,
      };

      console.log("Submit payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Currency updated successfully!" : "Currency added successfully!",
        "success"
      );

      navigate("/all-currencies");
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
        title={isEditing ? "Edit Currency | Admin Dashboard" : "Add Currency | Admin Dashboard"}
        description={isEditing ? "Edit currency details" : "Add new currency to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Currency" : "Add New Currency"}
          btnLabel="Cancel"
          navigatePath="/all-currencies"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency Title */}
              <div ref={setErrorRef("currencyTitle")}>
                <Label htmlFor="currencyTitle">Currency Title <span className="text-error-500">*</span></Label>
                <Input
                  id="currencyTitle"
                  value={formData.currencyTitle}
                  onChange={(e) => handleInputChange("currencyTitle", e.target.value)}
                  placeholder="Enter currency title (e.g., USD, EUR)"
                  type="text"
                  error={!!errors.currencyTitle}
                  hint={errors.currencyTitle}
                />
              </div>

              {/* Currency Value */}
              <div ref={setErrorRef("currencyValue")}>
                <Label htmlFor="currencyValue">Currency Value <span className="text-error-500">*</span></Label>
                <Input
                  id="currencyValue"
                  value={formData.currencyValue}
                  onChange={(e) => handleInputChange("currencyValue", e.target.value)}
                  placeholder="Enter currency value (e.g., 1, 100)"
                  type="text"
                  error={!!errors.currencyValue}
                  hint={errors.currencyValue}
                />
              </div>

              {/* Currency INR */}
              <div ref={setErrorRef("currencyInr")}>
                <Label htmlFor="currencyInr">Currency INR <span className="text-error-500">*</span></Label>
                <Input
                  id="currencyInr"
                  value={formData.currencyInr}
                  onChange={(e) => handleInputChange("currencyInr", e.target.value)}
                  placeholder="Enter currency in INR (e.g., 83, 90)"
                  type="text"
                  error={!!errors.currencyInr}
                  hint={errors.currencyInr}
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
                  {isEditing ? "Update Currency" : "Add Currency"}
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