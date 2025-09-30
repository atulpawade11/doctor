import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForPopupImage from "./TableForPopupImages";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { PopupImage, PopupImageType, PopupImageShowType } from "./popupImagesType";

// Sample data generator for popup images
const generateSamplePopupImages = (): PopupImage[] => {
  const types: PopupImageType[] = ["Home", "Wall"];
  const showTypes: PopupImageShowType[] = ["One time", "Recurring"];

  return Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    imageUrl: `https://picsum.photos/400/300?random=${index + 1}`,
    popupImageType: types[index % types.length],
    popupImageShowType: showTypes[index % showTypes.length],
  }));
};

// Sample data fallback
const samplePopupImages = generateSamplePopupImages();

// Column config for table
const columnConfig = [
  { key: "imageUrl", label: "Image", visible: true, width: "0px" },
  { key: "popupImageType", label: "Popup Type", visible: true, width: "0px" },
  { key: "popupImageShowType", label: "Show Type", visible: true, width: "0px" },
];

export default function PopupImages() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<PopupImage[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [popupImageToDelete, setPopupImageToDelete] = useState<PopupImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch popup images with pagination + search
  const fetchPopupImages = useCallback(
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
          popupImages: PopupImage[];
          total: number;
          page: number;
          totalPages: number;
        }>("/popup-images/paginated", payload);

        if (data) {
          setFilteredData(data.popupImages);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...samplePopupImages];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((img) =>
              img.popupImageType.toLowerCase().includes(lower) ||
              img.popupImageShowType.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch popup images");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = samplePopupImages.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(samplePopupImages.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchPopupImages(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchPopupImages]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchPopupImages(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchPopupImages]
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
  const handleDeleteClick = (popupImage: PopupImage) => {
    setPopupImageToDelete(popupImage);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!popupImageToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((img) => img.id !== popupImageToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Popup image deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/popup-images/${popupImageToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete popup image:", error);
        // showToast("Failed to delete popup image", "error");
        // fetchPopupImages(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((img) => img.id !== popupImageToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Popup image deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchPopupImages(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchPopupImages(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting popup image:", err);
      // showToast("Error deleting popup image", "error");
      // fetchPopupImages(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setPopupImageToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPopupImageToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (popupImage?: PopupImage) => {
    navigate("/add-edit-popup-image", {
      state: {
        popupImage: popupImage || null,
        isEditing: !!popupImage,
      },
    });
  };

  const handleEdit = (popupImage: PopupImage) => {
    handleNavigateToAddEdit(popupImage);
  };

  const handleRefresh = () => {
    setPage(1);
    setSearchQuery("");
    fetchPopupImages(1, rowsPerPage, "");
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
        title="Popup Images | Admin Portal"
        description="Manage popup images with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Popup Images"
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
          <TableForPopupImage
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
        title="Delete Popup Image"
        message={
          popupImageToDelete ? (
            <span>
              Are you sure you want to delete this popup image?
            </span>
          ) : (
            "Are you sure you want to delete this popup image?"
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