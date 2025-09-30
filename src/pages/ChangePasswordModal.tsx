import React, { useState } from "react";
import { PopModal } from "../components/ui/modal/PopModal";
import Button from "../components/ui/button/Button";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { Eye, EyeOff } from "lucide-react";
import CentralizedLoader from "../components/common/CentralizedLoader";
import { apiService } from "../services/apiService";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Regex: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 symbol
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Validate inputs
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = "Old password is required.";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required.";
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit with API call
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        oldPassword,
        newPassword,
      };

      const { data, error } = await apiService.post<{ message: string }>(
        "/auth/change-password",
        payload
      );

      if (error) {
        console.error("Change password error:", error);
        showToast(
          typeof error === "string"
            ? error
            : (error as any)?.message || "Failed to change password.",
          "error"
        );
      } else {
        showToast(data?.message || "Password changed successfully!", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      showToast(
        err?.message || "An unexpected error occurred while changing password.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <PopModal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-xs mx-4 p-4 sm:max-w-sm sm:mx-6 sm:p-6 md:max-w-md"
    >
      <div className="flex flex-col space-y-5">
        {/* Header */}
        <div>
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 sm:text-xl leading-tight">
            Change Password
          </h5>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please enter your old password and set a new one.
          </p>
        </div>

        {/* Old Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Old Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword.old ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.oldPassword
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              } dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
              placeholder="Enter old password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-400"
              onClick={() => togglePasswordVisibility("old")}
            >
              {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.oldPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword.new ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.newPassword
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              } dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
              placeholder="Enter new password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-400"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword.confirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
              } dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
              placeholder="Re-enter new password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-400"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" />
                <span className="ml-2">Updating...</span>
              </>
            ) : (
              "Updating"
            )}
          </Button>
        </div>
      </div>

      {/* Loader */}
      <CentralizedLoader
        isLoading={isSubmitting}
         message="Processing your request..."
      />
    </PopModal>
  );
};

export default ChangePasswordModal;
