import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForPriorities from "./TableForPriority";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Priority } from "./priorityType";

// Sample data fallback
const samplePriorities: Priority[] = [
  { id: 1, name: "Critical", description: "System down, requires immediate attention", limitHour: 1 },
  { id: 2, name: "High", description: "Tasks with highest urgency", limitHour: 2 },
  { id: 3, name: "Urgent", description: "Important tasks to be resolved quickly", limitHour: 4 },
  { id: 4, name: "Medium", description: "Important but not urgent tasks", limitHour: 8 },
  { id: 5, name: "Low", description: "Least urgent tasks", limitHour: 24 },
  { id: 6, name: "Very Low", description: "Tasks that can be delayed safely", limitHour: 48 },
  { id: 7, name: "Non-Essential", description: "Tasks without strict deadlines", limitHour: 72 },
  { id: 8, name: "Backlog", description: "Can be picked when time permits", limitHour: 168 },
  { id: 9, name: "SLA Critical", description: "Breaches SLA if delayed", limitHour: 3 },
  { id: 10, name: "SLA High", description: "Close to SLA breach", limitHour: 6 },
  { id: 11, name: "SLA Medium", description: "Within acceptable SLA limits", limitHour: 12 },
  { id: 12, name: "SLA Low", description: "Well within SLA buffer time", limitHour: 36 },
  { id: 13, name: "Daily", description: "Tasks to be completed by end of the day", limitHour: 24 },
  { id: 14, name: "Weekly", description: "Tasks to be finished within a week", limitHour: 168 },
  { id: 15, name: "Monthly", description: "Tasks with monthly deadlines", limitHour: 720 },
  { id: 16, name: "Quarterly", description: "Tasks with quarterly deadlines", limitHour: 2160 },
  { id: 17, name: "Yearly", description: "Annual reviews or reports", limitHour: 8760 },
  { id: 18, name: "Immediate", description: "Requires action right now", limitHour: 0 },
  { id: 19, name: "Next Hour", description: "Should be addressed within the next hour", limitHour: 1 },
  { id: 20, name: "Today", description: "Must be completed today", limitHour: 12 },
  { id: 21, name: "Tomorrow", description: "Tasks due by tomorrow", limitHour: 36 },
  { id: 22, name: "Next Week", description: "Due within a week", limitHour: 168 },
  { id: 23, name: "Future", description: "Planned for long-term execution", limitHour: 2000 },
  { id: 24, name: "Optional", description: "Nice-to-have but not mandatory", limitHour: 3000 },
];


const columnConfig = [
  { key: "name", label: "Priority Name", visible: true, width: "0px" },
  { key: "description", label: "Priority Description", visible: true, width: "0px" },
  { key: "limitHour", label: "Limit Hour", visible: true, width: "0px" },

];

export default function Priority() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Priority[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [priorityToDelete, setPriorityToDelete] = useState<Priority | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchPriorities = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = { page: pageNumber, limit: pageSize, search: search || undefined };
        const { data, error: apiError } = await apiService.post<{
          priorities: Priority[];
          total: number;
        }>("/priorities/paginated", payload);

        if (data) {
          setFilteredData(data.priorities);
          setTotalRecords(data.total);
        } else if (apiError) {
          let filtered = [...samplePriorities];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.name.toLowerCase().includes(lower) ||
                p.description.toLowerCase().includes(lower) ||
                p.limitHour.toString().includes(lower)
            );
          }
          const startIndex = (pageNumber - 1) * pageSize;
          setFilteredData(filtered.slice(startIndex, startIndex + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch {
        setError("Failed to fetch priorities");
        setFilteredData(samplePriorities);
        setTotalRecords(samplePriorities.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchPriorities(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchPriorities]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchPriorities(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchPriorities]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleDeleteClick = (priority: Priority) => {
    setPriorityToDelete(priority);
    setIsDeleteModalOpen(true);
  };




  const handleConfirmDelete = async () => {
    if (!priorityToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((p) => p.id !== priorityToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Priority deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/priorities/${priorityToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete quote:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete priority", "error");
        // fetchPriorities(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((p) => p.id !== priorityToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Priority deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchPriorities(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchPriorities(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting quote:", err);
      // showToast("Error deleting priority", "error");
      // Revert optimistic update on error
      // fetchPriorities(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setPriorityToDelete(null);
      setIsDeleting(false);
    }
  };


  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPriorityToDelete(null);
  };

  const handleNavigateToAddEdit = (priority?: Priority) => {
    navigate("/add-edit-priority", {
      state: { priority: priority || null, isEditing: !!priority },
    });
  };

  const handleEdit = (priority: Priority) => {
    handleNavigateToAddEdit(priority);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchPriorities(1, 10, "");
    showToast("Data refreshed", "info");
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Priorities | Admin Portal" description="Manage priorities with pagination and search" />

      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Priorities"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForPriorities
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Priority"
        message={
          priorityToDelete ? (
            <span>
              Are you sure you want to delete the priority <strong>{priorityToDelete.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this priority?"
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
