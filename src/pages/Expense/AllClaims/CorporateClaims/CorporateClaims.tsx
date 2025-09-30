// CorporateClaims.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import PageMeta from "../../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForCorporateClaims from "./TableForCorporateClaims";
import CentralizedLoader from "../../../../components/common/CentralizedLoader";
import { apiService } from "../../../../services/apiService";
import { useToast } from "../../../../components/common/ToastProvider";
import type { CorporateClaim, ClaimStatus, Currency } from "./corporateClaimsType";
import ConfirmationModal from "../../../../components/ui/ConfirmationModal";

// Fallback sample generator
const generateSampleClaims = (): CorporateClaim[] => {
  const statuses: ClaimStatus[] = ["Pending", "Approved", "Rejected", "Processing"];
  const currencies: Currency[] = ["USD", "INR", "JPY"];


  return Array.from({ length: 80 }, (_, i) => ({
    id: i + 1,
    claimNumber: `CLM-${1000 + i}`,
    claimTitle: `Business Expense ${i + 1}`,
    employee: {
      id: i + 1,
      name: `Employee Employee ${i + 1}`,
      email: `employee${i + 1}@company.com`,
      department: ["Engineering", "HR", "Finance", "Marketing"][i % 4],
      designation: ["Manager", "Analyst", "Developer", "Specialist"][i % 4],
      region: ["North", "South", "East", "West"][i % 4],
      image: i % 5 === 0 ? `https://i.pravatar.cc/150?img=${(i % 70) + 1}` : undefined,
    },
    specialApproval: i % 4 === 0,
    submittedOn: new Date(Date.now() - i * 24 * 3600_000).toISOString(),
    claimAmount: 500 + i * 23.5,
    currency: currencies[i % 3],
    passedAmountSupervisor: 450 + i * 20,
    passedAmountAuditor: 440 + i * 19,
    deductionAmount: 50 + i * 3.5,
    status: statuses[i % 4],
  }));
};
const sampleClaims = generateSampleClaims();

const columnConfig = [
  { key: "claimNumber", label: "Claim", visible: true, width: "0px" },
  { key: "claimTitle", label: "Title", visible: true, width: "0px" },
  { key: "employee", label: "Employee", visible: true, width: "0px" },
  { key: "specialApproval", label: "Special Approval", visible: true, width: "0px" },
  { key: "submittedOn", label: "Submitted On", visible: true, width: "0px" },
  { key: "claimAmount", label: "Claim Amount", visible: true, width: "0px" },
  { key: "passedAmountSupervisor", label: "Supervisor Amount", visible: true, width: "0px" },
  { key: "passedAmountAuditor", label: "Auditor Amount", visible: true, width: "0px" },
  { key: "deductionAmount", label: "Deduction", visible: true, width: "0px" },
  { key: "status", label: "Status", visible: true, width: "0px" },
];

export default function CorporateClaims() {
  const { showToast } = useToast();

  const [data, setData] = useState<CorporateClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "All">("All");
  const [specialFilter, setSpecialFilter] = useState<"All" | "Yes" | "No">("All");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<CorporateClaim | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch claims
  const fetchClaims = useCallback(
    async (
      pageNumber = page,
      pageSize = rowsPerPage,
      search = searchQuery,
      status = statusFilter,
      special = specialFilter
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload: any = { page: pageNumber, limit: pageSize };
        if (search) payload.search = search;
        if (status !== "All") payload.status = status;
        if (special !== "All") payload.specialApproval = special === "Yes";

        const { data: responseData, error: apiError } = await apiService.post<{
          claims: CorporateClaim[];
          total: number;
        }>("/corporate-claims/paginated", payload);

        if (responseData) {
          setData(responseData.claims);
          setTotalRecords(responseData.total);
        } else if (apiError) {
          // fallback to sample + filters
          let filtered = [...sampleClaims];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(
              (d) =>
                d.claimNumber.toLowerCase().includes(lower) ||
                d.claimTitle.toLowerCase().includes(lower) ||
                d.employee.name.toLowerCase().includes(lower) ||
                d.employee.email.toLowerCase().includes(lower) ||
                d.employee.department.toLowerCase().includes(lower)
            );
          }
          if (status !== "All") filtered = filtered.filter((d) => d.status === status);
          if (special !== "All") filtered = filtered.filter((d) => d.specialApproval === (special === "Yes"));

          const start = (pageNumber - 1) * pageSize;
          setData(filtered.slice(start, start + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch {
        setError("Failed to fetch claims data");
        const start = (pageNumber - 1) * pageSize;
        setData(sampleClaims.slice(start, start + pageSize));
        setTotalRecords(sampleClaims.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage, searchQuery, statusFilter, specialFilter]
  );

  useEffect(() => {
    fetchClaims(page, rowsPerPage, searchQuery, statusFilter, specialFilter);
  }, [page, rowsPerPage, specialFilter, fetchClaims]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchClaims(1, rowsPerPage, query, statusFilter, specialFilter);
      }, 699);
    },
    [rowsPerPage, statusFilter, specialFilter, fetchClaims]
  );

  // cleanup timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Filters
  const handleStatusFilterChange = (status: ClaimStatus | "All") => {
    setStatusFilter(status);
    setPage(1);
    fetchClaims(1, rowsPerPage, searchQuery, status, specialFilter);
  };
  const handleSpecialFilterChange = (special: "All" | "Yes" | "No") => {
    setSpecialFilter(special);
    setPage(1);
    fetchClaims(1, rowsPerPage, searchQuery, statusFilter, special);
  };

  // Refresh
  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    setStatusFilter("All");
    setSpecialFilter("All");
    fetchClaims(1, 10, "", "All", "All");
    showToast("Data refreshed", "info");
  };
  // handlers to open modals
  const handleDeleteClick = (claim: CorporateClaim) => {
    setSelectedClaim(claim);
    setIsDeleteModalOpen(true);
  };

  const handleRestoreClick = (claim: CorporateClaim) => {
    setSelectedClaim(claim);
    setIsRestoreModalOpen(true);
  };
  // confirm deletion of a corporate claim
  const handleConfirmDelete = async () => {
    if (!selectedClaim) return; // safety check
    setIsProcessing(true); // show loader / disable buttons

    // optimistically remove claim from table data
    setData((prev) => prev.filter((c) => c.id !== selectedClaim.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Claim deleted successfully", "success");

    try {
      // API call to delete claim
      const { error } = await apiService.post("/corporate-claims/delete", { id: selectedClaim.id });

      if (error) {
        console.error("Failed to delete claim:", error);
        // fallback: refetch data from API or fallback sample
        // fetchClaims(page, rowsPerPage, searchQuery, statusFilter, specialFilter);
      } else {
        // confirm deletion locally again (redundant, ensures state consistency)
        setData((prev) => prev.filter((c) => c.id !== selectedClaim.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Claim deleted successfully", "success");

        // optional: handle last item on page
        // if (data.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchClaims(page - 1, rowsPerPage, searchQuery, statusFilter, specialFilter);
        // } else {
        //   fetchClaims(page, rowsPerPage, searchQuery, statusFilter, specialFilter);
        // }
      }
    } catch (err) {
      console.error("Error deleting claim:", err);
      // fallback or toast if needed
      // showToast("Error deleting claim", "error");
      // fetchClaims(page, rowsPerPage, searchQuery, statusFilter, specialFilter);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedClaim(null);
      setIsProcessing(false); // hide loader
    }
  };

  // confirm restoration of a corporate claim
  const handleConfirmRestore = async () => {
    if (!selectedClaim) return; // safety check
    setIsProcessing(true); // show loader / disable buttons

    // optimistically restore claim locally
    // insert restored claim at the beginning or appropriate position
    setData((prev) => [selectedClaim, ...prev]);
    setTotalRecords((prev) => prev + 1);
    showToast("Claim restored successfully", "success");

    try {
      // API call to restore claim
      const { error } = await apiService.post("/corporate-claims/restore", { id: selectedClaim.id });

      if (error) {
        console.error("Failed to restore claim:", error);
        // fallback: refetch data from API or fallback sample
        // fetchClaims(page, rowsPerPage, searchQuery, statusFilter, specialFilter);
      } else {
        // confirm restoration locally again (redundant, ensures state consistency)
        setData((prev) => [selectedClaim, ...prev]);
        setTotalRecords((prev) => prev + 1);
        showToast("Claim restored successfully", "success");

        // optional: handle pagination adjustments
        // fetchClaims(page, rowsPerPage, searchQuery, statusFilter, specialFilter);
      }
    } catch (err) {
      console.error("Error restoring claim:", err);
      // fallback or toast if needed
      // showToast("Error restoring claim", "error");
      // fetchClaims(page, rowsPerPage, searchQuery, statusFilter, specialFilter);
    } finally {
      setIsRestoreModalOpen(false);
      setSelectedClaim(null);
      setIsProcessing(false); // hide loader
    }
  };

  // Pagination derived
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Corporate Claims | Admin Portal" description="Corporate claims management" />

      <div className="flex-none">
        <PageBreadCrumbForTable onSearch={handleSearch} onRefresh={handleRefresh} error={error} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForCorporateClaims
            data={data}
            columns={columnConfig}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            firstItem={firstItem}
            lastItem={lastItem}
            totalRecords={totalRecords}
            totalFiltered={totalRecords}
            totalPages={totalPages}
            showSrNo={true}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            specialFilter={specialFilter}
            onSpecialFilterChange={handleSpecialFilterChange}
            onDeleteClick={handleDeleteClick}
            onRestoreClick={handleRestoreClick}
            isLoading={false}
          />
        </div>
      </div>

      <CentralizedLoader isLoading={isLoading || isProcessing} message="Processing your request..." />

      {/* Delete modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { if (!isProcessing) { setIsDeleteModalOpen(false); setSelectedClaim(null); } }}
        onConfirm={handleConfirmDelete}
        title="Delete Claim"
        message={
          selectedClaim ? (
            <span>
              Are you sure you want to delete <strong>{selectedClaim.claimNumber}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this claim?"
          )
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => { if (!isProcessing) { setIsRestoreModalOpen(false); setSelectedClaim(null); } }}
        onConfirm={handleConfirmRestore}
        title="Restore Claim"
        message={
          selectedClaim ? (
            <span>
              Are you sure you want to restore <strong>{selectedClaim.claimNumber}</strong>?
            </span>
          ) : (
            "Are you sure you want to restore this claim?"
          )
        }
        confirmText="Restore"
        cancelText="Cancel"
        variant="warning"
        isLoading={isProcessing}
      />

    </div>
  );
}
