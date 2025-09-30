import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForAccountants from "./TableForAccountant";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Accountant } from "./accountantType";

// Sample data generator function
const generateSampleData = (): Accountant[] => {
  const employees = [
    { value: "john", label: "John Smith", EmpID: "EUM-1" },
    { value: "sarah", label: "Sarah Johnson", EmpID: "EUM-2" },
    { value: "mike", label: "Mike Williams", EmpID: "EUM-3" },
    { value: "lisa", label: "Lisa Brown", EmpID: "EUM-4" }
  ];

  const categories = ["All", "Sales", "Corporate"];
  const locationsData = [
    [{ unit: "Unit 1", zone: "North Zone", location: "Headquarters" }],
    [{ unit: "Unit 2", zone: "East Zone", location: "Regional Office" }],
    [{ unit: "Unit 3", zone: "Central Zone", location: "Central Hub" }],
    [{ unit: "Unit 1", zone: "South Zone", location: "Branch Office 1" }]
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const employee = employees[i % employees.length];
    const category = categories[i % categories.length];
    const locations = locationsData[i % locationsData.length].map((loc, idx) => ({
      id: i * 10 + idx,
      ...loc
    }));

    return {
      id: i + 1,
      user: {
        name: employee.label,
        email: `${employee.value}@company.com`,
        employeeId: employee.EmpID
      },
      selectedEmployee: employee.value,
      isAdmin: i % 4 === 0, // Every 4th is admin
      userName: employee.value,
      password: `Password${i + 1}!`,
      category: category,
      locations: locations,
    };
  });
};

// Sample accountant data for fallback
const sampleData = generateSampleData();

// Column config
const columnConfig = [
  { key: "user", label: "Accountant", visible: true, width: "0px" },
  { key: "userName", label: "Username", visible: true, width: "0px" },
  { key: "category", label: "Category", visible: true, width: "0px" },
  { key: "isAdmin", label: "Is Admin", visible: true, width: "0px" },
  { key: "locations", label: "Locations", visible: true, width: "0px" },
];

export default function AllAccountants() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Accountant[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountantToDelete, setAccountantToDelete] = useState<Accountant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch accountants with pagination payload
  const fetchAccountants = useCallback(async (
    pageNumber = page,
    pageSize = rowsPerPage,
    search = searchQuery
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        page: pageNumber,
        limit: pageSize,
        search: search
      };

      const { data, error: apiError } = await apiService.post<{
        accountants: Accountant[];
        total: number;
        page: number;
        totalPages: number;
      }>("/accountants/paginated", payload);

      if (data) {
        setFilteredData(data.accountants);
        setTotalRecords(data.total);
      } else if (apiError) {
        // Apply search filter to sample data
        let filteredSample = [...sampleData];

        // Apply search filter
        if (search) {
          const lower = search.toLowerCase();
          filteredSample = filteredSample.filter((item) =>
            Object.values(item).some((val) => {
              if (typeof val === "string") return val.toLowerCase().includes(lower);
              if (typeof val === "boolean") return val.toString().toLowerCase().includes(lower);
              if (typeof val === "object" && val !== null) {
                return Object.values(val).some(
                  (v) => typeof v === "string" && v.toLowerCase().includes(lower)
                );
              }
              return false;
            })
          );
        }

        // Apply pagination
        const startIndex = (pageNumber - 1) * pageSize;
        const paginatedSample = filteredSample.slice(startIndex, startIndex + pageSize);

        setFilteredData(paginatedSample);
        setTotalRecords(filteredSample.length);
      }
    } catch (err) {
      setError("Failed to fetch accountants");
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchAccountants(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchAccountants]);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer
    debounceTimer.current = setTimeout(() => {
      if (!query || query.trim() === "") {
        fetchAccountants(1, rowsPerPage, "");
      } else {
        fetchAccountants(1, rowsPerPage, query);
      }
    }, 699); //delay
  }, [rowsPerPage, fetchAccountants]);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // derived values
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  // Function to handle navigation to add/edit page
  const handleNavigateToAddEdit = (accountant?: Accountant) => {
    navigate("/add-edit-accountant", {
      state: {
        accountant: accountant || null,
        isEditing: !!accountant,
      }
    });
  };

  // Updated edit handler
  const handleEdit = (item: Accountant) => {
    handleNavigateToAddEdit(item);
  };

  // Modified delete handler
  const handleDeleteClick = (item: Accountant) => {
    setAccountantToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // New function to handle actual deletion
  const handleConfirmDelete = async () => {
    if (!accountantToDelete) return;

    setIsDeleting(true);
    setFilteredData(prev => prev.filter(acc => acc.id !== accountantToDelete.id));
    setTotalRecords(prev => prev - 1);
    showToast("Accountant deleted successfully", "success");

    try {
      // Call API to delete accountant
      const { error } = await apiService.delete(`/accountants/${accountantToDelete.id}`);

      if (error) {
        console.error('Failed to delete accountant:', error);
        //   fetchAccountants(page, rowsPerPage, searchQuery);
        // showToast("Failed to delete accountant", "error");
      } else {
        // Remove from local state on success
        setFilteredData(prev => prev.filter(acc => acc.id !== accountantToDelete.id));
        setTotalRecords(prev => prev - 1);
        showToast("Accountant deleted successfully", "success");

        // Refresh data if we're on the last page and it's now empty
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchAccountants(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchAccountants(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error('Error deleting accountant:', err);
      // showToast("Error deleting accountant", "error");
      //   fetchAccountants(page, rowsPerPage, searchQuery);

    } finally {
      setIsDeleteModalOpen(false);
      setAccountantToDelete(null);
      setIsDeleting(false);
    }
  };

  // New function to cancel deletion
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAccountantToDelete(null);
  };

  // Refresh data function
  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchAccountants(1, 10, "");
    showToast("Data refreshed", "info");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title="Accountants | Admin Portal"
        description="Manage accountants in the system"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Accountants"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      {/* Scrollable container for the table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForAccountants
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
            showSrNo
            showActions
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isLoading={false}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Accountant"
        message={
          accountantToDelete ? (
            <span>
              Are you sure you want to delete <strong>{accountantToDelete.user.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this accountant?"
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