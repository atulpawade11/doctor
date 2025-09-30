import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextAreaa from "../../../components/form/input/TextAreaa";
import MultiSelect from "./MultiSelect";
import Button from "../../../components/ui/button/Button";
import { Plus, Save } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { Group, GroupMember } from "./groupType";

// Define the location state type
type LocationState = {
  group: Group;
  isEditing: boolean;
};

// Sample group members data
const groupMembersOptions: GroupMember[] = [
  { value: "john", label: "John Smith", EmpID: "EUM-1" },
  { value: "sarah", label: "Sarah Johnson", EmpID: "EUM-2" },
  { value: "mike", label: "Mike Williams", EmpID: "EUM-3" },
  { value: "lisa", label: "Lisa Brown", EmpID: "EUM-4" },
  { value: "david", label: "David Wilson", EmpID: "EUM-5" },
  { value: "emma", label: "Emma Johnson", EmpID: "EUM-6" },
  { value: "robert", label: "Robert Taylor", EmpID: "EUM-7" },
  { value: "jennifer", label: "Jennifer Miller", EmpID: "EUM-8" }
];

// ---------------- Main Form Component ----------------
export default function AddOrEditFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const groupData = state?.group || null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    members: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && groupData) {
      setFormData({
        title: groupData.title || "",
        description: groupData.description || "",
        members: groupData.members.map(member => member.value) || [],
      });
    }
  }, [isEditing, groupData]);

  // Handlers
  const handleInputChange = (field: string, value: string | string[]) => {
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

    if (!formData.title?.trim()) newErrors.title = "Group title is required.";
    if (!formData.description?.trim()) newErrors.description = "Group description is required.";
    if (formData.members.length === 0) newErrors.members = "Please select at least one group member.";

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
      const selectedMembers = groupMembersOptions.filter(member =>
        formData.members.includes(member.value)
      );

      const payload = {
        ...formData,
        members: selectedMembers,
        id: isEditing && groupData ? groupData.id : null,
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Group updated successfully!" : "Group created successfully!",
        "success"
      );

      navigate("/all-groups");
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
        title={isEditing ? "Edit Group | Admin Dashboard" : "Add Group | Admin Dashboard"}
        description={isEditing ? "Edit group details" : "Create new group"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Group" : "Create New Group"}
          btnLabel="Cancel"
          navigatePath="/all-groups"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Two-column grid layout for normal screens, single column for mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Group title field */}
              <div ref={setErrorRef("title")}>
                <Label htmlFor="title">Group Title <span className="text-error-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter group title"
                  type="text"
                  error={!!errors.title}
                  hint={errors.title}
                />
              </div>

              {/* Group members multi-select field */}
              <div ref={setErrorRef("members")}>
                <Label htmlFor="members">Group Members <span className="text-error-500">*</span></Label>
                <MultiSelect
                  options={groupMembersOptions}
                  selectedValues={formData.members}
                  onValuesChange={(values) => handleInputChange("members", values)}
                  placeholder="Select group members"
                  error={!!errors.members}
                  hint={errors.members}
                  disabled={false}
                />
              </div>
            </div>

            {/* Group description field (full width) */}
            <div ref={setErrorRef("description")}>
              <Label htmlFor="description">Group Description <span className="text-error-500">*</span></Label>
              <TextAreaa
                id="description"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                placeholder="Enter group description"
                rows={5}
                error={!!errors.description}
                hint={errors.description}
              />
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
                  {isEditing ? "Update Group" : "Create Group"}
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