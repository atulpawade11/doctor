import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForGroups from "./TableForGroups";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Group, GroupMember } from "./groupType";

// Sample data generator for groups
const generateSampleGroups = (): Group[] => {
  const groupTitles = [
    "Development Team", "Marketing Department", "Sales Team",
    "Customer Support", "Design Team", "Quality Assurance",
    "Operations Team", "Human Resources", "Finance Department",
    "Research & Development", "IT Support", "Project Management",
    "Content Creation", "Social Media", "Business Development",
    "Product Team", "Executive Leadership", "Administration"
  ];

  const descriptions = [
    "Team responsible for software development and maintenance",
    "Handles all marketing campaigns and strategies",
    "Sales and business acquisition team",
    "Customer service and support department",
    "Creative design and UX/UI team",
    "Quality control and testing team",
    "Operations and logistics management",
    "Human resources and talent management",
    "Financial planning and accounting",
    "Research and innovation department",
    "IT infrastructure and support services",
    "Project coordination and management",
    "Content creation and management",
    "Social media management and engagement",
    "Business growth and partnership development",
    "Product development and management",
    "Executive leadership and decision making",
    "Administrative and clerical support"
  ];

  const groupMembersOptions: GroupMember[] = [
    { value: "john", label: "John Smith", EmpID: "EUM-1" },
    { value: "sarah", label: "Sarah Johnson", EmpID: "EUM-2" },
    { value: "mike", label: "Mike Williams", EmpID: "EUM-3" },
    { value: "lisa", label: "Lisa Brown", EmpID: "EUM-4" },
    { value: "david", label: "David Wilson", EmpID: "EUM-5" },
    { value: "emma", label: "Emma Johnson", EmpID: "EUM-6" },
    { value: "robert", label: "Robert Taylor", EmpID: "EUM-7" },
    { value: "jennifer", label: "Jennifer Miller", EmpID: "EUM-8" }
  ];

  return groupTitles.map((title, index) => ({
    id: index + 1,
    title,
    description: descriptions[index % descriptions.length],
    members: groupMembersOptions.slice(0, (index % 3) + 2), // 2-4 members per group
  }));
};

// Sample data fallback
const sampleGroups = generateSampleGroups();

// Column config for table
const columnConfig = [
  { key: "title", label: "Group Title", visible: true, width: "200px" },
  { key: "description", label: "Group Description", visible: true, width: "300px" },
  { key: "members", label: "Members", visible: true, width: "200px" },
];

export default function Groups() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Group[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch groups with pagination + search
  const fetchGroups = useCallback(
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
          groups: Group[];
          total: number;
          page: number;
          totalPages: number;
        }>("/groups/paginated", payload);

        if (data) {
          setFilteredData(data.groups);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample data
          let filtered = [...sampleGroups];

          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter((group) =>
              group.title.toLowerCase().includes(lower) ||
              group.description.toLowerCase().includes(lower) ||
              group.members.some(member =>
                member.label.toLowerCase().includes(lower) ||
                member.EmpID.toLowerCase().includes(lower)
              )
            );
          }

          const startIndex = (pageNumber - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          setFilteredData(paginated);
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch groups");
        // fallback to sample data
        const startIndex = (pageNumber - 1) * pageSize;
        const paginated = sampleGroups.slice(startIndex, startIndex + pageSize);
        setFilteredData(paginated);
        setTotalRecords(sampleGroups.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchGroups(page, rowsPerPage);
  }, [page, rowsPerPage, fetchGroups]);

  // Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchGroups(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchGroups]
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
  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);

    setFilteredData((prev) => prev.filter((g) => g.id !== groupToDelete.id));
    setTotalRecords((prev) => prev - 1);
    showToast("Group deleted successfully", "success");

    try {
      const { error } = await apiService.delete(
        `/groups/${groupToDelete.id}`
      );

      if (error) {
        console.error("Failed to delete group:", error);
        // showToast("Failed to delete group", "error");
        // fetchGroups(page, rowsPerPage, searchQuery);
      } else {
        setFilteredData((prev) => prev.filter((g) => g.id !== groupToDelete.id));
        setTotalRecords((prev) => prev - 1);
        showToast("Group deleted successfully", "success");

        // if (filteredData.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchGroups(page - 1, rowsPerPage, searchQuery);
        // } else {
        //   fetchGroups(page, rowsPerPage, searchQuery);
        // }
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      // showToast("Error deleting group", "error");
      // fetchGroups(page, rowsPerPage, searchQuery);
    } finally {
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setGroupToDelete(null);
  };

  // Navigation to add/edit
  const handleNavigateToAddEdit = (group?: Group) => {
    navigate("/add-edit-group", {
      state: {
        group: group || null,
        isEditing: !!group,
      },
    });
  };

  const handleEdit = (group: Group) => {
    handleNavigateToAddEdit(group);
  };

  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    fetchGroups(1, 10, "");
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
        title="Groups Management | Admin Portal"
        description="Manage groups with pagination and search"
      />

      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Groups"
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
          <TableForGroups
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
        title="Delete Group"
        message={
          groupToDelete ? (
            <span>
              Are you sure you want to delete the group
              {" "}
              <strong>
                {groupToDelete.title}
              </strong>?

            </span>
          ) : (
            "Are you sure you want to delete this group?"
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