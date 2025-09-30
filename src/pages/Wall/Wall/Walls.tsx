import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForWalls from "./TableForWalls";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Wall } from "./wallType";

// Sample data generator for walls
const generateSampleWalls = (): Wall[] => {
  const employeeNames = ["John Smith", "Sarah Johnson", "Mike Williams", "Lisa Brown", "David Wilson"];
  const fileTypes = ['pdf', 'png', 'jpg', 'jpeg', 'svg', 'mp4', undefined] as const;

  return Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    description: `Wall content #${index + 1} with rich text, images, and formatting`,
    addedByEmployee: employeeNames[index % employeeNames.length],
    fileUrl: index % 3 === 0 ? `/files/sample-file-${index + 1}.${fileTypes[index % fileTypes.length]}` : undefined,
    fileName: index % 3 === 0 ? `file-${index + 1}.${fileTypes[index % fileTypes.length]}` : undefined,
  }));
};

// Sample data fallback
const sampleWalls = generateSampleWalls();

// Column config for table
const columnConfig = [
  { key: "description", label: "Wall Description", visible: true, width: "0px" },
  { key: "addedByEmployee", label: "Added By", visible: true, width: "0px" },
  { key: "fileName", label: "File Name", visible: true, width: "0px" },
  { key: "file", label: "File", visible: true, width: "0px" },
];


export default function Walls() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Wall[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [wallToDelete, setWallToDelete] = useState<Wall | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch walls with pagination + search
  const fetchWalls = useCallback(
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
          walls: Wall[];
          total: number;
          page: number;
          totalPages: number;
        }>("/walls/paginated", payload);

        if (data) {
          setFilteredData(data.walls);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleWalls];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((w) =>
              w.description.toLowerCase().includes(lower) ||
              w.addedByEmployee.toLowerCase().includes(lower) ||
              (w.fileName && w.fileName.toLowerCase().includes(lower))
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch walls");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleWalls.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleWalls.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchWalls(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchWalls]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchWalls(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchWalls]
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
  const handleDeleteClick = (wall: Wall) => {
    setWallToDelete(wall);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!wallToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((w) => w.id !== wallToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Wall deleted successfully", "success");

    try {
      const { error } = await apiService.delete(`/walls/${wallToDelete.id}`);

      if (error) {
        console.error("Failed to delete wall:", error);
        // showToast("Failed to delete wall", "error");
        // fetchWalls(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((w) => w.id !== wallToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Wall deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchWalls(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchWalls(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting wall:", err);
      // showToast("Error deleting wall", "error");
      // fetchWalls(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setWallToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setWallToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (wall?: Wall) => {
    navigate("/add-edit-wall", {
      state: {
        wall: wall || null,
        isEditing: !!wall,
      },
    });
  };

  const handleEdit = (wall: Wall) => {
    handleNavigateToAddEdit(wall);
  };

  const handleViewFile = (wall: Wall) => {
    if (wall.fileUrl) {
      window.open(wall.fileUrl, '_blank');
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchWalls(1, 10, "");
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
        title="Walls | Admin Portal"
        description="Manage walls with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Walls"
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
          <TableForWalls
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
            onViewFile={handleViewFile}
            isLoading={false}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Wall"
        message={
          wallToDelete ? (
            <span>
              Are you sure you want to delete this wall content?
            </span>
          ) : (
            "Are you sure you want to delete this wall?"
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