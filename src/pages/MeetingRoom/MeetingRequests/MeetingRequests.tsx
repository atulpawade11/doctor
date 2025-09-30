import { useState, useEffect, useCallback, useRef } from "react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForMeetingRequests from "./TableForMeetingRequests";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { MeetingRequest } from "./meetingRequestType";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

// Sample fallback data
const generateSampleMeetingRequests = (): MeetingRequest[] => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    userName: `User ${i + 1}`,
    department: ["Engineering", "HR", "Finance", "Marketing"][i % 4],
    location: ["HQ", "Remote", "Branch A", "Branch B"][i % 4],
    meetingRoom: ["Room 101", "Room 202", "Room 303", "Room 404"][i % 4],
    timings: new Date(Date.now() + i * 3600_000).toISOString(),
    status: i % 2 === 0 ? "Approved" : "Disapproved",
  }));
};
const sampleMeetingRequests = generateSampleMeetingRequests();

// Column config
const columnConfig = [
  { key: "userName", label: "User Name", visible: true },
  { key: "department", label: "Department", visible: true },
  { key: "location", label: "Location", visible: true },
  { key: "meetingRoom", label: "Meeting Room", visible: true },
  { key: "timings", label: "Timings", visible: true },
  { key: "status", label: "Status", visible: true },
];

export default function MeetingRequests() {
  const { showToast } = useToast();

  const [data, setData] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // fetch meeting requests
  const fetchMeetingRequests = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = { page: pageNumber, limit: pageSize, search: search || undefined };
        const { data: respData, error: apiError } = await apiService.post<{
          meetingRequests: MeetingRequest[];
          total: number;
        }>("/meeting-requests/paginated", payload);

        if (respData) {
          setData(respData.meetingRequests);
          setTotalRecords(respData.total);
        } else if (apiError) {
          throw new Error(apiError);
        }
      } catch (err) {
        // fallback to sample filtered data
        let filtered = [...sampleMeetingRequests];
        if (search) {
          const lower = search.toLowerCase();
          filtered = filtered.filter(
            (d) =>
              d.userName.toLowerCase().includes(lower) ||
              d.department.toLowerCase().includes(lower) ||
              d.location.toLowerCase().includes(lower) ||
              d.meetingRoom.toLowerCase().includes(lower)
          );
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
    fetchMeetingRequests(page, rowsPerPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, fetchMeetingRequests]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchMeetingRequests(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchMeetingRequests]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Refresh
  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchMeetingRequests(1, 10, "");
    showToast("Data refreshed", "info");
  };

  // Actions
  const handleActionClick = (request: MeetingRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedRequest) return;
    setIsUpdating(true);

    try {
      const newStatus =
        selectedRequest.status === "Approved" ? "Disapproved" : "Approved";



      // Optimistic update
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedRequest.id ? { ...item, status: newStatus } : item
        )
      );
      showToast(`Status changed to ${newStatus}`, "success");


      // API call to update status
      const { error } = await apiService.patch(`/meeting-requests/${selectedRequest.id}/status`, {
        status: newStatus,
      });

      if (error) {
        // revert on error
        // setData((prev) =>
        //   prev.map((item) =>
        //     item.id === selectedRequest.id
        //       ? { ...item, status: selectedRequest.status }
        //       : item
        //   )
        // );
        // showToast("Failed to update status", "error");
      } else {


        setData((prev) =>
          prev.map((item) =>
            item.id === selectedRequest.id ? { ...item, status: newStatus } : item
          )
        );
        showToast(`Status changed to ${newStatus}`, "success");

        // optional: re-fetch for consistency
        // fetchMeetingRequests(page, rowsPerPage, searchQuery);
      }
    } catch (err) {
      // revert on exception
      // setData((prev) =>
      //   prev.map((item) =>
      //     item.id === selectedRequest.id
      //       ? { ...item, status: selectedRequest.status }
      //       : item
      //   )
      // );
      // showToast("Error while updating status", "error");
    } finally {
      setIsUpdating(false);
      setIsModalOpen(false);
      setSelectedRequest(null);
    }
  };


  // derived values
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Meeting Requests | Admin Portal" description="Manage meeting requests" />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Meeting Requests"
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForMeetingRequests
            data={data}
            columns={columnConfig}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(p) => setPage(p)}
            onRowsPerPageChange={(n) => setRowsPerPage(n)}
            firstItem={firstItem}
            lastItem={lastItem}
            totalRecords={totalRecords}
            totalFiltered={totalRecords}
            totalPages={totalPages}
            showSrNo={true}
            isLoading={false}
            onActionClick={handleActionClick}
          />
        </div>
      </div>

      <CentralizedLoader isLoading={isLoading || isUpdating} message="Processing your request..." />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmStatusChange}
        title={
          selectedRequest
            ? `${selectedRequest.status === "Approved" ? "Disapprove" : "Approve"} Request`
            : "Change Status"
        }
        message={
          selectedRequest ? (
            <span>
              Are you sure you want to{" "}
              <strong>
                {selectedRequest.status === "Approved" ? "disapprove" : "approve"}
              </strong>{" "}
              the meeting request for <strong>{selectedRequest.userName}</strong> in{" "}
              <strong>{selectedRequest.meetingRoom}</strong>?
            </span>
          ) : (
            "Are you sure you want to change the status?"
          )
        }
        confirmText={selectedRequest?.status === "Approved" ? "Disapprove" : "Approve"}
        cancelText="Cancel"
        variant={selectedRequest?.status === "Approved" ? "danger" : "warning"}
        isLoading={isUpdating}
      />
    </div>
  );
}
