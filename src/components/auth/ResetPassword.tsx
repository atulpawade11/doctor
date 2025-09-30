import { useState } from "react";
import { Link } from "react-router-dom";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useToast } from "../common/ToastProvider";
import PageMeta from "../common/PageMeta";
import AuthLayout from "../../pages/AuthPages/AuthPageLayout";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Email is required." });
      showToast("Email is required.", "error");
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      showToast("Temporary password sent to your registered email!", "success");
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <PageMeta
        title="Forgot Password | Mann Ka Doctor Admin Dashboard"
        description="Reset your Mann Ka Doctor account password. Enter your registered email to receive a temporary password and regain access to your account."
      />

      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                  Forgot Password
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email to receive a temporary password.
                </p>
              </div>

              {errors.general && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-400">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Processing..." : "Change Password"}
                  </button>
                </div>

                <p className="mt-6 text-left text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-red-500">*</span> Click to generate temporary password. This temporary password is sent to your registered email-id.
                </p>



                {/* Divider with OR text */}
                <div style={{ margin: "1.5rem 0" }} className="flex items-center">
                  <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
                  <span className="px-4 text-sm text-gray-500 dark:text-gray-400">OR</span>
                  <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
                </div>


                {/* Centered link */}
                <div style={{ textAlign: "center" }}>
                  <Link
                    to="/signin"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Signin?
                  </Link>
                </div>



              </form>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
