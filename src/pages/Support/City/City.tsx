import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForCities from "./TableForCity";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { City } from "./cityType";

// Sample cities
const sampleCities: City[] = [
  "New York", "London", "Paris", "Tokyo", "Berlin", "Sydney", "Toronto", "Dubai",
  "Singapore", "Hong Kong", "Barcelona", "Rome", "Chicago", "Los Angeles", "San Francisco",
  "Delhi", "Mumbai", "Bangalore", "Shanghai", "Beijing", "Moscow", "Cape Town", "Rio de Janeiro",
  "Mexico City", "Istanbul", "Seoul", "Bangkok", "Kuala Lumpur", "Jakarta", "Amsterdam"
].map((name, index) => ({ id: index + 1, name }));

// Table config
const columnConfig = [
  { key: "name", label: "City Name", visible: true, width: "0px" },
];

export default function City() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<City[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchCities = useCallback(
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
          cities: City[];
          total: number;
          page: number;
          totalPages: number;
        }>("/cities/paginated", payload);

        if (data) {
          setFilteredData(data.cities);
          setTotalRecords(data.total);
        } else if (apiError) {
          let filtered = [...sampleCities];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((c) => c.name.toLowerCase().includes(lower));
          }
          const startIndex = (pageNumber - 1) * pageSize;
          setFilteredData(filtered.slice(startIndex, startIndex + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch cities");
        const startIndex = (pageNumber - 1) * pageSize;
        setFilteredData(sampleCities.slice(startIndex, startIndex + pageSize));
        setTotalRecords(sampleCities.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchCities(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchCities]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchCities(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchCities]
  );

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const handleDeleteClick = (city: City) => {
    setCityToDelete(city);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cityToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((c) => c.id !== cityToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("City deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/city/${cityToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete quote:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete city", "error");
        // fetchCities(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((c) => c.id !== cityToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("City deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchCities(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchCities(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting city:", err);
      // showToast("Error deleting city", "error");
      // Revert optimistic update on error
      // fetchCities(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setCityToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCityToDelete(null);
  };

  const handleNavigateToAddEdit = (city?: City) => {
    navigate("/add-edit-city", {
      state: {
        city: city || null,
        isEditing: !!city,
      },
    });
  };

  const handleEdit = (city: City) => {
    handleNavigateToAddEdit(city);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchCities(1, 10, "");
    showToast("Data refreshed", "info");
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Cities | Admin Portal" description="Manage cities with pagination and search" />

      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Cities"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForCities
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
        title="Delete City"
        message={cityToDelete ? <>Are you sure you want to delete <strong>{cityToDelete.name}</strong>?</> : "Are you sure you want to delete this city?"}
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />

      <CentralizedLoader isLoading={isDeleting || isLoading} message="Processing your request..." />
    </div>
  );
}
