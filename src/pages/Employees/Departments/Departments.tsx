import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForDepartments from "./TableForDepartments";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Department, DepartmentCategory } from "./departmentType";

// Sample data generator for 30 departments
const generateSampleDepartments = (): Department[] => {
  const departmentNames = [
    "Engineering", "Marketing", "Human Resources", "Finance", "Sales",
    "Operations", "Research & Development", "Customer Support", "IT",
    "Quality Assurance", "Product Management", "Design", "Legal",
    "Administration", "Logistics", "Procurement", "Training",
    "Public Relations", "Business Development", "Content Creation",
    "Data Analytics", "Security", "Infrastructure", "Mobile Development",
    "Web Development", "Cloud Services", "Database Administration",
    "Network Engineering", "Technical Writing", "UI/UX Design"
  ];

  const categories: DepartmentCategory[] = ["Corporate", "Sales"];

  return departmentNames.map((name, index) => ({
    id: index + 1,
    name,
    category: categories[index % categories.length]
  }));
};

// Sample data fallback
const sampleDepartments = generateSampleDepartments();

// Column config for table
const columnConfig = [
  { key: "name", label: "Department Name", visible: true, width: "0px" },
  { key: "category", label: "Department Category", visible: true, width: "0px" },
];

export default function Departments() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Department[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch departments with pagination + search
  const fetchDepartments = useCallback(
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
          departments: Department[];
          total: number;
          page: number;
          totalPages: number;
        }>("/departments/paginated", payload);

        if (data) {
          setFilteredData(data.departments);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleDepartments];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((d) =>
              d.name.toLowerCase().includes(lower) ||
              d.category.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch departments");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleDepartments.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleDepartments.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchDepartments(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchDepartments]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchDepartments(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchDepartments]
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
  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((d) => d.id !== departmentToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Department deleted successfully", "success");

    try {
      const { error } = await apiService.delete(`/departments/${departmentToDelete.id}`);

      if (error) {
        console.error("Failed to delete department:", error);
        // showToast("Failed to delete department", "error");
        // fetchDepartments(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((d) => d.id !== departmentToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Department deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchDepartments(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchDepartments(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting department:", err);
      // showToast("Error deleting department", "error");
      // fetchDepartments(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setDepartmentToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDepartmentToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (department?: Department) => {
    navigate("/add-edit-department", {
      state: {
        department: department || null,
        isEditing: !!department,
      },
    });
  };

  const handleEdit = (department: Department) => {
    handleNavigateToAddEdit(department);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchDepartments(1, 10, "");
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
        title="Departments | Admin Portal"
        description="Manage departments with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Departments"
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
          <TableForDepartments
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
        title="Delete Department"
        message={
          departmentToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{departmentToDelete.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this department?"
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