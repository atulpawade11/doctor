import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForDesignations from "./TableForDesignations";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Designation, DepartmentCategory } from "./designationType";

// ---------------- Sample Data Generator ----------------
const generateSampleDesignations = (): Designation[] => {
  const designationNames = [
    "Software Engineer", "Product Manager", "UX Designer", "Data Scientist", "Marketing Specialist",
    "Sales Executive", "HR Manager", "Finance Analyst", "Operations Coordinator",
    "Customer Support Agent", "Quality Assurance Tester", "Business Analyst", "Legal Advisor",
    "Administrative Assistant", "Logistics Manager", "Procurement Specialist", "Training Coordinator",
    "Public Relations Specialist", "Business Development Manager", "Content Creator",
    "Data Analyst", "Security Specialist", "Infrastructure Engineer", "Mobile Developer",
    "Web Developer", "Cloud Engineer", "Database Administrator",
    "Network Engineer", "Technical Writer", "UI/UX Designer"
  ];

  // Define departments with categories
  const departments: { name: string; category: DepartmentCategory }[] = [
    { name: "Engineering", category: "Corporate" },
    { name: "Marketing", category: "Corporate" },
    { name: "HR", category: "Corporate" },
    { name: "Finance", category: "Corporate" },
    { name: "Sales", category: "Sales" },
    { name: "Operations", category: "Corporate" },
    { name: "IT", category: "Corporate" }
  ];

  return designationNames.map((name, index) => {
    const dept = departments[index % departments.length];
    return {
      id: index + 1,
      name,
      department: dept.name,
      category: dept.category
    };
  });
};

// Sample data fallback
const sampleDesignations = generateSampleDesignations();

// ---------------- Column Config ----------------
const columnConfig = [
  { key: "name", label: "Designation Name", visible: true, width: "240px" },
  { key: "category", label: "Department Category", visible: true, width: "160px" },
  { key: "department", label: "Department", visible: true, width: "180px" }
];

// ---------------- Main Component ----------------
export default function Designations() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Designation[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState<Designation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ---------------- Fetch Designations ----------------
  const fetchDesignations = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = {
          page: pageNumber,
          limit: pageSize,
          search: search || undefined
        };

        const { data, error: apiError } = await apiService.post<{
          designations: Designation[];
          total: number;
          page: number;
          totalPages: number;
        }>("/designations/paginated", payload);

        if (data) {
          setFilteredData(data.designations);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleDesignations];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(
              (d) =>
                d.name.toLowerCase().includes(lower) ||
                d.department.toLowerCase().includes(lower) ||
                d.category.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch designations");

        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleDesignations.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleDesignations.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage, searchQuery]
  );

  useEffect(() => {
    fetchDesignations(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchDesignations]);

  // ---------------- Debounced Search ----------------
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchDesignations(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchDesignations]
  );

  // cleanup timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // ---------------- Delete Handlers ----------------
  const handleDeleteClick = (designation: Designation) => {
    setDesignationToDelete(designation);
    setIsDeleteModalOpen(true);
  };



  const handleConfirmDelete = async () => {
    if (!designationToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((d) => d.id !== designationToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Designation deleted successfully", "success");


    try {

      const { error } = await apiService.delete(
        `/designations/${designationToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete designation:", error);
        // showToast("Failed to delete designation", "error");
        // Revert optimistic update if API call fails
        // fetchDesignations(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((d) => d.id !== designationToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Designation deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchDesignations(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchDesignations(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting designation:", err);
      showToast("Error deleting designation", "error");
      // Revert optimistic update on error
      // fetchDesignations(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setDesignationToDelete(null);
      setIsDeleting(false);
    }
  };


  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDesignationToDelete(null);
  };

  // ---------------- Navigation ----------------
  const handleNavigateToAddEdit = (designation?: Designation) => {
    navigate("/add-edit-designation", {
      state: {
        designation: designation || null,
        isEditing: !!designation
      }
    });
  };

  const handleEdit = (designation: Designation) => {
    handleNavigateToAddEdit(designation);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchDesignations(1, 10, "");
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
        title="Designations | Admin Portal"
        description="Manage designations with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Designations"
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
          <TableForDesignations
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
             isLoading={false}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Designation"
        message={
          designationToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{designationToDelete.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this designation?"
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
