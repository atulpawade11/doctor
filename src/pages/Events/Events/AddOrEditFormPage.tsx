import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { Plus, Save, FileIcon, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import DatePicker from "../../../components/form/input/DatePicker";
import TextAreaa from "../../../components/form/input/TextAreaa";
import type { Event, EventFormData } from "./eventTypes";

// Define the location state type
type LocationState = {
  event: Event;
  isEditing: boolean;
};

// Allowed file types for image upload
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/gif", "image/webp"];
const ALLOWED_FILE_EXTENSIONS = ["png", "jpg", "jpeg", "svg", "gif", "webp"];

// ---------------- Main Form Component ----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const eventData = state?.event || null;

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
  });

  const [eventImage, setEventImage] = useState<File | null>(null);
  const [multipleImages, setMultipleImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [multipleImagesPreviews, setMultipleImagesPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // File input refs for reset/click
  const singleFileInputRef = useRef<HTMLInputElement | null>(null);
  const multipleFileInputRef = useRef<HTMLInputElement | null>(null);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && eventData) {
      setFormData({
        title: eventData.title || "",
        description: eventData.description || "",
        date: eventData.date || "",
      });
      setImagePreview(eventData.imageUrl || null);

      // For multiple images in edit mode
      if (eventData.multipleImages && eventData.multipleImages.length > 0) {
        setMultipleImagesPreviews(eventData.multipleImages);
      }
    }
  }, [isEditing, eventData]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up single image preview
      if (imagePreview && imagePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {
          // Ignore errors during cleanup
        }
      }

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
  }, [imagePreview, multipleImagesPreviews]);

  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) newErrors.title = "Event title is required.";
    if (!formData.description?.trim()) newErrors.description = "Event description is required.";
    if (!formData.date) newErrors.date = "Event date is required.";

    // Single image validation
    if (!imagePreview) {
      newErrors.eventImage = "Event image is required.";
    }

    // Multiple images validation
    if (multipleImagesPreviews.length === 0) {
      newErrors.multipleImages = "Please upload at least one additional image.";
    }

    setErrors(newErrors);

    // Show toast if errors exist
    if (Object.keys(newErrors).length > 0) {
      // showToast("Please fix the highlighted errors.", "error");

      // Scroll to the first error if there are any
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };


  // Handle single file upload with validation
  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const extension = file.name.split(".").pop()?.toLowerCase();
    const isValidType = ALLOWED_FILE_TYPES.includes(file.type) ||
      (extension && ALLOWED_FILE_EXTENSIONS.includes(extension));

    if (!isValidType) {
      setErrors(prev => ({
        ...prev,
        eventImage: "Please upload a valid image (PNG, JPG, JPEG, SVG, GIF or WEBP)."
      }));
      showToast("Invalid file format. Please upload a valid image.", "error");

      // Reset file input
      if (singleFileInputRef.current) singleFileInputRef.current.value = "";
      return;
    }

    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.eventImage;
      return newErrors;
    });

    // Clean up previous blob URL if it exists
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {
        // Ignore errors during cleanup
      }
    }

    // Create preview and update state
    const objectUrl = URL.createObjectURL(file);
    setEventImage(file);
    setImagePreview(objectUrl);

    // Reset file input for potential re-uploads
    if (singleFileInputRef.current) singleFileInputRef.current.value = "";
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

  // Remove single selected image
  const handleRemoveSingleImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {
        // Ignore errors during cleanup
      }
    }
    setEventImage(null);
    setImagePreview(null);
    if (singleFileInputRef.current) singleFileInputRef.current.value = "";
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

  // Handle date selection
  const handleDateSelect = (date: string) => {
    handleInputChange("date", date);
    setShowDatePicker(false);
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
      payload.append("description", formData.description);
      payload.append("date", formData.date);

      if (eventImage) payload.append("image", eventImage);

      multipleImages.forEach((file, index) => {
        payload.append(`multipleImages[${index}]`, file);
      });

      if (isEditing && eventData) {
        payload.append("id", eventData.id.toString());
      }

      // Simulate API call
      console.log("Submit payload:", {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        hasImage: !!eventImage,
        multipleImagesCount: multipleImages.length
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      showToast(
        isEditing ? "Event updated successfully!" : "Event added successfully!",
        "success"
      );

      // Navigate back to events list
      navigate("/all-events");
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
        title={isEditing ? "Edit Event | Admin Dashboard" : "Add Event | Admin Dashboard"}
        description={isEditing ? "Edit event details" : "Add new event to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Event" : "Add New Event"}
          btnLabel="Cancel"
          navigatePath="/all-events"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Main content grid - Image on left, fields on right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Single Image */}
              <div className="lg:col-span-1" ref={setErrorRef("eventImage")}>
                <div className="flex flex-col h-full">
                  {/* <Label htmlFor="eventImage" className="mb-2 text-left">
                    Event Image <span className="text-error-500">*</span>
                  </Label> */}
                  <div className="relative mb-2 w-full h-64">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-full h-full object-cover border-2 border-gray-200 rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 rounded-lg">
                        <FileIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2 justify-center items-center">
                    <input
                      type="file"
                      ref={singleFileInputRef}
                      accept=".png,.jpg,.jpeg,.svg,.gif,.webp,image/png,image/jpg,image/jpeg,image/svg+xml,image/gif,image/webp"
                      className="hidden"
                      onChange={handleSingleFileChange}
                    />

                    <button
                      type="button"
                      onClick={() => singleFileInputRef.current?.click()}
                      className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                      aria-label="Upload or change image"
                    >
                      <Pencil size={16} />
                    </button>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveSingleImage}
                        className="flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-2 text-sm text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                        aria-label="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Error hint for image field */}
                  {errors.eventImage && (
                    <p className="mt-2 text-sm text-red-500 text-left">
                      {errors.eventImage}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Fields */}
              <div className="lg:col-span-2 space-y-6">
                <div ref={setErrorRef("title")}>
                  <Label htmlFor="title" className="text-left">Event Title <span className="text-error-500">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter event title"
                    type="text"
                    error={!!errors.title}
                    hint={errors.title}
                  />
                </div>

                <div ref={setErrorRef("date")}>
                  <Label htmlFor="date" className="text-left">Event Date <span className="text-error-500">*</span></Label>
                  <DatePicker
                    value={formData.date}
                    onChange={handleDateSelect}
                    isOpen={showDatePicker}
                    onToggle={() => setShowDatePicker(s => !s)}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-500 text-left">{errors.date}</p>}
                </div>
              </div>
            </div>

            {/* Description field (full width) */}
            <div ref={setErrorRef("description")}>
              <Label htmlFor="description" className="text-left">Event Description <span className="text-error-500">*</span></Label>
              <TextAreaa
                id="description"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Enter event description"
                rows={5}
                error={!!errors.description}
                hint={errors.description}
              />
            </div>

            {/* Multiple Images field (full width) */}
            <div ref={setErrorRef("multipleImages")}>
              <Label htmlFor="multipleImages" className="mb-2 text-left">
                Additional Images <span className="text-error-500">*</span>
              </Label>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {multipleImagesPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Event preview ${index + 1}`}
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
                  {isEditing ? "Update Event" : "Add Event"}
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