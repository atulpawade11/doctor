import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForLocations from "./TableForLocations";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Location } from "./LocationType";

// Sample data generator for 30 locations
const generateSampleLocations = (): Location[] => {
  const locationNames = [
    "New York Office", "London Branch", "Tokyo Center", "Paris Facility", "Berlin Site",
    "Sydney Office", "Toronto Branch", "Singapore Center", "Dubai Facility", "Mumbai Site",
    "San Francisco Office", "Chicago Branch", "Boston Center", "Austin Facility", "Seattle Site",
    "Los Angeles Office", "Miami Branch", "Atlanta Center", "Dallas Facility", "Denver Site",
    "Hong Kong Office", "Shanghai Branch", "Beijing Center", "Seoul Facility", "Bangkok Site",
    "Amsterdam Office", "Brussels Branch", "Zurich Center", "Stockholm Facility", "Oslo Site"
  ];

  return locationNames.map((name, index) => ({
    id: index + 1,
    name,
  }));
};

// Sample data fallback
const sampleLocations = generateSampleLocations();

// Column config for table
const columnConfig = [
  { key: "name", label: "Location Name", visible: true, width: "240px" },
];

export default function Locations() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Location[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch locations with pagination + search
  const fetchLocations = useCallback(
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
          locations: Location[];
          total: number;
          page: number;
          totalPages: number;
        }>("/locations/paginated", payload);

        if (data) {
          setFilteredData(data.locations);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleLocations];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((l) =>
              l.name.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch locations");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleLocations.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleLocations.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchLocations(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchLocations]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchLocations(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchLocations]
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
  const handleDeleteClick = (location: Location) => {
    setLocationToDelete(location);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((l) => l.id !== locationToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Location deleted successfully", "success");

    try {
      const { error } = await apiService.delete(`/locations/${locationToDelete.id}`);

      if (error) {
        console.error("Failed to delete location:", error);
        showToast("Failed to delete location", "error");
        fetchLocations(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((l) => l.id !== locationToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Location deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchLocations(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchLocations(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting location:", err);
      // showToast("Error deleting location", "error");
      // fetchLocations(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setLocationToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setLocationToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (location?: Location) => {
    navigate("/add-edit-location", {
      state: {
        location: location || null,
        isEditing: !!location,
      },
    });
  };

  const handleEdit = (location: Location) => {
    handleNavigateToAddEdit(location);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchLocations(1, 10, "");
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
        title="Locations | Admin Portal"
        description="Manage locations with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Locations"
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
          <TableForLocations
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
        title="Delete Location"
        message={
          locationToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{locationToDelete.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this location?"
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