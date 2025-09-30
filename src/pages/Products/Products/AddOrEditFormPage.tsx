import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextAreaa from "../../../components/form/input/TextAreaa";
import Button from "../../../components/ui/button/Button";
import { Plus, Save, Box, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { Product } from "./productType";

// Define the location state type
type LocationState = {
  product: Product;
  isEditing: boolean;
};

// ---------------- Main Form Component ----------------
export default function AddOrEditProductFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const productData = state?.product || null;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // File input ref for reset/click
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && productData) {
      setFormData({
        name: productData.name || "",
        description: productData.description || "",
      });
      setImagePreview(productData.imageUrl || null);
    }
  }, [isEditing, productData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Product name is required.";
    if (!formData.description?.trim()) newErrors.description = "Product description is required.";
    if (!imagePreview) newErrors.productImage = "Product image is required.";

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

  // Update the handleFileChange function to show toast for invalid files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedMime = ["image/png", "image/jpeg", "image/svg+xml", "image/gif", "image/webp"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["png", "jpg", "jpeg", "svg", "gif", "webp"];

    if (!allowedMime.includes(file.type) && !(extension && allowedExt.includes(extension))) {
      setErrors(prev => ({ ...prev, productImage: "Please upload a valid image (PNG, JPG, JPEG, SVG, GIF or WEBP)." }));

      // Show toast error
      showToast("Please upload a valid image (PNG, JPG, JPEG, SVG, GIF or WEBP).", "error");

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrors(prev => {
      const n = { ...prev };
      delete n.productImage;
      return n;
    });

    if (imagePreview && imagePreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }

    const objectUrl = URL.createObjectURL(file);
    setProductImage(file);
    setImagePreview(objectUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove selected image
  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }
    setProductImage(null);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        productImage,
        id: isEditing && productData ? productData.id : null,
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Product updated successfully!" : "Product added successfully!",
        "success"
      );

      navigate("/all-products");
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
        title={isEditing ? "Edit Product | Admin Dashboard" : "Add Product | Admin Dashboard"}
        description={isEditing ? "Edit product details" : "Add new product to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Product" : "Add New Product"}
          btnLabel="Cancel"
          navigatePath="/all-products"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Main content grid - Image on left, fields on right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Image */}
              <div className="lg:col-span-1" ref={setErrorRef("productImage")}>
                <div className="flex flex-col items-center h-full">
                  <div className="relative mb-2 w-full h-64">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-contain border-2 border-gray-200 rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 rounded-lg">
                        <Box className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".png,.jpg,.jpeg,.svg,.gif,.webp,image/png,image/jpg,image/jpeg,image/svg+xml,image/gif,image/webp"
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

                  {/* Error hint for image field */}
                  {errors.productImage && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {errors.productImage}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Fields */}
              <div className="lg:col-span-2 space-y-6">
                <div ref={setErrorRef("name")}>
                  <Label htmlFor="name">Product Name <span className="text-error-500">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    type="text"
                    error={!!errors.name}
                    hint={errors.name}
                  />
                </div>

                <div ref={setErrorRef("description")}>
                  <Label htmlFor="description">Product Description <span className="text-error-500">*</span></Label>
                  <TextAreaa
                    id="description"
                    value={formData.description}
                    onChange={(value) => handleInputChange("description", value)}
                    placeholder="Enter product description"
                    rows={5}
                    error={!!errors.description}
                    hint={errors.description}
                  />
                </div>
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
                  {isEditing ? "Update Product" : "Add Product"}
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