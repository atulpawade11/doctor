import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForUnits from "./TableForUnits";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Unit } from "./unitType";

// Sample units
const sampleUnits: Unit[] = [
  "Piece", "Kilogram", "Gram", "Meter", "Centimeter", "Liter", "Milliliter",
  "Box", "Pack", "Bottle", "Carton", "Dozen", "Set", "Case", "Roll"
].map((title, index) => ({ id: index + 1, title }));

// Table config
const columnConfig = [{ key: "title", label: "Unit Title", visible: true }];

export default function Unit() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Unit[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchUnits = useCallback(
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
          units: Unit[];
          total: number;
          page: number;
          totalPages: number;
        }>("/units/paginated", payload);

        if (data) {
          setFilteredData(data.units);
          setTotalRecords(data.total);
        } else if (apiError) {
          let filtered = [...sampleUnits];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((u) => u.title.toLowerCase().includes(lower));
          }
          const startIndex = (pageNumber - 1) * pageSize;
          setFilteredData(filtered.slice(startIndex, startIndex + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch units");
        const startIndex = (pageNumber - 1) * pageSize;
        setFilteredData(sampleUnits.slice(startIndex, startIndex + pageSize));
        setTotalRecords(sampleUnits.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchUnits(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchUnits]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchUnits(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchUnits]
  );

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((u) => u.id !== unitToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Unit deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/unit/${unitToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete unit:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete unit", "error");
        // fetchUnits(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((u) => u.id !== unitToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Unit deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchUnits(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchUnits(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting unit:", err);
      // showToast("Error deleting unit", "error");
      // Revert optimistic update on error
      // fetchUnits(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setUnitToDelete(null);
      setIsDeleting(false);
    }
  };


  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUnitToDelete(null);
  };

  const handleNavigateToAddEdit = (unit?: Unit) => {
    navigate("/add-edit-unit", {
      state: {
        unit: unit || null,
        isEditing: !!unit,
      },
    });
  };

  const handleEdit = (unit: Unit) => {
    handleNavigateToAddEdit(unit);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchUnits(1, 10, "");
    showToast("Data refreshed", "info");
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Units | Admin Portal" description="Manage units with pagination and search" />

      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Units"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForUnits
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Unit"
        message={unitToDelete ? <>Are you sure you want to delete <strong>{unitToDelete.title}</strong>?</> : "Are you sure you want to delete this unit?"}
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />

      <CentralizedLoader isLoading={isDeleting || isLoading} message="Processing your request..." />
    </div>
  );
}
