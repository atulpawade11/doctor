import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForQuoteOfTheDay from "./TableForQuoteOfTheDay";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { QuoteOfTheDay } from "./QuoteOfTheDayType";

// Sample data generator for quotes
const generateSampleQuotes = (): QuoteOfTheDay[] => {
  const quoteTitles = [
    "Motivational Monday", "Thoughtful Tuesday", "Wisdom Wednesday",
    "Thankful Thursday", "Freedom Friday", "Success Saturday", "Serene Sunday",
    "Inspirational Insight", "Positive Perspective", "Growth Mindset",
    "Leadership Lesson", "Teamwork Triumph", "Innovation Idea", "Excellence Example",
    "Courage Corner", "Resilience Reminder", "Gratitude Guidance", "Focus Formula",
    "Balance Boost", "Wellness Wisdom", "Productivity Proverb", "Creativity Catalyst",
    "Strategy Suggestion", "Vision Value", "Mission Moment", "Purpose Pointer",
    "Passion Prompt", "Determination Drive", "Achievement Advice", "Success Strategy"
  ];

  const descriptions = [
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "Your time is limited, so don't waste it living someone else's life.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you've ever wanted is on the other side of fear.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "The way to get started is to quit talking and begin doing.",
    "If you are working on something that you really care about, you don't have to be pushed.",
    "Innovation distinguishes between a leader and a follower.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "Life is what happens when you're busy making other plans.",
    "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    "When you reach the end of your rope, tie a knot in it and hang on.",
    "Always remember that you are absolutely unique. Just like everyone else.",
    "Don't judge each day by the harvest you reap but by the seeds that you plant.",
    "The best and most beautiful things in the world cannot be seen or even touched.",
    "It is during our darkest moments that we must focus to see the light.",
    "Whoever is happy will make others happy too.",
    "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "You will face many defeats in life, but never let yourself be defeated.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "In the end, it's not the years in your life that count. It's the life in your years.",
    "Never let the fear of striking out keep you from playing the game.",
    "Life is either a daring adventure or nothing at all.",
    "Many of life's failures are people who did not realize how close they were to success.",
    "You have brains in your head. You have feet in your shoes. You can steer yourself.",
    "The only impossible journey is the one you never begin.",
    "Only a life lived for others is a life worthwhile."
  ];

  const employees = ["John Smith", "Emma Johnson", "Michael Brown", "Sarah Davis",
    "David Wilson", "Jennifer Miller", "Robert Taylor", "Lisa Anderson"];

  return quoteTitles.map((title, index) => ({
    id: index + 1,
    title,
    description: descriptions[index % descriptions.length],
    addedBy: employees[index % employees.length],
  }));
};

// Sample data fallback
const sampleQuotes = generateSampleQuotes();

// Column config for table
const columnConfig = [
  { key: "title", label: "Quote Title", visible: true, width: "200px" },
  { key: "description", label: "Quote Description", visible: true, width: "300px" },
  { key: "addedBy", label: "Added By", visible: true, width: "150px" },
];

export default function QuoteOfTheDay() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<QuoteOfTheDay[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteOfTheDay | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch quotes with pagination + search
  const fetchQuotes = useCallback(
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
          quotes: QuoteOfTheDay[];
          total: number;
          page: number;
          totalPages: number;
        }>("/quotes/paginated", payload);

        if (data) {
          setFilteredData(data.quotes);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleQuotes];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((q) =>
              q.title.toLowerCase().includes(lower) ||
              q.description.toLowerCase().includes(lower) ||
              q.addedBy.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch quotes");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleQuotes.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleQuotes.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchQuotes(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchQuotes]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchQuotes(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchQuotes]
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
  const handleDeleteClick = (quote: QuoteOfTheDay) => {
    setQuoteToDelete(quote);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((q) => q.id !== quoteToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Quote deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/quotes/${quoteToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete quote:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete quote", "error");
        // fetchQuotes(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((q) => q.id !== quoteToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Quote deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchQuotes(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchQuotes(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting quote:", err);
      // showToast("Error deleting quote", "error");
      // Revert optimistic update on error
      // fetchQuotes(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setQuoteToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setQuoteToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (quote?: QuoteOfTheDay) => {
    navigate("/add-edit-quote", {
      state: {
        quote: quote || null,
        isEditing: !!quote,
      },
    });
  };

  const handleEdit = (quote: QuoteOfTheDay) => {
    handleNavigateToAddEdit(quote);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchQuotes(1, 10, "");
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
        title="Quotes of the Day | Admin Portal"
        description="Manage quotes of the day with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Quotes of the Day"
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
          <TableForQuoteOfTheDay
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
        title="Delete Quote"
        message={
          quoteToDelete ? (
            <span>
              Are you sure you want to delete the quote
              {" "}
              <strong>
                {quoteToDelete.title}
              </strong>?
            </span>
          ) : (
            "Are you sure you want to delete this quote?"
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