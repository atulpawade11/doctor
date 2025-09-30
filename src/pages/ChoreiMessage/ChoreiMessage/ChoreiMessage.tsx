import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForChoreiMessage from "./TableForChoreiMessage";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { ChoreiMessage } from "./choreiMessageType";

// Sample data generator for chorei messages
const generateSampleChoreiMessages = (): ChoreiMessage[] => {
  const messageTitles = [
    "Monthly Newsletter - January", "Weekly Update - Week 1", "Important Announcement",
    "Quarterly Report Q1", "Special Edition Newsletter", "Holiday Greetings",
    "Annual Report Summary", "Event Invitation", "Policy Update Notice",
    "Welcome Message", "Seasonal Greeting", "Emergency Notification",
    "Product Launch Announcement", "Service Update", "Community News",
    "Leadership Message", "Volunteer Opportunities", "Fundraising Update",
    "Educational Content", "Inspirational Message", "Membership News",
    "Event Recap", "Upcoming Programs", "Thank You Message",
    "Success Stories", "Testimonials", "Behind the Scenes",
    "Historical Perspective", "Future Vision", "Cultural Celebration"
  ];

  return messageTitles.map((title, index) => ({
    id: index + 1,
    title,
    fileUrl: `/chorei-messages/sample-message-${index + 1}.pdf`,
    fileName: `chorei-message-${index + 1}.pdf`,
  }));
};

// Sample data fallback
const sampleChoreiMessages = generateSampleChoreiMessages();

// Column config for table
const columnConfig = [
  { key: "title", label: "Chorei Message Title", visible: true, width: "240px" },
  { key: "fileName", label: "File Name", visible: true, width: "180px" },
  { key: "actions", label: "PDF", visible: true, width: "80px" },
];

export default function ChoreiMessages() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<ChoreiMessage[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ChoreiMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch chorei messages with pagination + search
  const fetchChoreiMessages = useCallback(
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
          messages: ChoreiMessage[];
          total: number;
          page: number;
          totalPages: number;
        }>("/chorei-messages/paginated", payload);

        if (data) {
          setFilteredData(data.messages);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleChoreiMessages];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((m) =>
              m.title.toLowerCase().includes(lower) ||
              m.fileName.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch chorei messages");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleChoreiMessages.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleChoreiMessages.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchChoreiMessages(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchChoreiMessages]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchChoreiMessages(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchChoreiMessages]
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
  const handleDeleteClick = (message: ChoreiMessage) => {
    setMessageToDelete(message);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((m) => m.id !== messageToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Chorei message deleted successfully", "success");

    try {


      const { error } = await apiService.delete(
        `/chorei-messages/${messageToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete chorei message:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete chorei message", "error");
        // fetchChoreiMessages(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((m) => m.id !== messageToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Chorei message deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchChoreiMessages(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchChoreiMessages(page, rowsPerPage, searchQuery);
        // }

      }
    } catch (err) {
      console.error("Error deleting chorei message:", err);
      // showToast("Error deleting chorei message", "error");
      // Revert optimistic update on error
      // fetchChoreiMessages(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMessageToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (message?: ChoreiMessage) => {
    navigate("/add-edit-chorei-message", {
      state: {
        message: message || null,
        isEditing: !!message,
      },
    });
  };

  const handleEdit = (message: ChoreiMessage) => {
    handleNavigateToAddEdit(message);
  };

  const handleViewPdf = (message: ChoreiMessage) => {
    window.open(message.fileUrl, '_blank');
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchChoreiMessages(1, 10, "");
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
        title="Chorei Messages | Admin Portal"
        description="Manage chorei messages with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Chorei Messages"
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
          <TableForChoreiMessage
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
        title="Delete Chorei Message"
        message={
          messageToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{messageToDelete.title}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this chorei message?"
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