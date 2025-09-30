import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForNews from "./TableForNews";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { News } from "./newsTypes";

// Sample data generator for news
const generateSampleNews = (): News[] => {
  const newsTitles = [
    "Company Achieves Record Growth", "New Product Launch Announcement", "Industry Conference Highlights",
    "Team Expansion News", "Partnership with Leading Tech Firm", "Sustainability Initiative Launched",
    "Award Recognition Ceremony", "Community Outreach Program", "Technology Innovation Breakthrough",
    "Quarterly Financial Results", "Employee Wellness Program", "Customer Success Stories",
    "Market Expansion Strategy", "Research and Development Update", "Leadership Team Changes",
    "Corporate Social Responsibility", "Digital Transformation Journey", "Quality Assurance Milestone",
    "Client Testimonials", "Industry Trends Analysis", "Workplace Safety Initiatives",
    "Training and Development Programs", "Product Quality Improvements", "Customer Support Enhancements",
    "Strategic Business Partnerships", "Innovation Lab Opening", "Environmental Sustainability Efforts",
    "Employee Recognition Awards", "Technology Infrastructure Upgrade", "Future Growth Prospects"
  ];

  const descriptions = [
    "Our company has achieved remarkable growth this quarter, exceeding all expectations and setting new industry standards.",
    "We are excited to announce the launch of our latest product, designed to revolutionize the market with innovative features.",
    "The recent industry conference provided valuable insights into emerging trends and future opportunities for growth.",
    "We are pleased to announce the expansion of our team with talented professionals joining our organization.",
    "Our new partnership with a leading technology firm will enhance our capabilities and service offerings.",
    "We have launched a comprehensive sustainability initiative to reduce our environmental impact and promote eco-friendly practices.",
    "Our company has been recognized with prestigious awards for excellence in innovation and customer service.",
    "Our community outreach program continues to make a positive impact on local communities and social causes.",
    "Our research team has made a significant breakthrough in technology innovation that will transform our industry.",
    "We are proud to share our quarterly financial results, demonstrating strong performance and sustainable growth.",
    "Our employee wellness program focuses on promoting health, work-life balance, and overall well-being.",
    "Read inspiring success stories from our valued customers who have achieved remarkable results with our solutions.",
    "Our market expansion strategy includes entering new territories and reaching diverse customer segments.",
    "Our research and development team continues to innovate and create cutting-edge solutions for our clients.",
    "We announce changes to our leadership team to strengthen our organization and drive future success.",
    "Our corporate social responsibility initiatives focus on making a positive impact on society and the environment.",
    "We are embarking on a digital transformation journey to enhance our operations and customer experiences.",
    "We have achieved a significant milestone in quality assurance, ensuring the highest standards for our products.",
    "Hear from our satisfied clients about their experiences and success stories with our services.",
    "Our analysis of industry trends provides valuable insights into market dynamics and future opportunities.",
    "We are committed to workplace safety with comprehensive initiatives and training programs for our employees.",
    "Our training and development programs focus on enhancing skills and career growth for our team members.",
    "We have implemented significant improvements in product quality based on customer feedback and market research.",
    "Our customer support enhancements include new features and services to better serve our clients.",
    "We have formed strategic business partnerships to expand our offerings and reach new markets.",
    "Our innovation lab opening marks a new chapter in our commitment to research and development.",
    "Our environmental sustainability efforts include reducing carbon footprint and promoting green practices.",
    "We celebrate our employees with recognition awards for their outstanding contributions and achievements.",
    "Our technology infrastructure upgrade will enhance performance, security, and scalability for our services.",
    "We are optimistic about future growth prospects and opportunities for expansion in emerging markets."
  ];

  return newsTitles.map((title, index) => ({
    id: index + 1,
    title,
    description: `<p>${descriptions[index % descriptions.length]}</p>`,
    // imageUrl: index % 4 === 0 ? `/sample-images/news-${index % 5}.jpg` : undefined,
    imageUrl: undefined,
    multipleImages: index % 3 === 0 ? [
      `/sample-images/news-${index % 5}-1.jpg`,
      `/sample-images/news-${index % 5}-2.jpg`
    ] : undefined,
  }));
};

// Sample data fallback
const sampleNews = generateSampleNews();

// Column config for table
const columnConfig = [
  { key: "imageUrl", label: "Image", visible: true, width: "100px" },
  { key: "title", label: "News Title", visible: true, width: "200px" },
  { key: "description", label: "Description", visible: true, width: "300px" },
];

export default function News() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<News[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch news with pagination + search
  const fetchNews = useCallback(
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
          news: News[];
          total: number;
          page: number;
          totalPages: number;
        }>("/news/paginated", payload);

        if (data) {
          setFilteredData(data.news);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleNews];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((n) =>
              n.title.toLowerCase().includes(lower) ||
              n.description.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch news");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleNews.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleNews.length);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchNews(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchNews]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchNews(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchNews]
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
  const handleDeleteClick = (news: News) => {
    setNewsToDelete(news);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!newsToDelete) return;
    setIsDeleting(true);

    // Optimistic UI update
    setFilteredData((prev) => prev.filter((n) => n.id !== newsToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("News deleted successfully", "success");

    try {

      const { error } = await apiService.delete(
        `/news/${newsToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete news:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete news", "error");
        // fetchNews(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((n) => n.id !== newsToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("News deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchNews(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchNews(page, rowsPerPage, searchQuery);
        // }

      }
    } catch (err) {
      console.error("Error deleting news:", err);
      // showToast("Error deleting news", "error");
      // Revert optimistic update on error
      // fetchNews(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setNewsToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setNewsToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (news?: News) => {
    navigate("/add-edit-news", {
      state: {
        news: news || null,
        isEditing: !!news,
      },
    });
  };

  const handleEdit = (news: News) => {
    handleNavigateToAddEdit(news);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchNews(1, 10, "");
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
        title="News | Admin Portal"
        description="Manage news with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All News"
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
          <TableForNews
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
        title="Delete News"
        message={
          newsToDelete ? (
            <span>
              Are you sure you want to delete the news
              {" "}
              <strong>{newsToDelete?.title}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this news?"
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