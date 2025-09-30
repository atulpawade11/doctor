import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForFloors from "./TableForFloors";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Floor } from "./floorType";

// Sample data generator for 30 floors
const generateSampleFloors = (): Floor[] => {
  const floorNames = [
    "Ground Floor", "First Floor", "Second Floor", "Third Floor", "Fourth Floor",
    "Fifth Floor", "Sixth Floor", "Seventh Floor", "Eighth Floor", "Ninth Floor",
    "Tenth Floor", "Basement Level 1", "Basement Level 2", "Mezzanine", "Penthouse",
    "Roof Level", "Lower Ground", "Upper Ground", "Level 1", "Level 2",
    "Level 3", "Level 4", "Level 5", "Level 6", "Level 7",
    "Level 8", "Level 9", "Level 10", "Sub-basement", "Tower Level"
  ];

  const locations = ["New York Office", "London Branch", "Tokyo Center", "Paris Facility", "Berlin Site", "Sydney Office", "Toronto Branch"];

  return floorNames.map((name, index) => ({
    id: index + 1,
    name,
    location: locations[index % locations.length]
  }));
};

// Sample data fallback
const sampleFloors = generateSampleFloors();

// Column config for table
const columnConfig = [
  { key: "name", label: "Floor Name", visible: true, width: "200px" },
  { key: "location", label: "Location", visible: true, width: "200px" },
];

export default function Floors() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Floor[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<Floor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch floors with pagination + search
  const fetchFloors = useCallback(
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
          floors: Floor[];
          total: number;
          page: number;
          totalPages: number;
        }>("/floors/paginated", payload);

        if (data) {
          setFilteredData(data.floors);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleFloors];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((f) =>
              f.name.toLowerCase().includes(lower) ||
              f.location.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch floors");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleFloors.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleFloors.length);
        console.log("Using sample data due to error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchFloors(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchFloors]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchFloors(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchFloors]
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
  const handleDeleteClick = (floor: Floor) => {
    setFloorToDelete(floor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!floorToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((f) => f.id !== floorToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Floor deleted successfully", "success");

    try {
      const { error } = await apiService.delete(`/floors/${floorToDelete.id}`);

      if (error) {
        console.error("Failed to delete floor:", error);
        // showToast("Failed to delete floor", "error");
        // fetchFloors(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((f) => f.id !== floorToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Floor deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchFloors(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchFloors(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting floor:", err);
      // showToast("Error deleting floor", "error");
      // fetchFloors(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setFloorToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFloorToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (floor?: Floor) => {
    navigate("/add-edit-floor", {
      state: {
        floor: floor || null,
        isEditing: !!floor,
      },
    });
  };

  const handleEdit = (floor: Floor) => {
    handleNavigateToAddEdit(floor);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchFloors(1, 10, "");
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
        title="Floors | Admin Portal"
        description="Manage floors with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Floors"
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
          <TableForFloors
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
        title="Delete Floor"
        message={
          floorToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{floorToDelete.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this floor?"
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