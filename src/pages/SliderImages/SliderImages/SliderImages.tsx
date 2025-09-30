import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForSliderImages from "./TableForSliderImages";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { SliderImages } from "./sliderImagesTypes";

// Sample data generator for photo galleries
const generateSampleGalleries = (): SliderImages[] => {
  return Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    title: `Gallery #${index + 1}`,
    multipleImages: Array.from({ length: index % 5 + 1 }, (_, imgIndex) =>
      `/sample-images/gallery-${index % 5}-${imgIndex + 1}.jpg`
    ),
  }));
};

// Sample data fallback
const sampleGalleries = generateSampleGalleries();

// Column config for table
const columnConfig = [
  { key: "title", label: "Title", visible: true, width: "0px" },
  { key: "multipleImages", label: "Additional Images", visible: true, width: "0px" },
];

export default function PhotoGallery() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<SliderImages[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<SliderImages | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch galleries with pagination + search
  const fetchGalleries = useCallback(
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
          galleries: SliderImages[];
          total: number;
          page: number;
          totalPages: number;
        }>("/photo-galleries/paginated", payload);

        if (data) {
          setFilteredData(data.galleries);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleGalleries];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((g) =>
              g.title.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch photo galleries");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleGalleries.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleGalleries.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchGalleries(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchGalleries]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchGalleries(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchGalleries]
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
  const handleDeleteClick = (gallery: SliderImages) => {
    setGalleryToDelete(gallery);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!galleryToDelete) return;
    setIsDeleting(true);


    // Optimistic UI update
    setFilteredData((prev) => prev.filter((g) => g.id !== galleryToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Slider image deleted successfully", "success");


    try {

      const { error } = await apiService.delete(
        `/photo-galleries/${galleryToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete slider image:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete slider image", "error");
        // fetchGalleries(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((g) => g.id !== galleryToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Slider image deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchGalleries(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchGalleries(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting slider image:", err);
      // showToast("Error deleting slider image", "error");
      // Revert optimistic update on error
      // fetchGalleries(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setGalleryToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setGalleryToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (gallery?: SliderImages) => {
    navigate("/add-edit-slider-image", {
      state: {
        gallery: gallery || null,
        isEditing: !!gallery,
      },
    });
  };

  const handleEdit = (gallery: SliderImages) => {
    handleNavigateToAddEdit(gallery);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchGalleries(1, 10, "");
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
        title="Slider Images | Admin Portal"
        description="Manage slider images with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Slider Images"
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
          <TableForSliderImages
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
        title="Delete Slider Image"
        message={
          galleryToDelete ? (
            <span>
              Are you sure you want to delete the slider image
              {" "}
              <strong>{galleryToDelete.title}</strong>
              ?

            </span>
          ) : (
            "Are you sure you want to delete this slider image?"
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