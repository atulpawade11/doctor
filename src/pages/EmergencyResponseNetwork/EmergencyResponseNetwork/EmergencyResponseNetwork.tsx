import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForEmergencyResponseNetwork from "./TableForEmergencyResponseNetwork";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { EmergencyResponseNetwork } from "./emergencyResponseNetworkType";

// Sample data generator for 30 ERNs
const generateSampleERNs = (): EmergencyResponseNetwork[] => {
  const titles = [
    "Code of Conduct", "Data Protection", "Remote Work", "Leave", "Expense Reimbursement",
    "IT Security", "Anti-Harassment", "Social Media", "Health and Safety", "Dress Code",
    "Recruitment", "Performance Review", "Travel", "Confidentiality Agreement", "Whistleblower",
    "Email Usage", "Bring Your Own Device", "Overtime", "Grievance", "Training and Development",
    "Internet Usage", "Equal Opportunity", "Substance Abuse", "Environmental", "Flexible Working",
    "Disciplinary", "Retention", "Supplier Code of Conduct", "Gift", "Conflict of Interest"
  ];

  return titles.map((title, index) => ({
    id: index + 1,
    title,
    fileUrl: `/ern/sample-ern-${index + 1}.pdf`,
    fileName: `ern-${index + 1}.pdf`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString()
  }));
};

const sampleERNs = generateSampleERNs();

const columnConfig = [
  { key: "title", label: "ERN Title", visible: true, width: "0px" },
  { key: "fileName", label: "File Name", visible: true, width: "0px" },
  { key: "createdAt", label: "Created At", visible: true, width: "0px" },
  { key: "actions", label: "PDF", visible: true, width: "0px" },
];

export default function AllERNPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<EmergencyResponseNetwork[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ernToDelete, setErnToDelete] = useState<EmergencyResponseNetwork | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchERNs = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = { page: pageNumber, limit: pageSize, search: search || undefined };
        const { data, error: apiError } = await apiService.post<{ erns: EmergencyResponseNetwork[], total: number }>("/erns/paginated", payload);

        if (data) {
          setFilteredData(data.erns);
          setTotalRecords(data.total);
        } else if (apiError) {
          let filtered = [...sampleERNs];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(p => p.title.toLowerCase().includes(lower) || p.fileName.toLowerCase().includes(lower));
          }
          const startIndex = (pageNumber - 1) * pageSize;
          setFilteredData(filtered.slice(startIndex, startIndex + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch ERNs");
        const startIndex = (pageNumber - 1) * pageSize;
        setFilteredData(sampleERNs.slice(startIndex, startIndex + pageSize));
        setTotalRecords(sampleERNs.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage, searchQuery]
  );

  useEffect(() => {
    fetchERNs(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchERNs]);
  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchERNs(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchERNs]
  );

  // cleanup timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleDeleteClick = (ern: EmergencyResponseNetwork) => {
    setErnToDelete(ern);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ernToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((m) => m.id !== ernToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("ERN deleted successfully", "success");

    try {


      const { error } = await apiService.delete(
        `/erns/${ernToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete ERN:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete ERN", "error");
        // fetchERNs(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((m) => m.id !== ernToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("ERN deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchERNs(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchERNs(page, rowsPerPage, searchQuery);
        // }

      }
    } catch (err) {
      console.error("Error deleting ERN:", err);
      // showToast("Error deleting ERN", "error");
      // Revert optimistic update on error
      // fetchERNs(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setErnToDelete(null);
      setIsDeleting(false);
    }
  };


  const handleCancelDelete = () => { setIsDeleteModalOpen(false); setErnToDelete(null); };
  const handleNavigateToAddEdit = (ern?: EmergencyResponseNetwork) => {
    navigate("/add-edit-emergency-response-network", { state: { ern: ern || null, isEditing: !!ern } });
  };
  const handleEdit = (ern: EmergencyResponseNetwork) => { handleNavigateToAddEdit(ern); };
  const handleViewPdf = (ern: EmergencyResponseNetwork) => { window.open(ern.fileUrl, "_blank"); };
  const handleRefresh = () => { setPage(1); setRowsPerPage(10); setTotalRecords(0); setSearchQuery(""); fetchERNs(1, 10, ""); showToast("Data refreshed", "info"); };

  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Emergency Response Network | Admin Portal" description="Manage ERNs with pagination and search" />
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Emergency Response Network"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForEmergencyResponseNetwork
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
            onViewPdf={handleViewPdf}
             isLoading={false}
          />
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete ERN"
        message={ernToDelete ? <span>Are you sure you want to delete <strong>{ernToDelete.title}</strong>?</span> : "Are you sure you want to delete this ERN?"}
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />
      <CentralizedLoader isLoading={isDeleting || isLoading} message="Processing your request..." />
    </div>
  );
}
