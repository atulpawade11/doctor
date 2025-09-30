import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForCurrencies from "./TableForCurrency";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Currency } from "./currencyType";

// Sample currencies
const sampleCurrencies: Currency[] = [
  { id: 1, currencyTitle: "USD", currencyValue: "1", currencyInr: "83.12" },
  { id: 2, currencyTitle: "EUR", currencyValue: "1", currencyInr: "90.45" },
  { id: 3, currencyTitle: "GBP", currencyValue: "1", currencyInr: "105.78" },
  { id: 4, currencyTitle: "JPY", currencyValue: "100", currencyInr: "56.23" },
  { id: 5, currencyTitle: "AUD", currencyValue: "1", currencyInr: "62.89" },
  { id: 6, currencyTitle: "CAD", currencyValue: "1", currencyInr: "68.34" },
  { id: 7, currencyTitle: "CHF", currencyValue: "1", currencyInr: "95.67" },
  { id: 8, currencyTitle: "CNY", currencyValue: "1", currencyInr: "11.45" },
  { id: 9, currencyTitle: "HKD", currencyValue: "1", currencyInr: "10.67" },
  { id: 10, currencyTitle: "NZD", currencyValue: "1", currencyInr: "58.91" },
  { id: 11, currencyTitle: "SGD", currencyValue: "1", currencyInr: "61.23" },
  { id: 12, currencyTitle: "KRW", currencyValue: "100", currencyInr: "6.78" },
  { id: 13, currencyTitle: "SEK", currencyValue: "1", currencyInr: "8.45" },
  { id: 14, currencyTitle: "NOK", currencyValue: "1", currencyInr: "8.91" },
  { id: 15, currencyTitle: "MXN", currencyValue: "1", currencyInr: "4.56" },
  { id: 16, currencyTitle: "INR", currencyValue: "1", currencyInr: "1.00" },
  { id: 17, currencyTitle: "BRL", currencyValue: "1", currencyInr: "16.78" },
  { id: 18, currencyTitle: "RUB", currencyValue: "1", currencyInr: "1.23" },
  { id: 19, currencyTitle: "ZAR", currencyValue: "1", currencyInr: "5.67" },
  { id: 20, currencyTitle: "TRY", currencyValue: "1", currencyInr: "4.89" },
  { id: 21, currencyTitle: "AED", currencyValue: "1", currencyInr: "22.63" },
  { id: 22, currencyTitle: "SAR", currencyValue: "1", currencyInr: "22.17" },
  { id: 23, currencyTitle: "THB", currencyValue: "1", currencyInr: "2.34" },
  { id: 24, currencyTitle: "MYR", currencyValue: "1", currencyInr: "17.89" },
  { id: 25, currencyTitle: "IDR", currencyValue: "1000", currencyInr: "5.67" },
  { id: 26, currencyTitle: "PHP", currencyValue: "1", currencyInr: "1.48" },
  { id: 27, currencyTitle: "VND", currencyValue: "1000", currencyInr: "3.45" },
  { id: 28, currencyTitle: "BDT", currencyValue: "1", currencyInr: "0.78" },
  { id: 29, currencyTitle: "PKR", currencyValue: "1", currencyInr: "0.34" },
  { id: 30, currencyTitle: "LKR", currencyValue: "1", currencyInr: "0.27" }
];

const columnConfig = [
  { key: "currencyTitle", label: "Currency Title", visible: true },
  { key: "currencyValue", label: "Currency Value", visible: true },
  { key: "currencyInr", label: "Currency INR", visible: true },
];

export default function CurrencyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Currency[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<Currency | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchCurrencies = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = { page: pageNumber, limit: pageSize, search: search || undefined };

        const { data, error: apiError } = await apiService.post<{
          currencies: Currency[];
          total: number;
        }>("/currencies/paginated", payload);

        if (data) {
          setFilteredData(data.currencies);
          setTotalRecords(data.total);
        } else if (apiError) {
          let filtered = [...sampleCurrencies];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((c) =>
              c.currencyTitle.toLowerCase().includes(lower)
            );
          }
          const startIndex = (pageNumber - 1) * pageSize;
          setFilteredData(filtered.slice(startIndex, startIndex + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch currencies");
        const startIndex = (pageNumber - 1) * pageSize;
        setFilteredData(sampleCurrencies.slice(startIndex, startIndex + pageSize));
        setTotalRecords(sampleCurrencies.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchCurrencies(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchCurrencies]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchCurrencies(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchCurrencies]
  );

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const handleDeleteClick = (currency: Currency) => {
    setCurrencyToDelete(currency);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currencyToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((c) => c.id !== currencyToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Currency deleted successfully", "success");

    try {
      const { error } = await apiService.delete(`/currency/${currencyToDelete.id}`);

      if (error) {
        console.error("Failed to delete currency:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete currency", "error");
        // fetchCurrencies(page, rowsPerPage, searchQuery);
      } else {
        // Ensure state is consistent after successful delete
        setFilteredData((prev) => prev.filter((c) => c.id !== currencyToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Currency deleted successfully", "success");

        // Optional: handle pagination edge cases
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchCurrencies(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchCurrencies(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting currency:", err);
      // showToast("Error deleting currency", "error");
      // fetchCurrencies(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setCurrencyToDelete(null);
      setIsDeleting(false);
    }
  };


  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCurrencyToDelete(null);
  };

  const handleNavigateToAddEdit = (currency?: Currency) => {
    navigate("/add-edit-currency", {
      state: { currency: currency || null, isEditing: !!currency },
    });
  };

  const handleEdit = (currency: Currency) => {
    handleNavigateToAddEdit(currency);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchCurrencies(1, 10, "");
    showToast("Data refreshed", "info");
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Currencies | Admin Portal" description="Manage currencies with pagination and search" />

      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Currencies"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForCurrencies
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
        title="Delete Currency"
        message={
          currencyToDelete ? (
            <>Are you sure you want to delete <strong>{currencyToDelete.currencyTitle}</strong>?</>
          ) : "Are you sure you want to delete this currency?"
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
