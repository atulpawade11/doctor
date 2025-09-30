import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForProducts from "./TableForProducts";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Product } from "./productType";

// Sample data generator for products
const generateSampleProducts = (): Product[] => {
  return Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    name: `Product #${index + 1}`,
    description: `This is the description for product #${index + 1}. It's a high-quality product with excellent features.`,
    // imageUrl: `/sample-images/produuuct-jpg`,
    imageUrl: undefined,

  }));
};

// Sample data fallback
const sampleProducts = generateSampleProducts();

// Column config for table
const columnConfig = [
  { key: "imageUrl", label: "Image", visible: true, width: "100px" },
  { key: "name", label: "Product Name", visible: true, width: "200px" },
  { key: "description", label: "Description", visible: true, width: "300px" },
];

export default function Products() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch products with pagination + search
  const fetchProducts = useCallback(
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
          products: Product[];
          total: number;
          page: number;
          totalPages: number;
        }>("/products/paginated", payload);

        if (data) {
          setFilteredData(data.products);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleProducts];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((p) =>
              p.name.toLowerCase().includes(lower) ||
              p.description.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch products");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleProducts.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleProducts.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchProducts(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchProducts]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchProducts(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchProducts]
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
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((p) => p.id !== productToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Product deleted successfully", "success");

    try {

      const { error } = await apiService.delete(
        `/products/${productToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete product:", error);
        // showToast("Failed to delete product", "error");
        // Revert optimistic update if API call fails
        // fetchProducts(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Product deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchProducts(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchProducts(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      // showToast("Error deleting product", "error");
      // Revert optimistic update on error
      // fetchProducts(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (product?: Product) => {
    navigate("/add-edit-product", {
      state: {
        product: product || null,
        isEditing: !!product,
      },
    });
  };

  const handleEdit = (product: Product) => {
    handleNavigateToAddEdit(product);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchProducts(1, 10, "");
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
        title="Products | Admin Portal"
        description="Manage products with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Products"
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
          <TableForProducts
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
        title="Delete Product"
        message={
          productToDelete ? (
            <span>
              Are you sure you want to delete the product "{productToDelete.name}"?
            </span>
          ) : (
            "Are you sure you want to delete this product?"
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