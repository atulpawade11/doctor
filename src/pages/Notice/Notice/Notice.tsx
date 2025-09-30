import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForNotice from "./TableForNotice";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Notice } from "./noticeType";

// Sample data generator for notices
const generateSampleNotices = (): Notice[] => {
  const roles: ("Administrator" | "User")[] = ["Administrator", "User"];

  return Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    title: `Notice #${index + 1}`,
    description: `This is the description for notice #${index + 1} with important information.`,
    role: roles[index % roles.length],
    date: new Date(Date.now() - index * 86400000).toISOString().split('T')[0],
    imageUrl: index % 4 === 0 ? `/sample-images/notice-${index % 5}.jpg` : undefined,
  }));
};

// Sample data fallback
const sampleNotices = generateSampleNotices();

// Column config for table
const columnConfig = [
  { key: "title", label: "Title", visible: true, width: "200px" },
  { key: "description", label: "Description", visible: true, width: "300px" },
  { key: "role", label: "Role", visible: true, width: "120px" },
  { key: "date", label: "Date", visible: true, width: "120px" },
];

export default function Notices() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Notice[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch notices with pagination + search
  const fetchNotices = useCallback(
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
          notices: Notice[];
          total: number;
          page: number;
          totalPages: number;
        }>("/notices/paginated", payload);

        if (data) {
          setFilteredData(data.notices);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleNotices];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((n) =>
              n.title.toLowerCase().includes(lower) ||
              n.description.toLowerCase().includes(lower) ||
              n.role.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch notices");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleNotices.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleNotices.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchNotices(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchNotices]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchNotices(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchNotices]
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
  const handleDeleteClick = (notice: Notice) => {
    setNoticeToDelete(notice);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;
    setIsDeleting(true);

    try {
      // Optimistic UI update
      setFilteredData((prev) => prev.filter((n) => n.id !== noticeToDelete.id));
      setTotalRecords((prev) => prev - 1);
      showToast("Notice deleted successfully", "success");


      const { error } = await apiService.delete(
        `/notices/${noticeToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete notice:", error);
        // Revert optimistic update if API call fails
        // fetchNotices(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((n) => n.id !== noticeToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Notice deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchNotices(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchNotices(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting notice:", err);
      showToast("Error deleting notice", "error");
      // Revert optimistic update on error
      // fetchNotices(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setNoticeToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setNoticeToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (notice?: Notice) => {
    navigate("/add-edit-notice", {
      state: {
        notice: notice || null,
        isEditing: !!notice,
      },
    });
  };

  const handleEdit = (notice: Notice) => {
    handleNavigateToAddEdit(notice);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchNotices(1, 10, "");
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
        title="Notices | Admin Portal"
        description="Manage notices with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Notices"
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
          <TableForNotice
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
        title="Delete Notice"
        message={
          noticeToDelete ? (
            <span>
              Are you sure you want to delete the notice   {" "}
              <strong>{noticeToDelete.title}</strong>
              ?
            </span>
          ) : (
            "Are you sure you want to delete this notice?"
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