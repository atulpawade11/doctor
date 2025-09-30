import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForMessages from "./TableForMessages";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Message } from "./messageTypes";

// Sample data generator for messages
const generateSampleMessages = (): Message[] => {
  const messageTitles = [
    "Welcome Message", "Important Announcement", "Weekly Update",
    "Team Meeting Reminder", "Policy Update", "Holiday Schedule",
    "Performance Review", "Training Session", "Company Event",
    "System Maintenance", "Security Alert", "New Feature Launch",
    "Customer Feedback", "Project Deadline", "Team Building",
    "Recognition Award", "Budget Update", "Strategic Planning",
    "Client Meeting", "Product Launch", "Market Analysis",
    "Sales Report", "Quality Standards", "Safety Procedures",
    "Compliance Update", "Innovation Challenge", "Wellness Program",
    "Volunteer Opportunity", "Career Development", "Leadership Message"
  ];

  const quotes = [
    "Great things in business are never done by one person. They're done by a team of people.",
    "The way to get started is to quit talking and begin doing.",
    "Innovation distinguishes between a leader and a follower.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "Your time is limited, so don't waste it living someone else's life.",
    "If you are working on something that you really care about, you don't have to be pushed.",
    "Quality is more important than quantity. One home run is much better than two doubles.",
    "It's not about ideas. It's about making ideas happen.",
    "The only way to do great work is to love what you do.",
    "I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.",
    "My favorite things in life don't cost any money. It's really clear that the most precious resource we all have is time.",
    "Be a yardstick of quality. Some people aren't used to an environment where excellence is expected.",
    "Let's go invent tomorrow instead of worrying about what happened yesterday.",
    "You can't connect the dots looking forward; you can only connect them looking backwards.",
    "Sometimes when you innovate, you make mistakes. It is best to admit them quickly, and get on with improving your other innovations.",
    "My model for business is The Beatles. They were four guys who kept each other's negative tendencies in check.",
    "We're here to put a dent in the universe. Otherwise why else even be here?",
    "Simple can be harder than complex: You have to work hard to get your thinking clean to make it simple.",
    "Being the richest man in the cemetery doesn't matter to me. Going to bed at night saying we've done something wonderful... that's what matters to me.",
    "I'm as proud of many of the things we haven't done as the things we have done.",
    "You have to trust in something - your gut, destiny, life, karma, whatever.",
    "Sometimes life is going to hit you in the head with a brick. Don't lose faith.",
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    "Stay hungry, stay foolish.",
    "We don't get a chance to do that many things, and every one should be really excellent.",
    "Remembering that you are going to die is the best way I know to avoid the trap of thinking you have something to lose.",
    "Have the courage to follow your heart and intuition. They somehow already know what you truly want to become.",
    "If today were the last day of your life, would you want to do what you are about to do today?"
  ];

  const employeeNames = ["John Smith", "Sarah Johnson", "Mike Williams", "Lisa Brown", "David Wilson"];
  const roles: ("Administrator" | "User")[] = ["Administrator", "User"];

  return messageTitles.map((title, index) => ({
    id: index + 1,
    title,
    quote: `<p>${quotes[index % quotes.length]}</p>`,
    role: roles[index % roles.length],
    addedByEmployee: employeeNames[index % employeeNames.length],
  }));
};

// Sample data fallback
const sampleMessages = generateSampleMessages();

// Column config for table
const columnConfig = [
  { key: "title", label: "Message Title", visible: true, width: "200px" },
  { key: "quote", label: "Message Quote", visible: true, width: "300px" },
  { key: "role", label: "Role", visible: true, width: "120px" },
  { key: "addedByEmployee", label: "Added By", visible: true, width: "150px" },
];

export default function Messages() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Message[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch messages with pagination + search
  const fetchMessages = useCallback(
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
          messages: Message[];
          total: number;
          page: number;
          totalPages: number;
        }>("/messages/paginated", payload);

        if (data) {
          setFilteredData(data.messages);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleMessages];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((m) =>
              m.title.toLowerCase().includes(lower) ||
              m.quote.toLowerCase().includes(lower) ||
              m.role.toLowerCase().includes(lower) ||
              m.addedByEmployee.toLowerCase().includes(lower)
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch messages");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleMessages.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleMessages.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchMessages(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchMessages]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchMessages(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchMessages]
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
  const handleDeleteClick = (message: Message) => {
    setMessageToDelete(message);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);


    // Optimistic UI update
    setFilteredData((prev) => prev.filter((m) => m.id !== messageToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Message deleted successfully", "success");


    try {

      const { error } = await apiService.delete(
        `/messages/${messageToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete message:", error);
        // Revert optimistic update if API call fails
        // showToast("Failed to delete message.", "error");
        // fetchMessages(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((m) => m.id !== messageToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Message deleted successfully", "success");
        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchMessages(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchMessages(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      // showToast("Error deleting message", "error");
      // Revert optimistic update on error
      // fetchMessages(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMessageToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (message?: Message) => {
    navigate("/add-edit-message", {
      state: {
        message: message || null,
        isEditing: !!message,
      },
    });
  };

  const handleEdit = (message: Message) => {
    handleNavigateToAddEdit(message);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchMessages(1, 10, "");
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
        title="Messages | Admin Portal"
        description="Manage messages with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Messages"
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
          <TableForMessages
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
        title="Delete Message"
        message={
          messageToDelete ? (
            <span>
              Are you sure you want to delete the message
              {" "}
              <strong>{messageToDelete.title}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this message?"
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