import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForAuditors from "./TableForAuditors";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Auditor } from "./auditorType";

// Sample data generator function
const generateSampleData = (): Auditor[] => {
  const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Jennifer"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  const categories = ["Corporate", "Sales"];
  const units = ["Unit 1", "Unit 2", "Unit 3"];
  const zones = ["North Zone", "South Zone", "East Zone", "West Zone"];
  const locations = ["Headquarters", "Branch Office 1", "Branch Office 2", "Remote"];

  return Array.from({ length: 50 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`;

    return {
      id: i + 1,
      user: {
        // image: `/images/user/auditor.jpg`,
        image: ``,
        name: fullName,
        email: email,
      },
      firstName,
      lastName,
      mobileNo: `555${100 + (i % 900)}${1000 + (i % 9000)}`,
      email,
      password: `Password${i + 1}!`,
      category: categories[i % categories.length],
      unit: units[i % units.length],
      zone: zones[i % zones.length],
      location: locations[i % locations.length],
    };
  });
};

// Sample auditor data for fallback
const sampleData = generateSampleData();

// Column config
const columnConfig = [
  { key: "user", label: "Auditor Name", visible: true, width: "0px" },
  { key: "email", label: "Email", visible: true, width: "0px" },
  { key: "mobileNo", label: "Mobile No", visible: true, width: "0px" },
  { key: "category", label: "Category", visible: true, width: "0px" },
  // { key: "unit", label: "Unit", visible: true, width: "0px" },
  { key: "zone", label: "Zone", visible: true, width: "0px" },
  // { key: "location", label: "Location", visible: true, width: "0px" },
];

export default function AllAuditors() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Auditor[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [auditorToDelete, setAuditorToDelete] = useState<Auditor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch auditors with pagination payload
  const fetchAuditors = useCallback(async (
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
        auditors: Auditor[];
        total: number;
        page: number;
        totalPages: number;
      }>("/auditors/paginated", payload);

      if (data) {
        setFilteredData(data.auditors);
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
      setError("Failed to fetch auditors");
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchAuditors(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchAuditors]);

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
        fetchAuditors(1, rowsPerPage, "");
      } else {
        fetchAuditors(1, rowsPerPage, query);
      }
    }, 699); //delay
  }, [rowsPerPage, fetchAuditors]);

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
  const handleNavigateToAddEdit = (auditor?: Auditor) => {
    navigate("/add-edit-auditor", {
      state: {
        auditor: auditor || null,
        isEditing: !!auditor,
      }
    });
  };

  // Updated edit handler
  const handleEdit = (item: Auditor) => {
    handleNavigateToAddEdit(item);
  };

  // Modified delete handler
  const handleDeleteClick = (item: Auditor) => {
    setAuditorToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // New function to handle actual deletion
  const handleConfirmDelete = async () => {
    if (!auditorToDelete) return;

    setIsDeleting(true);

    setFilteredData(prev => prev.filter(aud => aud.id !== auditorToDelete.id));
    setTotalRecords(prev => prev - 1);
    showToast("Auditor deleted successfully", "success");


    try {
      // Call API to delete auditor
      const { error } = await apiService.delete(`/auditors/${auditorToDelete.id}`);

      if (error) {
        console.error('Failed to delete auditor:', error);
        // showToast("Failed to delete auditor", "error");
        //   fetchAuditors(page - 1, rowsPerPage, searchQuery);

      } else {
        // Remove from local state on success
        setFilteredData(prev => prev.filter(aud => aud.id !== auditorToDelete.id));
        setTotalRecords(prev => prev - 1);
        showToast("Auditor deleted successfully", "success");

        // Refresh data if we're on the last page and it's now empty
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchAuditors(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchAuditors(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error('Error deleting auditor:', err);
      // showToast("Error deleting auditor", "error");
      //   fetchAuditors(page - 1, rowsPerPage, searchQuery);

    } finally {
      setIsDeleteModalOpen(false);
      setAuditorToDelete(null);
      setIsDeleting(false);
    }
  };

  // New function to cancel deletion
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAuditorToDelete(null);
  };

  // Refresh data function
  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchAuditors(1, 10, "");
    showToast("Data refreshed", "info");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title="Auditors | Mann Ka Doctor Admin Portal"
        description="Manage auditors in the system"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Auditors"
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
          <TableForAuditors
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

      {/* Confirmation Modal with Bluish Background */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Auditor"
        message={
          auditorToDelete ? (
            <span>
              Are you sure you want to delete <strong>{auditorToDelete.user.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this auditor?"
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