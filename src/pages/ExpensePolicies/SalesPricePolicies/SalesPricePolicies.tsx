import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForSalesPricePolicies from "./TableForSalesPricePolicies";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { SalesPricePolicy } from "./SalesPricePolicyType";
import { designations } from "./SalesPricePolicyType";

// ---------------- Sample Data Generator ----------------
const generateSamplePolicies = (): SalesPricePolicy[] => {
  return designations.map((designation, index) => ({
    id: index + 1,
    designation,
    cityType: ["Metro", "Non Metro"], // Both city types as per Excel structure
    competencyRank: designation.competencyRank,

    hqDaMetro: 400 + (index * 50),
    hqDaNonMetro: 350 + (index * 50),
    exHqDaMetro: 1000,
    exHqDaNonMetro: 1000,
    upcountryMetro: Math.round((400 + (index * 50)) / 2),
    upcountryNonMetro: Math.round((350 + (index * 50)) / 2),

    foodExpensesHqDa: "NIL",
    foodExpensesMetroOutstation: "NIL",

    phoneCalls: 1000 + (index * 200),
    phoneInternet: undefined,

    courier: "Actual",
    stationary: 300 + (index * 50),

    lodgingBoardingMetro: 3000 + (index * 500),
    lodgingBoardingNonMetro: 2700 + (index * 500),
    lodgingBoardingWithoutBill: 0,

    petrolAllowanceMetro: index > 2 ? "Upto Rs. 16000/-" : "NA",
    petrolAllowanceNonMetro: index > 2 ? "Upto Rs. 16000/-" : "NA",

    tollParking: "On Actual",

    monthlyMeetingsDescription: index === 0 ? "Sales Officers & SA / ISR / SPC" : "",
    monthlyMeetingsEligibility: index === 0 ? "Rs. 500/- pp" : "",
    monthlyMeetingsHqDa: "NA",
    monthlyMeetingsExHqDa: index === 0 ? "8 Days" : "NA",
    monthlyMeetingsOutstation: "NA",

    maxDaysLimitHqDa: "NA",
    maxDaysLimitExHqDa: "NA",
    maxDaysLimitOutstation: "NA",

    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

// Sample data fallback
const samplePolicies = generateSamplePolicies();

// ---------------- Column Config ----------------
const columnConfig = [
  { key: "designation", label: "Designation & Rank", visible: true, width: "200px" },
  { key: "competencyRank", label: "Competency Rank", visible: true, width: "150px" },
  { key: "hqDaMetro", label: "HQ DA Metro", visible: true, width: "120px" },
  { key: "hqDaNonMetro", label: "HQ DA Non Metro", visible: true, width: "140px" },
  { key: "exHqDaMetro", label: "EX HQ DA Metro", visible: true, width: "140px" },
  { key: "exHqDaNonMetro", label: "EX HQ DA Non Metro", visible: true, width: "150px" },
  { key: "upcountryMetro", label: "Upcountry Metro", visible: true, width: "130px" },
  { key: "upcountryNonMetro", label: "Upcountry Non Metro", visible: true, width: "150px" },
  { key: "lodgingBoarding", label: "Lodging & Boarding", visible: true, width: "160px" },
  { key: "status", label: "Status", visible: true, width: "100px" },
];

// ---------------- Main Component ----------------
export default function SalesPricePolicies() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<SalesPricePolicy[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<SalesPricePolicy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ---------------- Fetch Policies ----------------
  const fetchPolicies = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          page: pageNumber,
          limit: pageSize,
          search: search || undefined
        };

        let apiData = null;
        let apiError = null;

        try {
          // Try to call the API
          const response = await apiService.post<{
            policies: SalesPricePolicy[];
            total: number;
            page: number;
            totalPages: number;
          }>("/sales-policies/paginated", payload);

          apiData = response.data;
          apiError = response.error;
        } catch (err) {
          console.log("API call failed, using sample data");
          apiError = "Connection failed";
        }

        if (apiData && apiData.policies) {
          setFilteredData(apiData.policies);
          setTotalRecords(apiData.total);
        } else {
          // Fallback to sample data
          let filtered = [...samplePolicies];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.designation.name.toLowerCase().includes(lower) ||
                p.competencyRank.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);

          if (apiError) {
            setError("Using sample data - API connection unavailable");
          }
        }
      } catch (err) {
        console.error("Error fetching policies:", err);
        setError("Failed to load data. Using sample data.");

        // Final fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = samplePolicies.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(samplePolicies.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage, searchQuery]
  );

  useEffect(() => {
    fetchPolicies(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchPolicies]);

  // ---------------- Debounced Search ----------------
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchPolicies(1, rowsPerPage, query);
      }, 500);
    },
    [rowsPerPage, fetchPolicies]
  );

  // cleanup timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // ---------------- Action Handlers ----------------
  const handleDeleteClick = (policy: SalesPricePolicy) => {
    setPolicyToDelete(policy);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;
    setIsDeleting(true);

    try {
      // Try API call first
      let deleteError = null;
      try {
        const { error } = await apiService.delete(
          `/sales-policies/${policyToDelete.id}`
        );
        deleteError = error;
      } catch (err) {
        deleteError = "API connection failed";
      }

      if (deleteError) {
        console.error("Failed to delete policy:", deleteError);
        showToast("Failed to delete policy. Using local data.", "error");

        // Update local state anyway for demo purposes
        setFilteredData((prev) => prev.filter((p) => p.id !== policyToDelete.id));
        setTotalRecords((prev) => prev - 1);
      } else {
        setFilteredData((prev) => prev.filter((p) => p.id !== policyToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Sales policy deleted successfully", "success");
      }
    } catch (err) {
      console.error("Error deleting policy:", err);
      showToast("Error deleting policy", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setPolicyToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPolicyToDelete(null);
  };

  const handleEdit = (policy: SalesPricePolicy) => {
    navigate("/add-edit-sales-policy", {
      state: {
        policy: policy,
        isEditing: true
      }
    });
  };

  const handleNavigateToAddEdit = (policy?: SalesPricePolicy) => {
    navigate("/add-edit-sales-policy", {
      state: {
        policy: policy || null,
        isEditing: !!policy
      }
    });
  };

  const handleRefresh = () => {
    setPage(1);
    setSearchQuery("");
    fetchPolicies(1, rowsPerPage, "");
    showToast("Data refreshed", "info");
  };

  // ---------------- Derived Values ----------------
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  // ---------------- Render ----------------
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title="Sales Price Policies | Admin Portal"
        description="Manage sales price policies with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="Sales Price Policies"
          btnLabel="Add New Policy"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForSalesPricePolicies
            data={filteredData}
            columns={columnConfig}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            firstItem={firstItem}
            lastItem={lastItem}
            totalFiltered={totalRecords}
            totalRecords={totalRecords}
            totalPages={totalPages}
            showSrNo={true}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Sales Policy"
        message={
          policyToDelete ? (
            <span>
              Are you sure you want to delete the policy for{" "}
              <strong>{policyToDelete.designation.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this sales policy?"
          )
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />

      <CentralizedLoader
        isLoading={isDeleting}
        message="Deleting policy..."
      />
    </div>
  );
}