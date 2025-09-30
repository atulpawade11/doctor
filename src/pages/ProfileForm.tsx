import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Select from "../components/form/Select";
// import PhoneInput from "../../../components/form/group-input/PhoneInput";
import Button from "../components/ui/button/Button";
import {  User, Pencil, Trash2, Save } from "lucide-react";
import {
  //  EyeCloseIcon, EyeIcon, 
  EnvelopeIcon } from "../icons";
import Checkbox from "../components/form/input/Checkbox";
import DatePicker from "../components/form/input/DatePicker";
import Switch from "../components/form/switch/Switch";
import { useToast } from "../components/common/ToastProvider";
import Loader from "../components/common/Loader";
import CentralizedLoader from "../components/common/CentralizedLoader";

// Define the Employee type (same as in AllEmployees)
type Employee = {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
    email: string;
  };
  department: string;
  joiningDate: string;
  status: "Active" | "Inactive";
  // Additional fields from the form
  firstName: string;
  lastName: string;
  designation: string;
  birthDate: string;
  mobileNo: string;
  mobileNoAlternative: string;
  password: string;
  category: string;
  unit: string;
  zone: string;
  location: string;
  state: string;
  city: string;
  supervisor: string;
  bankAccountNo: string;
  bankName: string;
  IfscCode: string;
  expenseDesignation: string;
  userType: string;
  ttmt: string;
  secretary: string;
};

// Define the location state type
type LocationState = {
  employee: Employee;
  isEditing: boolean;
};

// ---------------- Main Form Component ----------------
export default function ProfileForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get state from navigation
  const { state } = location as { state: LocationState };
  // const isEditing = state?.isEditing || false;
  const isEditing = false;

  const employeeData = state?.employee || null;

const [formData, setFormData] = useState({
  firstName: "Soumya",
  lastName: "Tiwari",
  department: "Sales",
  designation: "Executive",
  role: "Manager",
  birthDate: "1990-05-15", // ISO format YYYY-MM-DD
  mobileNo: "9876543210",
  mobileNoAlternative: "9123456780",
  email: "soumya@immersiveinfotech.com",
  employeeIDD: "EMP-1001",
  joiningDate: "2020-01-10",
  password: "Pass@1234",
  category: "Sales",
  unit: "Unit A",
  zone: "North Zone",
  location: "Head Office",
  state: "Maharashtra",
  city: "Mumbai",
  supervisor: "Jane Smith",
  bankAccountNo: "123456789012",
  bankName: "State Bank of India",
  IfscCode: "SBIN0001234",
  expenseDesignation: "Travel & Allowance",
  userType: "Employee",
  ttmt: "TT", // or "MT"
  secretary: "Ravi Kumar",
  status: "Active" as "Active" | "Inactive",
});


  // const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedTTMT, setSelectedTTMT] = useState("");
  const [employeeImage, setEmployeeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showJoiningDatePicker, setShowJoiningDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory !== "Sales") {
      setSelectedTTMT("");
    }
  }, [selectedCategory]);

  // File input ref for reset/click
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create refs for scrolling to errors
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set form data if editing
  useEffect(() => {
    if (isEditing && employeeData) {
      setFormData({
        firstName: employeeData.firstName || "",
        lastName: employeeData.lastName || "",
        department: employeeData.department || "",
        designation: employeeData.designation || employeeData.user.role || "",
        role: employeeData.user.role || "",
        birthDate: employeeData.birthDate || "",
        mobileNo: employeeData.mobileNo || "",
        mobileNoAlternative: employeeData.mobileNoAlternative || "",
        email: employeeData.user.email || "",
        employeeIDD: employeeData.id.toString() || "",
        joiningDate: employeeData.joiningDate || "",
        password: employeeData.password || "",
        category: employeeData.category || "",
        unit: employeeData.unit || "",
        zone: employeeData.zone || "",
        location: employeeData.location || "",
        state: employeeData.state || "",
        city: employeeData.city || "",
        supervisor: employeeData.supervisor || "",
        bankAccountNo: employeeData.bankAccountNo || "",
        bankName: employeeData.bankName || "",
        IfscCode: employeeData.IfscCode || "",
        expenseDesignation: employeeData.expenseDesignation || "",
        userType: employeeData.userType || "",
        ttmt: employeeData.ttmt || "",
        secretary: employeeData.secretary || "",
        status: employeeData?.status || "Active" as "Active" | "Inactive",
      });

      setSelectedRole(employeeData.user.role || "");
      setSelectedCategory(employeeData.category || "");
      setSelectedUserType(employeeData.userType || "");
      if (employeeData.category === "Sales") {
        setSelectedTTMT(employeeData.ttmt || "");
      } else {
        setSelectedTTMT("");
      }
      setImagePreview(employeeData.user.image || null);
    }
  }, [isEditing, employeeData]);


  // Options (unchanged)
  const departments = [
    { value: "hr", label: "Human Resources" },
    { value: "it", label: "Information Technology" },
    { Value: "finance", label: "Finance" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "operations", label: "Operations" },
    { value: "Engineering", label: "Engineering" }, // Added to match sample data
  ];

  const designations = [
    { value: "manager", label: "Manager" },
    { value: "supervisor", label: "Supervisor" },
    { value: "executive", label: "Executive" },
    { value: "associate", label: "Associate" },
    { value: "director", label: "Director" },
    { value: "Developer", label: "Developer" }, // Added to match sample data
    { value: "Designer", label: "Designer" }, // Added to match sample data
  ];

  const roles = [
    { value: "Administrator", label: "Administrator" },
    { value: "User", label: "User" },
  ];

  const categories = [
    { value: "Corporate", label: "Corporate" },
    { value: "Sales", label: "Sales" },
  ];

  const units = [
    { value: "unit1", label: "Unit 1" },
    { value: "unit2", label: "Unit 2" },
    { value: "unit3", label: "Unit 3" }
  ];

  const zones = [
    { value: "north", label: "North Zone" },
    { value: "south", label: "South Zone" },
    { value: "east", label: "East Zone" },
    { value: "west", label: "West Zone" }
  ];

  const locations = [
    { value: "hq", label: "Headquarters" },
    { value: "branch1", label: "Branch Office 1" },
    { value: "branch2", label: "Branch Office 2" },
    { value: "remote", label: "Remote" }
  ];

  const supervisors = [
    { value: "john", label: "John Smith", EmpID: "EUM-1" },
    { value: "sarah", label: "Sarah Johnson", EmpID: "EUM-2" },
    { value: "mike", label: "Mike Williams", EmpID: "EUM-3" },
    { value: "lisa", label: "Lisa Brown", EmpID: "EUM-4" }
  ];

  const expenseDesignations = [
    { value: "manager", label: "Manager" },
    { value: "teamlead", label: "Team Lead" },
    { value: "executive", label: "Executive" }
  ];

  const userTypes = [
    { value: "Corporate", label: "Corporate" },
    { value: "Factory", label: "Factory" },
    { value: "Sales", label: "Sales" },

  ];

  const ttmtOptions = [
    { value: "Institution", label: "Institution" },
    { value: "TT", label: "TT" },
    { value: "MT", label: "MT" }
  ];

  const secretaryOptions = [
    { value: "secretary1", label: "Secretary A", EmpID: "EUM-1" },
    { value: "secretary2", label: "Secretary B", EmpID: "EUM-2" },
    { value: "secretary3", label: "Secretary C", EmpID: "EUM-3" }
  ];

  // const countries = [
  //   { code: "US", label: "+1" },
  //   { code: "GB", label: "+44" },
  //   { code: "CA", label: "+1" },
  //   { code: "AU", label: "+61" },
  // ];

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
      setErrors(prev => ({ ...prev, employeeImage: "Please upload a valid image (PNG, JPG, JPEG or SVG)." }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrors(prev => {
      const n = { ...prev };
      delete n.employeeImage;
      return n;
    });

    if (imagePreview && imagePreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }

    const objectUrl = URL.createObjectURL(file);
    setEmployeeImage(file);
    setImagePreview(objectUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove selected image
  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(imagePreview); } catch { /* ignore */ }
    }
    setEmployeeImage(null);
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

  // const handlePhoneNumberChange = (phoneNumber: string, field: string) => {
  //   handleInputChange(field, phoneNumber);
  // };

  const getTodayDate = () => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  };

  const handleDateSelect = (date: string, field: string) => {
    handleInputChange(field, date);
    if (field === "birthDate") setShowBirthDatePicker(false);
    if (field === "joiningDate") setShowJoiningDatePicker(false);
  };

  // Validation (modified for edit mode)
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // if (!employeeImage && !imagePreview) {
    //   newErrors.employeeImage = "Profile image is required.";
    // }

    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email?.trim()) newErrors.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email address.";

    if (!formData.employeeIDD?.trim()) newErrors.employeeIDD = "Employee ID is required.";

    if (!formData.mobileNo?.trim()) newErrors.mobileNo = "Mobile number is required.";
    // if (!formData.mobileNoAlternative?.trim()) newErrors.mobileNoAlternative = "Alternate mobile number is required.";
    // if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.department) newErrors.department = "Please select a department.";
    if (!formData.designation) newErrors.designation = "Please select a designation.";
    if (!selectedRole) newErrors.role = "Please select a role.";

    if (!formData.birthDate) newErrors.birthDate = "Birth date is required.";
    if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required.";

    if (formData.birthDate && formData.joiningDate) {
      if (formData.joiningDate <= formData.birthDate) {
        newErrors.joiningDate = "Joining date must be after birth date.";
      }
    }

    if (!selectedCategory) newErrors.category = "Please select a category.";
    if (!formData.unit) newErrors.unit = "Please select a unit.";
    if (!formData.zone) newErrors.zone = "Please select a zone.";
    if (!formData.location) newErrors.location = "Please select a location.";
    if (!formData.state?.trim()) newErrors.state = "State is required.";
    if (!formData.city?.trim()) newErrors.city = "City is required.";
    if (!formData.supervisor) newErrors.supervisor = "Please select a supervisor.";
    // if (!formData.bankAccountNo?.trim()) newErrors.bankAccountNo = "Bank account number is required.";
    // if (!formData.bankName?.trim()) newErrors.bankName = "Bank name is required.";
    // if (!formData.IfscCode?.trim()) newErrors.IfscCode = "Ifsc code is required.";
    if (!formData.expenseDesignation) newErrors.expenseDesignation = "Please select an expense designation.";
    if (!selectedUserType) newErrors.userType = "Please select a user type.";
    if (selectedCategory === "Sales" && !selectedTTMT) {
      newErrors.ttmt = "Please select a TTMT option.";
    }

    // if (!formData.secretary) newErrors.secretary = "Please select a secretary.";

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
        ...formData,
        role: selectedRole,
        category: selectedCategory,
        userType: selectedUserType,
        ttmt: selectedTTMT,
        employeeImage,
        id: isEditing && employeeData ? employeeData.id : null,
      };

      console.log("Submit payload:", payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Profile updated successfully!" : "Profile added successfully!",
        "success"
      );

      navigate("/home");
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
        title={isEditing ? "Edit Employee | Admin Dashboard" : "Add Employee | Admin Dashboard"}
        description={isEditing ? "Edit employee details" : "Add new employee to the system"}
      />

      <div className="flex-none">
        <PageBreadCrumbForForm
          // pageTitle={isEditing ? "Update Profile" : "Add New Profile"}
          pageTitle="Update Profile"

          btnLabel="Cancel"
          navigatePath="/home"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-6" ref={setErrorRef("employeeImage")}>
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

                {errors.employeeImage && <p className="mt-1 text-sm text-red-500">{errors.employeeImage}</p>}
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


                <div ref={setErrorRef("department")}>
                  <Label htmlFor="department">Department <span className="text-error-500">*</span> </Label>
                  <Select
                    id="department"
                    options={departments.map((d: any) => ({
                      value: d.value ?? d.Value, // accept both
                      label: d.label,
                    }))}
                    placeholder="Select Department"
                    selectedValue={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
                    error={!!errors.department}
                    hint={errors.department}
                  />

                </div>



                <div ref={setErrorRef("role")} className="pt-2">
                  <Label htmlFor="role">Role <span className="text-error-500">*</span> </Label>
                  <div className="flex flex-wrap gap-6 mt-3">
                    {roles.map(r => (
                      <div key={r.value} className="flex items-center">
                        <Checkbox
                          checked={selectedRole === r.value}
                          onChange={() => setSelectedRole(selectedRole === r.value ? "" : r.value)}
                          label={r.label}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
                </div>





                <div
                  ref={setErrorRef("email")}>
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


                <div ref={setErrorRef("mobileNo")}
                >
                  <Label htmlFor="mobileNo">Mobile No <span className="text-error-500">*</span> </Label>
                  {/* <PhoneInput
                    id="mobileNo"
                    selectPosition="start"
                    countries={countries}
                    phoneNumber={formData.mobileNo}
                    placeholder="Enter mobile number"
                    onPhoneNumberChange={(v) => handlePhoneNumberChange(v, "mobileNo")}
                    error={!!errors.mobileNo}
                    hint={errors.mobileNo}
                  /> */}

                  <Input
                    id="mobileNo"
                    value={formData.mobileNo}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // remove all non-digits
                      handleInputChange("mobileNo", value);
                    }}
                    placeholder="Enter mobile number"
                    type="text"
                    error={!!errors.mobileNo}
                    hint={errors.mobileNo}
                  />


                </div>




                <div ref={setErrorRef("employeeIDD")}>
                  <Label htmlFor="employeeIDD">Employee ID <span className="text-error-500">*</span> </Label>
                  <Input
                    id="employeeIDD"
                    value={formData.employeeIDD}
                    onChange={(e) => handleInputChange("employeeIDD", e.target.value)}
                    placeholder="Enter employee ID"
                    type="text"
                    error={!!errors.employeeIDD}
                    hint={errors.employeeIDD}
                  />
                </div>


                <div ref={setErrorRef("unit")}>
                  <Label htmlFor="unit">Unit <span className="text-error-500">*</span> </Label>
                  <Select
                    id="unit"
                    options={units}
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
                    options={locations}
                    placeholder="Select Location"
                    selectedValue={formData.location}
                    onValueChange={(v) => handleInputChange("location", v)}
                    error={!!errors.location}
                    hint={errors.location}
                  />
                </div>


                <div ref={setErrorRef("city")}>
                  <Label htmlFor="city">City <span className="text-error-500">*</span> </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                    type="text"
                    error={!!errors.city}
                    hint={errors.city}
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


                <div ref={setErrorRef("designation")}>
                  <Label htmlFor="designation">Designation <span className="text-error-500">*</span> </Label>
                  <Select
                    id="designation"
                    options={designations}
                    placeholder="Select Designation"
                    selectedValue={formData.designation}
                    onValueChange={(value) => handleInputChange("designation", value)}
                    error={!!errors.designation}
                    hint={errors.designation}
                  />
                </div>




                <div ref={setErrorRef("category")} className="pt-2">
                  <Label htmlFor="category">Category <span className="text-error-500">*</span> </Label>
                  <div className="flex flex-wrap gap-6 mt-3">
                    {categories.map(c => (
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


                <div ref={setErrorRef("birthDate")}>
                  <Label htmlFor="birthDate">Birth date <span className="text-error-500">*</span> </Label>
                  <DatePicker
                    value={formData.birthDate}
                    onChange={(date) => handleDateSelect(date, "birthDate")}
                    maxDate={getTodayDate()}
                    isOpen={showBirthDatePicker}
                    onToggle={() => setShowBirthDatePicker(s => !s)}
                  />
                  {errors.birthDate && <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>}
                </div>


                <div ref={setErrorRef("mobileNoAlternative")}>
                  <Label htmlFor="mobileNoAlternative">Mobile No (Alternative)

                    {/* <span className="text-error-500">*</span> */}

                  </Label>
                  {/* <PhoneInput
                    id="mobileNoAlternative"
                    selectPosition="start"
                    countries={countries}
                    phoneNumber={formData.mobileNoAlternative}
                    placeholder="Enter alternate mobile number"
                    onPhoneNumberChange={(v) => handlePhoneNumberChange(v, "mobileNoAlternative")}
                    error={!!errors.mobileNoAlternative}
                    hint={errors.mobileNoAlternative}
                  /> */}


                  <Input
                    id="mobileNoAlternative"
                    value={formData.mobileNoAlternative}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                      handleInputChange("mobileNoAlternative", value);
                    }}
                    placeholder="Enter alternate mobile number"
                    type="text"
                    error={!!errors.mobileNoAlternative}
                    hint={errors.mobileNoAlternative}
                  />

                </div>
















                <div ref={setErrorRef("joiningDate")}>
                  <Label htmlFor="joiningDate">Joining date <span className="text-error-500">*</span> </Label>
                  <DatePicker
                    value={formData.joiningDate}
                    onChange={(date) => handleDateSelect(date, "joiningDate")}
                    minDate={getTodayDate()}
                    isOpen={showJoiningDatePicker}
                    onToggle={() => setShowJoiningDatePicker(s => !s)}
                  />
                  {errors.joiningDate && <p className="mt-1 text-sm text-red-500">{errors.joiningDate}</p>}
                </div>








                <div ref={setErrorRef("zone")}>
                  <Label htmlFor="zone">Zone <span className="text-error-500">*</span> </Label>
                  <Select
                    id="zone"
                    options={zones}
                    placeholder="Select Zone"
                    selectedValue={formData.zone}
                    onValueChange={(v) => handleInputChange("zone", v)}
                    error={!!errors.zone}
                    hint={errors.zone}
                  />
                </div>



                <div ref={setErrorRef("state")}>
                  <Label htmlFor="state">State <span className="text-error-500">*</span> </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter state"
                    type="text"
                    error={!!errors.state}
                    hint={errors.state}
                  />
                </div>


              </div>
            </div>

            {/* Second row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-6">


                <div ref={setErrorRef("bankAccountNo")}>
                  <Label htmlFor="bankAccountNo">Bank Account No
                    {/* <span className="text-error-500">*</span> */}
                  </Label>
                  <div className="relative">
                    <Input
                      id="bankAccountNo"
                      value={formData.bankAccountNo}
                      onChange={(e) => handleInputChange("bankAccountNo", e.target.value)}
                      placeholder="Enter bank account number"
                      type="text"
                      className="pl-[62px]"
                      error={!!errors.bankAccountNo}
                      hint={errors.bankAccountNo}
                    />
                    <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="6.25" cy="10" r="5.625" fill="#E80B26" />
                        <circle cx="13.75" cy="10" r="5.625" fill="#F59D31" />
                        <path
                          d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
                          fill="#FC6020"
                        />
                      </svg>
                    </span>
                  </div>
                </div>

                <div ref={setErrorRef("bankName")}>
                  <Label htmlFor="bankName">Bank Name
                    {/* <span className="text-error-500">*</span> */}
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Enter bank name"
                    type="text"
                    error={!!errors.bankName}
                    hint={errors.bankName}
                  />
                </div>

                <div className="space-y-6">




                  <div ref={setErrorRef("ttmt")} className="pt-2">
                    <Label htmlFor="ttmt">TT/MT
                      {selectedCategory === "Sales" && <span className="text-error-500">*</span>}
                    </Label>
                    <div className="flex flex-wrap gap-6 mt-3">
                      {ttmtOptions.map(t => (
                        <div key={t.value} className="flex items-center">
                          <Checkbox
                            checked={selectedTTMT === t.value}
                            onChange={() => {
                              if (selectedCategory === "Sales") {
                                setSelectedTTMT(selectedTTMT === t.value ? "" : t.value);
                              }
                            }}
                            label={t.label}
                            disabled={selectedCategory !== "Sales"}
                          />
                        </div>
                      ))}
                    </div>
                    {errors.ttmt && <p className="mt-1 text-sm text-red-500">{errors.ttmt}</p>}
                  </div>













                </div>



              </div>

              <div className="space-y-6">
                <div ref={setErrorRef("IfscCode")}>
                  <Label htmlFor="IfscCode">IFSC Code
                    {/* <span className="text-error-500">*</span> */}
                  </Label>
                  <Input
                    id="IfscCode"
                    value={formData.IfscCode}
                    onChange={(e) => handleInputChange("IfscCode", e.target.value)}
                    placeholder="Enter IFSC code"
                    type="text"
                    error={!!errors.IfscCode}
                    hint={errors.IfscCode}
                  />
                </div>

                <div ref={setErrorRef("expenseDesignation")}>
                  <Label htmlFor="expenseDesignation">Expense Designation <span className="text-error-500">*</span> </Label>
                  <Select
                    id="expenseDesignation"
                    options={expenseDesignations}
                    placeholder="Select Expense Designation"
                    selectedValue={formData.expenseDesignation}
                    onValueChange={(v) => handleInputChange("expenseDesignation", v)}
                    error={!!errors.expenseDesignation}
                    hint={errors.expenseDesignation}
                  />
                </div>

                <div ref={setErrorRef("userType")} className="pt-2">
                  <Label htmlFor="userType">User Type <span className="text-error-500">*</span> </Label>
                  <div className="flex flex-wrap gap-6 mt-3">
                    {userTypes.map(u => (
                      <div key={u.value} className="flex items-center">
                        <Checkbox
                          checked={selectedUserType === u.value}
                          onChange={() => setSelectedUserType(selectedUserType === u.value ? "" : u.value)}
                          label={u.label}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.userType && <p className="mt-1 text-sm text-red-500">{errors.userType}</p>}
                </div>
              </div>
            </div>

            {/* Third row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">

              <div ref={setErrorRef("supervisor")}>
                <Label htmlFor="supervisor">Supervisor <span className="text-error-500">*</span> </Label>
                <Select
                  id="supervisor"
                  options={supervisors}
                  placeholder="Select Supervisor"
                  selectedValue={formData.supervisor}
                  onValueChange={(v) => handleInputChange("supervisor", v)}
                  error={!!errors.supervisor}
                  hint={errors.supervisor}
                />
              </div>




              <div className="space-y-6">
                <div ref={setErrorRef("secretary")}>
                  <Label htmlFor="secretary">Secretary
                    {/* <span className="text-error-500">*</span> */}
                  </Label>
                  <Select
                    id="secretary"
                    options={secretaryOptions}
                    placeholder="Select Secretary"
                    selectedValue={formData.secretary}
                    onValueChange={(v: string) => handleInputChange("secretary", v)}
                    error={!!errors.secretary}
                    hint={errors.secretary}
                  />
                </div>
              </div>


              <div ref={setErrorRef("status")}>
                <Label htmlFor="status">Employee Status <span className="text-error-500">*</span> </Label>
                <div className="flex items-center mt-4">
                  <Switch
                    label=""
                    checked={formData.status === "Active"}   // ✅ controlled
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: checked ? "Active" : "Inactive",
                      }))
                    }
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {formData.status}
                  </span>
                </div>
              </div>




              {/* <div ref={setErrorRef("password")}>
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
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeIcon className="fill-gray-500 size-5" /> : <EyeCloseIcon className="fill-gray-500 size-5" />}
                  </button>
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
              </div> */}



            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <Button
                  // type="button"
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
                  // startIcon={isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
                  startIcon={<Save className="size-5" />}

                >
                  {/* {isEditing ? "Update Profile" : "Add Profile"} */}
                 Update Profile

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