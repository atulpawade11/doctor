// Zone.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForZone from "./TableForZone";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Zone, Unit } from "./zoneType";

// Sample data generator for zones
const generateSampleZones = (): Zone[] => {
  const zoneNames = [
    "North Zone", "South Zone", "East Zone", "West Zone", "Central Zone",
    "Metro Zone", "Coastal Zone", "Mountain Zone", "Urban Zone", "Rural Zone",
    "Industrial Zone", "Commercial Zone", "Residential Zone", "Special Zone",
    "Free Trade Zone", "Development Zone", "Export Zone", "Import Zone"
  ];

  const units: Unit[] = [
    { id: 1, name: "Unit A" },
    { id: 2, name: "Unit B" },
    { id: 3, name: "Unit C" },
    { id: 4, name: "Unit D" },
  ];

  return zoneNames.map((name, index) => ({
    id: index + 1,
    name,
    unitId: units[index % units.length].id,
    unitName: units[index % units.length].name
  }));
};

// Sample data fallback
const sampleZones = generateSampleZones();

// Column config for table
const columnConfig = [
  { key: "name", label: "Zone Name", visible: true },
  { key: "unitName", label: "Unit", visible: true },
];

export default function Zone() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Zone[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch zones with pagination + search
  const fetchZones = useCallback(
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
          zones: Zone[];
          total: number;
          page: number;
          totalPages: number;
        }>("/zones/paginated", payload);

        if (data) {
          setFilteredData(data.zones);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleZones];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((z) =>
              z.name.toLowerCase().includes(lower) ||
              z.unitName.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch zones");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleZones.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleZones.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchZones(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchZones]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchZones(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchZones]
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
  const handleDeleteClick = (zone: Zone) => {
    setZoneToDelete(zone);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!zoneToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((z) => z.id !== zoneToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Zone deleted successfully", "success");


    try {
      const { error } = await apiService.delete(`/zones/${zoneToDelete.id}`);

      if (error) {
        console.error("Failed to delete zone:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete zone", "error");
        // fetchZones(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((z) => z.id !== zoneToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Zone deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchZones(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchZones(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting zone:", err);
      // showToast("Error deleting zone", "error");
      // Revert optimistic update on error
      // fetchZones(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setZoneToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setZoneToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (zone?: Zone) => {
    navigate("/add-edit-zone", {
      state: {
        zone: zone || null,
        isEditing: !!zone,
      },
    });
  };

  const handleEdit = (zone: Zone) => {
    handleNavigateToAddEdit(zone);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchZones(1, 10, "");
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
        title="Zones | Admin Portal"
        description="Manage zones with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Zones"
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
          <TableForZone
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
        title="Delete Zone"
        message={
          zoneToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <strong>{zoneToDelete.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this zone?"
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