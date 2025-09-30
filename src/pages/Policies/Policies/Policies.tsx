import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForPolicies from "./TableForPolicies";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Policy } from "./policiesType";

// Sample data generator for 30 policies
const generateSamplePolicies = (): Policy[] => {
  const policyTitles = [
    "Code of Conduct", "Data Protection Policy", "Remote Work Policy",
    "Leave Policy", "Expense Reimbursement Policy", "IT Security Policy",
    "Anti-Harassment Policy", "Social Media Policy", "Health and Safety Policy",
    "Dress Code Policy", "Recruitment Policy", "Performance Review Policy",
    "Travel Policy", "Confidentiality Agreement", "Whistleblower Policy",
    "Email Usage Policy", "Bring Your Own Device Policy", "Overtime Policy",
    "Grievance Policy", "Training and Development Policy", "Internet Usage Policy",
    "Equal Opportunity Policy", "Substance Abuse Policy", "Environmental Policy",
    "Flexible Working Policy", "Disciplinary Policy", "Retention Policy",
    "Supplier Code of Conduct", "Gift Policy", "Conflict of Interest Policy"
  ];

  return policyTitles.map((title, index) => ({
    id: index + 1,
    title,
    fileUrl: `/policies/sample-policy-${index + 1}.pdf`,
    fileName: `policy-${index + 1}.pdf`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString()
  }));
};

// Sample data fallback
const samplePolicies = generateSamplePolicies();

// Column config for table
const columnConfig = [
  { key: "title", label: "Policy Title", visible: true, width: "0px" },
  { key: "fileName", label: "File Name", visible: true, width: "0px" },
  { key: "createdAt", label: "Created At", visible: true, width: "0px" },
  { key: "actions", label: "PDF", visible: true, width: "0px" },
];

export default function Policies() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Policy[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch policies with pagination + search
  const fetchPolicies = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          page: pageNumber,
          limit: pageSize,
          search: search || undefined,
        };

        const { data, error: apiError } = await apiService.post<{
          policies: Policy[];
          total: number;
          page: number;
          totalPages: number;
        }>("/policies/paginated", payload);

        if (data) {
          setFilteredData(data.policies);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...samplePolicies];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((p) =>
              p.title.toLowerCase().includes(lower) ||
              p.fileName.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch policies");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = samplePolicies.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(samplePolicies.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchPolicies(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchPolicies]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchPolicies(1, rowsPerPage, query);
      }, 699);
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

  // Delete handlers
  const handleDeleteClick = (policy: Policy) => {
    setPolicyToDelete(policy);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((p) => p.id !== policyToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Policy deleted successfully", "success");


    try {
      const { error } = await apiService.delete(
        `/policies/${policyToDelete.id}`
      );


      if (error) {
        console.error("Failed to delete policy:", error);
        // showToast("Failed to delete policy", "error");
        // Revert optimistic update if API call fails
        // fetchPolicies(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((p) => p.id !== policyToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Policy deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchPolicies(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchPolicies(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting policy:", err);
      showToast("Error deleting policy", "error");
      // Revert optimistic update on error
      // fetchPolicies(page, rowsPerPage, searchQuery);
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

  // Navigation to add/edit
  const handleNavigateToAddEdit = (policy?: Policy) => {
    navigate("/add-edit-policy", {
      state: {
        policy: policy || null,
        isEditing: !!policy,
      },
    });
  };

  const handleEdit = (policy: Policy) => {
    handleNavigateToAddEdit(policy);
  };

  const handleViewPdf = (policy: Policy) => {
    window.open(policy.fileUrl, '_blank');
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchPolicies(1, 10, "");
    showToast("Data refreshed", "info");
  };

  // derived values
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title="Policies | Admin Portal"
        description="Manage policies with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Policies"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForPolicies
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
            onViewPdf={handleViewPdf}
            isLoading={false}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Policy"
        message={
          policyToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{policyToDelete.title}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this policy?"
          )
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />

      <CentralizedLoader
        isLoading={isDeleting || isLoading}
        message="Processing your request..."
      />
    </div>
  );
}