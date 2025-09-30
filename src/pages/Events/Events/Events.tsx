import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForEvents from "./TableForEvents";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Event } from "./eventTypes";

// Sample data generator for events
const generateSampleEvents = (): Event[] => {
  const eventTitles = [
    "Annual Tech Conference", "Product Launch Event", "Industry Networking Night",
    "Team Building Workshop", "Customer Appreciation Day", "Sustainability Summit",
    "Awards Gala", "Community Outreach Event", "Technology Demo Day",
    "Quarterly Review Meeting", "Employee Wellness Seminar", "Client Success Stories Night",
    "Market Expansion Announcement", "Research Symposium", "Leadership Conference",
    "Corporate Social Responsibility Day", "Digital Transformation Workshop", "Quality Assurance Forum",
    "Partner Summit", "Industry Trends Analysis", "Workplace Safety Training",
    "Professional Development Conference", "Product Quality Review", "Customer Support Training",
    "Strategic Partnership Announcement", "Innovation Showcase", "Environmental Sustainability Conference",
    "Employee Recognition Ceremony", "Technology Upgrade Symposium", "Future Growth Strategy Meeting"
  ];

  const descriptions = [
    "Join us for our annual technology conference featuring industry leaders and innovative presentations.",
    "Be the first to experience our latest product innovations at our exclusive launch event.",
    "Network with industry professionals and expand your business connections at our networking night.",
    "Participate in team-building activities designed to strengthen collaboration and communication.",
    "We're celebrating our valued customers with a special appreciation day filled with activities and rewards.",
    "Learn about sustainable practices and environmental initiatives at our sustainability summit.",
    "Celebrate excellence and achievement at our annual awards gala honoring outstanding contributions.",
    "Join us in giving back to the community through our outreach programs and volunteer activities.",
    "Experience live demonstrations of our latest technological advancements and innovations.",
    "Review our quarterly performance and discuss future strategies at our review meeting.",
    "Focus on health and wellness with seminars and activities designed to promote work-life balance.",
    "Hear inspiring stories from our clients about their success journeys with our solutions.",
    "Learn about our expansion into new markets and the opportunities this creates for our partners.",
    "Explore the latest research findings and technological breakthroughs at our research symposium.",
    "Gather with leaders from across the industry to discuss trends, challenges, and opportunities.",
    "Participate in our CSR initiatives focused on making a positive impact on society and the environment.",
    "Learn about digital transformation strategies and how they can benefit your organization.",
    "Discuss quality standards, best practices, and improvement strategies at our QA forum.",
    "Connect with our partners and explore collaboration opportunities at our annual partner summit.",
    "Gain insights into current industry trends and future market directions from expert analysts.",
    "Enhance workplace safety knowledge and practices through comprehensive training sessions.",
    "Advance your professional skills and career development through specialized training programs.",
    "Review our product quality improvements and provide feedback for future enhancements.",
    "Learn about our enhanced customer support services and how they can benefit your organization.",
    "Announce new strategic partnerships and explore collaborative opportunities for growth.",
    "Showcase innovative solutions and cutting-edge technologies at our innovation event.",
    "Discuss environmental sustainability practices and strategies for reducing ecological impact.",
    "Recognize and celebrate the outstanding achievements of our employees at this special ceremony.",
    "Learn about our technology infrastructure upgrades and their benefits for performance and security.",
    "Discuss future growth strategies and expansion opportunities in emerging markets."
  ];

  // Generate dates for the next 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  return eventTitles.map((title, index) => ({
    id: index + 1,
    title,
    description: descriptions[index % descriptions.length],
    date: dates[index % dates.length],
    // imageUrl: index % 4 === 0 ? `/sample-images/event-${index % 5}.jpg` : undefined,
    imageUrl: undefined,

    multipleImages: index % 3 === 0 ? [
      `/sample-images/event-${index % 5}-1.jpg`,
      `/sample-images/event-${index % 5}-2.jpg`
    ] : undefined,
  }));
};

// Sample data fallback
const sampleEvents = generateSampleEvents();

// Column config for table
const columnConfig = [
  { key: "imageUrl", label: "Image", visible: true, width: "100px" },
  { key: "title", label: "Event Title", visible: true, width: "200px" },
  { key: "description", label: "Description", visible: true, width: "300px" },
  { key: "date", label: "Date", visible: true, width: "120px" },
];

export default function Events() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Event[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch events with pagination + search
  const fetchEvents = useCallback(
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
          events: Event[];
          total: number;
          page: number;
          totalPages: number;
        }>("/events/paginated", payload);

        if (data) {
          setFilteredData(data.events);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleEvents];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((e) =>
              e.title.toLowerCase().includes(lower) ||
              e.description.toLowerCase().includes(lower) ||
              e.date.includes(search)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch events");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleEvents.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleEvents.length);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchEvents(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchEvents]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchEvents(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchEvents]
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
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((e) => e.id !== eventToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Event deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/events/${eventToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete event:", error);
        // showToast("Failed to delete event", "error");
        // fetchEvents(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((e) => e.id !== eventToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Event deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchEvents(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchEvents(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      // showToast("Error deleting event", "error");
      // fetchEvents(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (event?: Event) => {
    navigate("/add-edit-event", {
      state: {
        event: event || null,
        isEditing: !!event,
      },
    });
  };

  const handleEdit = (event: Event) => {
    handleNavigateToAddEdit(event);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchEvents(1, 10, "");
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
        title="Events | Admin Portal"
        description="Manage events with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Events"
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
          <TableForEvents
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
        title="Delete Event"
        message={
          eventToDelete ? (
            <span>
              Are you sure you want to delete the event
              {" "}
              <strong>{eventToDelete?.title}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this event?"
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