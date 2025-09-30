import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForForm from "./PageBreadCrumbForForm";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Plus, Save, X, Calculator, MapPin } from "lucide-react";
import { useToast } from "../../../components/common/ToastProvider";
import Loader from "../../../components/common/Loader";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type {
  SalesPricePolicy,
  Designation,
  CompetencyRank,
  // CityType,
} from "./SalesPricePolicyType";
import { defaultCompetencyRanks, designations, metroCities, policyNotes, getDefaultPolicyValues } from "./SalesPricePolicyType";

// -------------------- Location state type --------------------
type LocationState = {
  policy: SalesPricePolicy;
  isEditing: boolean;
};

// -------------------- Main Component --------------------
export default function AddOrEditSalesPricePolicy() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { state } = location as { state: LocationState };
  const isEditing = state?.isEditing || false;
  const policyData = state?.policy || null;

  const [formData, setFormData] = useState({
    designation: null as Designation | null,
    competencyRank: "" as CompetencyRank | "",
    customCompetencyRank: "",

    // HQ DA (upto 100 KMs)
    hqDaMetro: "",
    hqDaNonMetro: "",

    // Ex HQ DA (100-200 Kms)
    exHqDaMetro: "",
    exHqDaNonMetro: "",

    // Upcountry (>200 Kms) - calculated as half of HQ DA
    upcountryMetro: "",
    upcountryNonMetro: "",

    // Food Expenses
    foodExpensesHqDa: "NIL",
    foodExpensesMetroOutstation: "NIL",

    // Phone
    phoneCalls: "",
    phoneInternet: "",

    // Courier & Stationary
    courier: "Actual",
    stationary: "",

    // Lodging & Boarding (200 KMs & Above)
    lodgingBoardingMetro: "",
    lodgingBoardingNonMetro: "",
    lodgingBoardingWithoutBill: "0",

    // Petrol Allowance
    petrolAllowanceMetro: "NA",
    petrolAllowanceNonMetro: "NA",

    // Toll & Parking
    tollParking: "On Actual",

    // Monthly Meetings
    monthlyMeetingsDescription: "",
    monthlyMeetingsEligibility: "",
    monthlyMeetingsHqDa: "NA",
    monthlyMeetingsExHqDa: "NA",
    monthlyMeetingsOutstation: "NA",

    // Max Days Limit
    maxDaysLimitHqDa: "NA",
    maxDaysLimitExHqDa: "NA",
    maxDaysLimitOutstation: "NA",
  });

  const [competencyRanks, setCompetencyRanks] = useState<CompetencyRank[]>(defaultCompetencyRanks);
  const [showCustomRankInput, setShowCustomRankInput] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // -------------------- Prefill form when editing --------------------
  useEffect(() => {
    if (isEditing && policyData) {
      setFormData({
        designation: policyData.designation,
        competencyRank: policyData.competencyRank,
        customCompetencyRank: "",

        hqDaMetro: policyData.hqDaMetro.toString(),
        hqDaNonMetro: policyData.hqDaNonMetro.toString(),
        exHqDaMetro: policyData.exHqDaMetro.toString(),
        exHqDaNonMetro: policyData.exHqDaNonMetro.toString(),
        upcountryMetro: policyData.upcountryMetro.toString(),
        upcountryNonMetro: policyData.upcountryNonMetro.toString(),

        foodExpensesHqDa: policyData.foodExpensesHqDa,
        foodExpensesMetroOutstation: policyData.foodExpensesMetroOutstation,

        phoneCalls: policyData.phoneCalls.toString(),
        phoneInternet: policyData.phoneInternet?.toString() || "",

        courier: policyData.courier,
        stationary: policyData.stationary.toString(),

        lodgingBoardingMetro: policyData.lodgingBoardingMetro.toString(),
        lodgingBoardingNonMetro: policyData.lodgingBoardingNonMetro.toString(),
        lodgingBoardingWithoutBill: policyData.lodgingBoardingWithoutBill.toString(),

        petrolAllowanceMetro: policyData.petrolAllowanceMetro,
        petrolAllowanceNonMetro: policyData.petrolAllowanceNonMetro,

        tollParking: policyData.tollParking,

        monthlyMeetingsDescription: policyData.monthlyMeetingsDescription,
        monthlyMeetingsEligibility: policyData.monthlyMeetingsEligibility,
        monthlyMeetingsHqDa: policyData.monthlyMeetingsHqDa,
        monthlyMeetingsExHqDa: policyData.monthlyMeetingsExHqDa,
        monthlyMeetingsOutstation: policyData.monthlyMeetingsOutstation,

        maxDaysLimitHqDa: policyData.maxDaysLimitHqDa,
        maxDaysLimitExHqDa: policyData.maxDaysLimitExHqDa,
        maxDaysLimitOutstation: policyData.maxDaysLimitOutstation,
      });
    } else {
      // Set default values for new policy
      const defaults = getDefaultPolicyValues();
      setFormData(prev => ({
        ...prev,
        hqDaMetro: defaults.hqDaMetro.toString(),
        hqDaNonMetro: defaults.hqDaNonMetro.toString(),
        exHqDaMetro: defaults.exHqDaMetro.toString(),
        exHqDaNonMetro: defaults.exHqDaNonMetro.toString(),
        upcountryMetro: defaults.upcountryMetro.toString(),
        upcountryNonMetro: defaults.upcountryNonMetro.toString(),
        foodExpensesHqDa: defaults.foodExpensesHqDa,
        foodExpensesMetroOutstation: defaults.foodExpensesMetroOutstation,
        phoneCalls: defaults.phoneCalls.toString(),
        courier: defaults.courier,
        stationary: defaults.stationary.toString(),
        lodgingBoardingMetro: defaults.lodgingBoardingMetro.toString(),
        lodgingBoardingNonMetro: defaults.lodgingBoardingNonMetro.toString(),
        lodgingBoardingWithoutBill: defaults.lodgingBoardingWithoutBill.toString(),
        petrolAllowanceMetro: defaults.petrolAllowanceMetro,
        petrolAllowanceNonMetro: defaults.petrolAllowanceNonMetro,
        tollParking: defaults.tollParking,
      }));
    }
  }, [isEditing, policyData]);

  // -------------------- Refs for error scrolling --------------------
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // -------------------- Input Handler --------------------
  const handleInputChange = (field: string, value: string | number | Designation) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error on change
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-fill based on designation selection
    if (field === "designation" && typeof value !== "string" && typeof value !== "number") {
      const selectedDesignation = value as Designation;
      if (selectedDesignation) {
        setFormData(prev => ({
          ...prev,
          competencyRank: selectedDesignation.competencyRank
        }));

        // Auto-calculate upcountry values based on HQ DA
        if (formData.hqDaMetro) {
          const hqDaMetroNum = parseFloat(formData.hqDaMetro) || 0;
          setFormData(prevData => ({
            ...prevData,
            upcountryMetro: (hqDaMetroNum / 2).toString()
          }));
        }
        if (formData.hqDaNonMetro) {
          const hqDaNonMetroNum = parseFloat(formData.hqDaNonMetro) || 0;
          setFormData(prevData => ({
            ...prevData,
            upcountryNonMetro: (hqDaNonMetroNum / 2).toString()
          }));
        }
      }
    }

    // Auto-calculate upcountry when HQ DA changes
    if (field === "hqDaMetro" && typeof value === "string") {
      const hqDaMetroNum = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        upcountryMetro: (hqDaMetroNum / 2).toString()
      }));
    }

    if (field === "hqDaNonMetro" && typeof value === "string") {
      const hqDaNonMetroNum = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        upcountryNonMetro: (hqDaNonMetroNum / 2).toString()
      }));
    }
  };

  // -------------------- Add Custom Competency Rank --------------------
  const handleAddCustomCompetencyRank = () => {
    if (formData.customCompetencyRank.trim()) {
      const newRank = formData.customCompetencyRank.trim() as CompetencyRank;
      if (!competencyRanks.includes(newRank)) {
        setCompetencyRanks(prev => [...prev, newRank]);
        setFormData(prev => ({
          ...prev,
          competencyRank: newRank,
          customCompetencyRank: ""
        }));
        setShowCustomRankInput(false);
        showToast("Custom competency rank added successfully", "success");
      }
    }
  };

  // -------------------- Validation --------------------
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.designation) {
      newErrors.designation = "Please select a designation.";
    }

    if (!formData.competencyRank) {
      newErrors.competencyRank = "Please select a competency rank.";
    }

    // Numeric field validations
    const numericFields = [
      { key: "hqDaMetro", label: "HQ DA Metro" },
      { key: "hqDaNonMetro", label: "HQ DA Non Metro" },
      { key: "exHqDaMetro", label: "EX HQ DA Metro" },
      { key: "exHqDaNonMetro", label: "EX HQ DA Non Metro" },
      { key: "phoneCalls", label: "Phone Calls" },
      { key: "stationary", label: "Stationary" },
      { key: "lodgingBoardingMetro", label: "Lodging & Boarding Metro" },
      { key: "lodgingBoardingNonMetro", label: "Lodging & Boarding Non Metro" },
    ];

    numericFields.forEach(({ key, label }) => {
      const value = formData[key as keyof typeof formData];
      if (value && isNaN(Number(value))) {
        newErrors[key] = `${label} must be a valid number.`;
      }
    });

    setErrors(newErrors);

    // Scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // -------------------- Submit --------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload: Omit<SalesPricePolicy, 'id' | 'createdAt' | 'updatedAt'> & { id?: number } = {
        designation: formData.designation!,
        cityType: ["Metro", "Non Metro"], // Always include both city types as per Excel structure
        competencyRank: formData.competencyRank as CompetencyRank,

        hqDaMetro: Number(formData.hqDaMetro) || 0,
        hqDaNonMetro: Number(formData.hqDaNonMetro) || 0,
        exHqDaMetro: Number(formData.exHqDaMetro) || 0,
        exHqDaNonMetro: Number(formData.exHqDaNonMetro) || 0,
        upcountryMetro: Number(formData.upcountryMetro) || 0,
        upcountryNonMetro: Number(formData.upcountryNonMetro) || 0,

        foodExpensesHqDa: formData.foodExpensesHqDa,
        foodExpensesMetroOutstation: formData.foodExpensesMetroOutstation,

        phoneCalls: Number(formData.phoneCalls) || 0,
        phoneInternet: formData.phoneInternet ? Number(formData.phoneInternet) : undefined,

        courier: formData.courier,
        stationary: Number(formData.stationary) || 0,

        lodgingBoardingMetro: Number(formData.lodgingBoardingMetro) || 0,
        lodgingBoardingNonMetro: Number(formData.lodgingBoardingNonMetro) || 0,
        lodgingBoardingWithoutBill: Number(formData.lodgingBoardingWithoutBill) || 0,

        petrolAllowanceMetro: formData.petrolAllowanceMetro,
        petrolAllowanceNonMetro: formData.petrolAllowanceNonMetro,

        tollParking: formData.tollParking,

        monthlyMeetingsDescription: formData.monthlyMeetingsDescription,
        monthlyMeetingsEligibility: formData.monthlyMeetingsEligibility,
        monthlyMeetingsHqDa: formData.monthlyMeetingsHqDa,
        monthlyMeetingsExHqDa: formData.monthlyMeetingsExHqDa,
        monthlyMeetingsOutstation: formData.monthlyMeetingsOutstation,

        maxDaysLimitHqDa: formData.maxDaysLimitHqDa,
        maxDaysLimitExHqDa: formData.maxDaysLimitExHqDa,
        maxDaysLimitOutstation: formData.maxDaysLimitOutstation,

        isActive: true,
      };

      if (isEditing && policyData) {
        payload.id = policyData.id;
      }

      console.log("Submit payload:", payload);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast(
        isEditing ? "Sales policy updated successfully!" : "Sales policy added successfully!",
        "success"
      );

      navigate("/all-sales-price-policies");
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- Set ref for errors --------------------
  const setErrorRef = (key: string) => (el: HTMLDivElement | null) => {
    errorRefs.current[key] = el;
  };

  // -------------------- Competency Rank options --------------------
  const competencyRankOptions = competencyRanks.map(rank => ({
    value: rank,
    label: rank
  }));

  // -------------------- Designation options for Select --------------------
  const designationOptions = designations.map(d => ({
    value: d.id.toString(),
    label: d.name
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title={isEditing ? "Edit Sales Policy | Admin Dashboard" : "Add Sales Policy | Admin Dashboard"}
        description={isEditing ? "Edit sales policy details" : "Add new sales policy to the system"}
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForForm
          pageTitle={isEditing ? "Edit Sales Policy" : "Add New Sales Policy"}
          btnLabel="Cancel"
          navigatePath="/all-sales-price-policies"
        />
      </div>

      {/* Main Form */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">

          {/* Metro Cities Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <MapPin className="size-5 text-blue-600" />
              City Definitions
            </h3>
            <p className="text-sm text-gray-700">
              <strong>Metro Cities:</strong> {metroCities.join(", ")}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <strong>Non-Metro Cities:</strong> All other cities not listed above
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Basic Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Designation */}
              <div ref={setErrorRef("designation")}>
                <Label htmlFor="designation">Designation <span className="text-error-500">*</span></Label>
                <Select
                  id="designation"
                  options={designationOptions}
                  placeholder="Select Designation"
                  selectedValue={formData.designation?.id.toString() || ""}
                  onValueChange={(v) => {
                    const selected = designations.find(d => d.id.toString() === v);
                    handleInputChange("designation", selected || "");
                  }}
                  error={!!errors.designation}
                  hint={errors.designation}
                />
              </div>

              {/* Competency Rank with Add Option */}
              <div ref={setErrorRef("competencyRank")}>
                <Label htmlFor="competencyRank">Competency Rank <span className="text-error-500">*</span></Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      id="competencyRank"
                      options={competencyRankOptions}
                      placeholder="Select Competency Rank"
                      selectedValue={formData.competencyRank}
                      onValueChange={(v) => handleInputChange("competencyRank", v as CompetencyRank)}
                      error={!!errors.competencyRank}
                      hint={errors.competencyRank}
                    />
                  </div>
                
                </div>

                {/* Custom Competency Rank Input */}
                {showCustomRankInput && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={formData.customCompetencyRank}
                      onChange={(e) => handleInputChange("customCompetencyRank", e.target.value)}
                      placeholder="Enter new competency rank"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddCustomCompetencyRank}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomRankInput(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>

            </div>

            {/* Daily Allowance Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="size-5" />
                Daily Allowance (DA)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* HQ DA Metro */}
                <div>
                  <Label htmlFor="hqDaMetro">HQ DA Metro (upto 100 KMs)</Label>
                  <Input
                    id="hqDaMetro"
                    value={formData.hqDaMetro}
                    onChange={(e) => handleInputChange("hqDaMetro", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.hqDaMetro}
                    hint={errors.hqDaMetro}
                  />
                </div>

                {/* HQ DA Non Metro */}
                <div>
                  <Label htmlFor="hqDaNonMetro">HQ DA Non Metro (upto 100 KMs)</Label>
                  <Input
                    id="hqDaNonMetro"
                    value={formData.hqDaNonMetro}
                    onChange={(e) => handleInputChange("hqDaNonMetro", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.hqDaNonMetro}
                    hint={errors.hqDaNonMetro}
                  />
                </div>

                {/* EX HQ DA Metro */}
                <div>
                  <Label htmlFor="exHqDaMetro">EX HQ DA Metro (100-200 Kms)</Label>
                  <Input
                    id="exHqDaMetro"
                    value={formData.exHqDaMetro}
                    onChange={(e) => handleInputChange("exHqDaMetro", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.exHqDaMetro}
                    hint={errors.exHqDaNonMetro}
                  />
                </div>

                {/* EX HQ DA Non Metro */}
                <div>
                  <Label htmlFor="exHqDaNonMetro">EX HQ DA Non Metro (100-200 Kms)</Label>
                  <Input
                    id="exHqDaNonMetro"
                    value={formData.exHqDaNonMetro}
                    onChange={(e) => handleInputChange("exHqDaNonMetro", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.exHqDaNonMetro}
                    hint={errors.exHqDaNonMetro}
                  />
                </div>

                {/* Upcountry Metro (Auto-calculated) */}
                <div>
                  <Label htmlFor="upcountryMetro">Upcountry Metro (&gt;200 Kms)</Label>
                  <Input
                    id="upcountryMetro"
                    value={formData.upcountryMetro}
                    onChange={(e) => handleInputChange("upcountryMetro", e.target.value)}
                    placeholder="Auto-calculated"
                    type="number"
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Calculated as 50% of HQ DA Metro</p>
                </div>

                {/* Upcountry Non Metro (Auto-calculated) */}
                <div>
                  <Label htmlFor="upcountryNonMetro">Upcountry Non Metro (&gt;200 Kms)</Label>
                  <Input
                    id="upcountryNonMetro"
                    value={formData.upcountryNonMetro}
                    onChange={(e) => handleInputChange("upcountryNonMetro", e.target.value)}
                    placeholder="Auto-calculated"
                    type="number"
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Calculated as 50% of HQ DA Non Metro</p>
                </div>

              </div>
            </div>

            {/* Expenses Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Expenses & Allowances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Food Expenses HQ DA */}
                <div>
                  <Label htmlFor="foodExpensesHqDa">Food Expenses HQ DA</Label>
                  <Input
                    id="foodExpensesHqDa"
                    value={formData.foodExpensesHqDa}
                    onChange={(e) => handleInputChange("foodExpensesHqDa", e.target.value)}
                    placeholder="e.g., NIL, upto 15K per month"
                  />
                </div>

                {/* Food Expenses Metro & Outstation */}
                <div>
                  <Label htmlFor="foodExpensesMetroOutstation">Food Expenses Metro & Outstation</Label>
                  <Input
                    id="foodExpensesMetroOutstation"
                    value={formData.foodExpensesMetroOutstation}
                    onChange={(e) => handleInputChange("foodExpensesMetroOutstation", e.target.value)}
                    placeholder="e.g., NIL, upto 2000 per day"
                  />
                </div>

                {/* Phone Calls */}
                <div>
                  <Label htmlFor="phoneCalls">Phone Calls</Label>
                  <Input
                    id="phoneCalls"
                    value={formData.phoneCalls}
                    onChange={(e) => handleInputChange("phoneCalls", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.phoneCalls}
                    hint={errors.phoneCalls}
                  />
                </div>

                {/* Phone Internet */}
                <div>
                  <Label htmlFor="phoneInternet">Phone Internet</Label>
                  <Input
                    id="phoneInternet"
                    value={formData.phoneInternet}
                    onChange={(e) => handleInputChange("phoneInternet", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                  />
                </div>

                {/* Courier */}
                <div>
                  <Label htmlFor="courier">Courier</Label>
                  <Input
                    id="courier"
                    value={formData.courier}
                    onChange={(e) => handleInputChange("courier", e.target.value)}
                    placeholder="e.g., Actual"
                  />
                </div>

                {/* Stationary */}
                <div>
                  <Label htmlFor="stationary">Stationary</Label>
                  <Input
                    id="stationary"
                    value={formData.stationary}
                    onChange={(e) => handleInputChange("stationary", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.stationary}
                    hint={errors.stationary}
                  />
                </div>

                {/* Lodging & Boarding Metro */}
                <div>
                  <Label htmlFor="lodgingBoardingMetro">Lodging & Boarding Metro (200 KMs & Above)</Label>
                  <Input
                    id="lodgingBoardingMetro"
                    value={formData.lodgingBoardingMetro}
                    onChange={(e) => handleInputChange("lodgingBoardingMetro", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.lodgingBoardingMetro}
                    hint={errors.lodgingBoardingMetro}
                  />
                </div>

                {/* Lodging & Boarding Non Metro */}
                <div>
                  <Label htmlFor="lodgingBoardingNonMetro">Lodging & Boarding Non Metro (200 KMs & Above)</Label>
                  <Input
                    id="lodgingBoardingNonMetro"
                    value={formData.lodgingBoardingNonMetro}
                    onChange={(e) => handleInputChange("lodgingBoardingNonMetro", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                    error={!!errors.lodgingBoardingNonMetro}
                    hint={errors.lodgingBoardingNonMetro}
                  />
                </div>

                {/* Lodging & Boarding Without Bill */}
                <div>
                  <Label htmlFor="lodgingBoardingWithoutBill">Lodging Without Bill</Label>
                  <Input
                    id="lodgingBoardingWithoutBill"
                    value={formData.lodgingBoardingWithoutBill}
                    onChange={(e) => handleInputChange("lodgingBoardingWithoutBill", e.target.value)}
                    placeholder="Enter amount"
                    type="number"
                  />
                </div>

              </div>
            </div>

            {/* Additional Allowances Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Additional Allowances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Petrol Allowance Metro */}
                <div>
                  <Label htmlFor="petrolAllowanceMetro">Petrol Allowance Metro</Label>
                  <Input
                    id="petrolAllowanceMetro"
                    value={formData.petrolAllowanceMetro}
                    onChange={(e) => handleInputChange("petrolAllowanceMetro", e.target.value)}
                    placeholder="e.g., NA, Upto Rs. 16000/-"
                  />
                </div>

                {/* Petrol Allowance Non Metro */}
                <div>
                  <Label htmlFor="petrolAllowanceNonMetro">Petrol Allowance Non Metro</Label>
                  <Input
                    id="petrolAllowanceNonMetro"
                    value={formData.petrolAllowanceNonMetro}
                    onChange={(e) => handleInputChange("petrolAllowanceNonMetro", e.target.value)}
                    placeholder="e.g., NA, Upto Rs. 16000/-"
                  />
                </div>

                {/* Toll & Parking */}
                <div>
                  <Label htmlFor="tollParking">Toll & Parking</Label>
                  <Input
                    id="tollParking"
                    value={formData.tollParking}
                    onChange={(e) => handleInputChange("tollParking", e.target.value)}
                    placeholder="e.g., On Actual"
                  />
                </div>

                {/* Monthly Meetings Description */}
                <div>
                  <Label htmlFor="monthlyMeetingsDescription">Monthly Meetings Description</Label>
                  <Input
                    id="monthlyMeetingsDescription"
                    value={formData.monthlyMeetingsDescription}
                    onChange={(e) => handleInputChange("monthlyMeetingsDescription", e.target.value)}
                    placeholder="e.g., Sales Officers & SA / ISR / SPC"
                  />
                </div>

                {/* Monthly Meetings Eligibility */}
                <div>
                  <Label htmlFor="monthlyMeetingsEligibility">Monthly Meetings Eligibility</Label>
                  <Input
                    id="monthlyMeetingsEligibility"
                    value={formData.monthlyMeetingsEligibility}
                    onChange={(e) => handleInputChange("monthlyMeetingsEligibility", e.target.value)}
                    placeholder="e.g., Rs. 500/- pp"
                  />
                </div>

                {/* Monthly Meetings HQ DA */}
                <div>
                  <Label htmlFor="monthlyMeetingsHqDa">Monthly Meetings HQ DA</Label>
                  <Input
                    id="monthlyMeetingsHqDa"
                    value={formData.monthlyMeetingsHqDa}
                    onChange={(e) => handleInputChange("monthlyMeetingsHqDa", e.target.value)}
                    placeholder="e.g., NA"
                  />
                </div>

                {/* Monthly Meetings EX HQ DA */}
                <div>
                  <Label htmlFor="monthlyMeetingsExHqDa">Monthly Meetings EX HQ DA</Label>
                  <Input
                    id="monthlyMeetingsExHqDa"
                    value={formData.monthlyMeetingsExHqDa}
                    onChange={(e) => handleInputChange("monthlyMeetingsExHqDa", e.target.value)}
                    placeholder="e.g., 8 Days"
                  />
                </div>

                {/* Monthly Meetings Outstation */}
                <div>
                  <Label htmlFor="monthlyMeetingsOutstation">Monthly Meetings Outstation</Label>
                  <Input
                    id="monthlyMeetingsOutstation"
                    value={formData.monthlyMeetingsOutstation}
                    onChange={(e) => handleInputChange("monthlyMeetingsOutstation", e.target.value)}
                    placeholder="e.g., NA"
                  />
                </div>

              </div>
            </div>

            {/* Max Days Limit Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Max Days Limit</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Max Days Limit HQ DA */}
                <div>
                  <Label htmlFor="maxDaysLimitHqDa">Max Days Limit HQ DA</Label>
                  <Input
                    id="maxDaysLimitHqDa"
                    value={formData.maxDaysLimitHqDa}
                    onChange={(e) => handleInputChange("maxDaysLimitHqDa", e.target.value)}
                    placeholder="e.g., NA"
                  />
                </div>

                {/* Max Days Limit EX HQ DA */}
                <div>
                  <Label htmlFor="maxDaysLimitExHqDa">Max Days Limit EX HQ DA</Label>
                  <Input
                    id="maxDaysLimitExHqDa"
                    value={formData.maxDaysLimitExHqDa}
                    onChange={(e) => handleInputChange("maxDaysLimitExHqDa", e.target.value)}
                    placeholder="e.g., NA"
                  />
                </div>

                {/* Max Days Limit Outstation */}
                <div>
                  <Label htmlFor="maxDaysLimitOutstation">Max Days Limit Outstation</Label>
                  <Input
                    id="maxDaysLimitOutstation"
                    value={formData.maxDaysLimitOutstation}
                    onChange={(e) => handleInputChange("maxDaysLimitOutstation", e.target.value)}
                    placeholder="e.g., NA"
                  />
                </div>

              </div>
            </div>

            {/* Policy Notes */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Policy Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                  {policyNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <Button size="sm" variant="primary" disabled>
                  <Loader size="sm" />
                  Processing...
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
                >
                  {isEditing ? "Update Sales Policy" : "Add Sales Policy"}
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