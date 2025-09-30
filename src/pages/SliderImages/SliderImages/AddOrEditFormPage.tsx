import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { SliderImages, SliderImagesFormData } from "./sliderImagesTypes";

// Define the location state type
type LocationState = {
  gallery: SliderImages;
  isEditing: boolean;
};

// Allowed file types for image upload
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/gif", "image/webp"];
const ALLOWED_FILE_EXTENSIONS = ["png", "jpg", "jpeg", "svg", "gif", "webp"];

export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const galleryData = state?.gallery || null;

  const [formData, setFormData] = useState<SliderImagesFormData>({
    title: "",
  });

  const [multipleImages, setMultipleImages] = useState<File[]>([]);
  const [multipleImagesPreviews, setMultipleImagesPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // File input refs for reset/click
  const multipleFileInputRef = useRef<HTMLInputElement | null>(null);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && galleryData) {
      setFormData({
        title: galleryData.title || "",
      });

      // For multiple images in edit mode
      if (galleryData.multipleImages && galleryData.multipleImages.length > 0) {
        setMultipleImagesPreviews(galleryData.multipleImages);
      }
    }
  }, [isEditing, galleryData]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {


      // Clean up multiple image previews
      multipleImagesPreviews.forEach(preview => {
        if (preview.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(preview);
          } catch {
            // Ignore errors during cleanup
          }
        }
      });
    };
  }, [multipleImagesPreviews]);

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = "Slider Image Title is required.";
    if (multipleImagesPreviews.length === 0) newErrors.multipleImages = "Please upload at least one image.";

    setErrors(newErrors);

    // Scroll to the first error if there are any
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };

  // Handle multiple file upload with validation
  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate each file
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const isValidType = ALLOWED_FILE_TYPES.includes(file.type) ||
        (extension && ALLOWED_FILE_EXTENSIONS.includes(extension));

      if (isValidType) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      showToast(
        `${invalidFiles.length} file(s) were not uploaded due to invalid format.`,
        "error"
      );

      // Set error for multiple images field
      setErrors(prev => ({
        ...prev,
        multipleImages: `${invalidFiles.length} file(s) have invalid format.`
      }));
    }

    // If no valid files, return
    if (validFiles.length === 0) {
      if (multipleFileInputRef.current) multipleFileInputRef.current.value = "";
      return;
    }

    // Clear any previous errors if we have valid files
    if (validFiles.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.multipleImages;
        return newErrors;
      });
    }

    // Create previews for valid files
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));

    // Update state
    setMultipleImages(prev => [...prev, ...validFiles]);
    setMultipleImagesPreviews(prev => [...prev, ...newPreviews]);

    // Reset file input for potential re-uploads
    if (multipleFileInputRef.current) multipleFileInputRef.current.value = "";
  };


  // Remove a multiple image
  const handleRemoveMultipleImage = (index: number) => {
    // Clean up blob URL
    if (multipleImagesPreviews[index].startsWith("blob:")) {
      try {
        URL.revokeObjectURL(multipleImagesPreviews[index]);
      } catch {
        // Ignore errors during cleanup
      }
    }

    // Update state
    setMultipleImages(prev => prev.filter((_, i) => i !== index));
    setMultipleImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Submit form handler
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Prepare payload
      const payload = new FormData();
      payload.append("title", formData.title);

      multipleImages.forEach((file, index) => {
        payload.append(`multipleImages[${index}]`, file);
      });

      if (isEditing && galleryData) {
        payload.append("id", galleryData.id.toString());
      }

      // Simulate API call
      console.log("Submit payload:", {
        title: formData.title,
        multipleImagesCount: multipleImages.length
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      showToast(
        isEditing ? "Slider Image updated successfully!" : "Slider Image added successfully!",
        "success"
      );

      // Navigate back to galleries list
      navigate("/all-slider-images");
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

  // Set ref callback function for error elements
  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Slider Image | Admin Dashboard" : "Add Slider Image | Admin Dashboard"}
        description={isEditing ? "Edit Slider Image details" : "Add new Slider Image to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Slider Image" : "Add New Slider Image"}
          btnLabel="Cancel"
          navigatePath="/all-slider-images"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-12" onSubmit={handleSubmit}>
            {/* Main content grid - Image on left, title field on right */}


            {/* Right Column - Title Field */}
            <div className="lg:col-span-2" ref={setErrorRef("title")}>
              <Label htmlFor="title" className="text-left">Slider Image Title <span className="text-error-500">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter Slider Image Title"
                type="text"
                error={!!errors.title}
                hint={errors.title}
              />
            </div>

            {/* Multiple Images field (full width) */}
            <div ref={setErrorRef("multipleImages")}>
              <Label htmlFor="multipleImages" className="mb-2 text-left">
                Multiple Images <span className="text-error-500">*</span>
              </Label>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {multipleImagesPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Gallery preview ${index + 1}`}
                      className="w-full h-32 object-cover border border-gray-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMultipleImage(index)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-1 text-red-600 hover:bg-red-100 dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      aria-label="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                <div
                  className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => multipleFileInputRef.current?.click()}
                >
                  <Plus size={24} className="text-gray-400" />
                </div>
              </div>

              <input
                type="file"
                ref={multipleFileInputRef}
                accept=".png,.jpg,.jpeg,.svg,.gif,.webp,image/png,image/jpg,image/jpeg,image/svg+xml,image/gif,image/webp"
                className="hidden"
                onChange={handleMultipleFilesChange}
                multiple
              />

              {errors.multipleImages && (
                <p className="mt-1 text-sm text-red-500 text-left">{errors.multipleImages}</p>
              )}
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
                  {isEditing ? "Update Slider" : "Add Slider"}
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