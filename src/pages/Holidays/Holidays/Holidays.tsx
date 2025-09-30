import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForHolidays from "./TableForHolidays";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Holiday } from "./holidayType";

// Sample data generator for holidays
const generateSampleHolidays = (): Holiday[] => {
  const holidayTitles = [
    "New Year's Day", "Republic Day", "Holi", "Good Friday",
    "Eid al-Fitr", "Independence Day", "Janmashtami", "Gandhi Jayanti",
    "Dussehra", "Diwali", "Guru Nanak Jayanti", "Christmas Day",
    "Makar Sankranti", "Maha Shivaratri", "Ram Navami", "Mahavir Jayanti",
    "Buddha Purnima", "Bakrid", "Muharram", "Onam", "Pongal",
    "Raksha Bandhan", "Ganesh Chaturthi", "Navratri", "Durga Puja",
    "Easter Sunday", "Vishu", "Baisakhi", "Lohri", "Ugadi"
  ];

  return holidayTitles.map((title, index) => ({
    id: index + 1,
    title,
    date: new Date(Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
  }));
};

// Sample data fallback
const sampleHolidays = generateSampleHolidays();

// Column config for table
const columnConfig = [
  { key: "title", label: "Holiday Title", visible: true, width: "240px" },
  { key: "date", label: "Date", visible: true, width: "0px" },
];

export default function Holidays() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Holiday[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch holidays with pagination + search
  const fetchHolidays = useCallback(
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
          holidays: Holiday[];
          total: number;
          page: number;
          totalPages: number;
        }>("/holidays/paginated", payload);

        if (data) {
          setFilteredData(data.holidays);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleHolidays];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((h) =>
              h.title.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch holidays");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleHolidays.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleHolidays.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchHolidays(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchHolidays]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchHolidays(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchHolidays]
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
  const handleDeleteClick = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((h) => h.id !== holidayToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Holiday deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/holidays/${holidayToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete holiday:", error);
        // showToast("Failed to delete holiday", "error");
        // Revert optimistic update if API call fails
        // fetchHolidays(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((h) => h.id !== holidayToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Holiday deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchHolidays(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchHolidays(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting holiday:", err);
      showToast("Error deleting holiday", "error");
      // Revert optimistic update on error
      // fetchHolidays(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setHolidayToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setHolidayToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (holiday?: Holiday) => {
    navigate("/add-edit-holiday", {
      state: {
        holiday: holiday || null,
        isEditing: !!holiday,
      },
    });
  };

  const handleEdit = (holiday: Holiday) => {
    handleNavigateToAddEdit(holiday);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchHolidays(1, 10, "");
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
        title="Holidays | Admin Portal"
        description="Manage holidays with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Holidays"
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
          <TableForHolidays
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
        title="Delete Holiday"
        message={
          holidayToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{holidayToDelete.title}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this holiday?"
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