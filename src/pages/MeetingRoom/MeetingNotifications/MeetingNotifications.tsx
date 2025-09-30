import { useState, useEffect, useCallback, useRef } from "react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForMeetingNotifications from "./TableForMeetingNotifications";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { MeetingNotification, SecretaryOption } from "./meetingNotificationType";
import { useNavigate } from "react-router-dom";

// ✅ Sample fallback generator
const generateSampleNotifications = (): MeetingNotification[] => {
  const secretaries: (SecretaryOption | null)[] = [
    { value: "secretary1", label: "Secretary A", EmpID: "EUM-1" },
    { value: "secretary2", label: "Secretary B", EmpID: "EUM-2" },
    { value: "secretary3", label: "Secretary C", EmpID: "EUM-3" },
  ];

  return Array.from({ length: 32 }, (_, i) => {
    const secretary = secretaries[i % secretaries.length];
    const mobileNo = String(9000000000 + i);
    const mobileNoAlternative = i % 3 === 0 ? null : String(9000001000 + i);

    return {
      id: i + 1,
      secretary,
      mobileNo,
      mobileNoAlternative,
    };
  });
};

const sampleNotifications = generateSampleNotifications();

const columnConfig = [
  { key: "secretary", label: "Notify To", visible: true, width: "220px" },
  { key: "mobileNo", label: "Mobile No", visible: true },
  { key: "mobileNoAlternative", label: "Mobile No (Alt)", visible: true },
];

export default function MeetingNotifications() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [data, setData] = useState<MeetingNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<MeetingNotification | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ fetch function
  const fetchNotifications = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = { page: pageNumber, limit: pageSize, search: search || undefined };
        const { data: respData, error: apiError } = await apiService.post<{
          notifications: MeetingNotification[];
          total: number;
        }>("/meeting-notifications/paginated", payload);

        if (respData) {
          setData(respData.notifications);
          setTotalRecords(respData.total);
        } else if (apiError) {
          throw new Error(String(apiError));
        }
      } catch {
        // fallback to sample data + search & paginate
        let filtered = [...sampleNotifications];
        if (search) {
          const lower = search.toLowerCase();
          filtered = filtered.filter((n) => {
            const secretaryName = n.secretary?.label?.toLowerCase() ?? "";
            return (
              secretaryName.includes(lower) ||
              n.mobileNo?.includes(lower) ||
              n.mobileNoAlternative?.includes(lower)
            );
          });
        }
        const start = (pageNumber - 1) * pageSize;
        setData(filtered.slice(start, start + pageSize));
        setTotalRecords(filtered.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchNotifications(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, searchQuery, fetchNotifications]);

  // ✅ debounce search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchNotifications(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchNotifications]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ✅ navigation handlers
  const goToAdd = () => navigate("/add-edit-meeting-notification");
  const goToEdit = (item: MeetingNotification) =>
    navigate("/add-edit-meeting-notification", { state: { notification: item, isEditing: true } });

  // ✅ delete handlers (optimistic)
  const handleDeleteClick = (item: MeetingNotification) => {
    setNotificationToDelete(item);
    setIsDeleteModalOpen(true);
  };



  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    setIsDeleting(true);

    setData((prev) => prev.filter((h) => h.id !== notificationToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Meeting notification deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/meeting-notification/${notificationToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete meeting notification:", error);
        // showToast("Failed to delete meeting notification", "error");
        // Revert optimistic update if API call fails
        // fetchNotifications(page, rowsPerPage, searchQuery);
      } else {
        setData((prev) => prev.filter((h) => h.id !== notificationToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("meeting notification deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchNotifications(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchNotifications(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting meeting notification:", err);
      // showToast("Error deleting meeting notification", "error");
      // Revert optimistic update on error
      // fetchNotifications(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setNotificationToDelete(null);
      setIsDeleting(false);
    }
  };


  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setNotificationToDelete(null);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchNotifications(1, 10, "");
    showToast("Data refreshed", "info");
  };

  // ✅ derived pagination
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Meeting Notifications | Admin Portal" description="Manage meeting notifications" />

      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="Meeting Notifications"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={goToAdd}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForMeetingNotifications
            data={data}
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
            onEdit={goToEdit}
            onDelete={handleDeleteClick}
            isLoading={false}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Notification"
        message={
          notificationToDelete ? (
            <span>
              Are you sure you want to delete notification for{" "}
              <strong>{notificationToDelete.secretary?.label ?? "--"}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this notification?"
          )
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />

      <CentralizedLoader isLoading={isDeleting || isLoading} message="Processing your request..." />
    </div>
  );
}
