import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForCategories from "./TableForCategories";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Category } from "./categoryType";

// Sample data generator for categories
const generateSampleCategories = (): Category[] => {
  const categoryNames = [
    "Technology", "Business", "Science", "Health", "Education",
    "Entertainment", "Sports", "Travel", "Food", "Lifestyle",
    "Finance", "Art & Culture", "Politics", "Environment", "Fashion",
    "Automotive", "Real Estate", "Gaming", "Music", "Photography",
    "Books", "Movies", "TV Shows", "Web Development", "Mobile Apps",
    "Artificial Intelligence", "Machine Learning", "Data Science", "Cloud Computing", "Cybersecurity"
  ];

  const descriptions = [
    "Latest technological innovations and trends",
    "Business strategies and market insights",
    "Scientific discoveries and research",
    "Health tips and medical advancements",
    "Educational resources and learning methods",
    "Entertainment news and celebrity updates",
    "Sports events and athlete profiles",
    "Travel destinations and tips",
    "Recipes and culinary experiences",
    "Lifestyle trends and personal development",
    "Financial advice and investment strategies",
    "Art exhibitions and cultural events",
    "Political news and analysis",
    "Environmental issues and sustainability",
    "Fashion trends and style guides",
    "Automotive reviews and news",
    "Real estate market insights",
    "Gaming news and reviews",
    "Music releases and artist news",
    "Photography techniques and gear",
    "Book reviews and recommendations",
    "Movie reviews and trailers",
    "TV show updates and reviews",
    "Web development tutorials and frameworks",
    "Mobile app development and trends",
    "AI research and applications",
    "Machine learning algorithms and models",
    "Data analysis and visualization",
    "Cloud services and infrastructure",
    "Cybersecurity threats and protection"
  ];

  return categoryNames.map((name, index) => ({
    id: index + 1,
    name,
    description: descriptions[index % descriptions.length],
  }));
};

// Sample data fallback
const sampleCategories = generateSampleCategories();

// Column config for table
const columnConfig = [
  { key: "name", label: "Category Name", visible: true, width: "200px" },
  { key: "description", label: "Category Description", visible: true, width: "300px" },
];

export default function Category() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Category[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch categories with pagination + search
  const fetchCategories = useCallback(
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
          categories: Category[];
          total: number;
          page: number;
          totalPages: number;
        }>("/categories/paginated", payload);

        if (data) {
          setFilteredData(data.categories);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleCategories];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((c) =>
              c.name.toLowerCase().includes(lower) ||
              c.description.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch categories");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleCategories.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleCategories.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchCategories(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchCategories]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchCategories(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchCategories]
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
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Category deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/categories/${categoryToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete category:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete category", "error");
        // fetchCategories(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Category deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchCategories(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchCategories(page, rowsPerPage, searchQuery);
        // }

      }
    } catch (err) {
      console.error("Error deleting category:", err);
      // showToast("Error deleting category", "error");
      // Revert optimistic update on error
      // fetchCategories(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (category?: Category) => {
    navigate("/add-edit-category", {
      state: {
        category: category || null,
        isEditing: !!category,
      },
    });
  };

  const handleEdit = (category: Category) => {
    handleNavigateToAddEdit(category);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchCategories(1, 10, "");
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
        title="Categories | Admin Portal"
        description="Manage categories with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Categories"
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
          <TableForCategories
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
        title="Delete Category"
        message={
          categoryToDelete ? (
            <span>
              Are you sure you want to delete the category
              {" "}
              <strong>
                {categoryToDelete.name}
              </strong>
              ?
            </span>
          ) : (
            "Are you sure you want to delete this category?"
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