import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForAllEmployees from "./TableForAllEmployees";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { Employee } from "./employeeType";

// Sample data generator function
const generateSampleData = (): Employee[] => {
  const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Jennifer"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  const roles = ["Administrator", "User"];
  const departments = ["Engineering", "Marketing", "Human Resources", "Finance", "Sales", "Operations"];
  const designations = [
    { value: "manager", label: "Manager" },
    { value: "supervisor", label: "Supervisor" },
    { value: "executive", label: "Executive" },
    { value: "associate", label: "Associate" },
    { value: "director", label: "Director" },
    { value: "developer", label: "Developer" },
    { value: "designer", label: "Designer" },
  ];

  const categories = ["Corporate", "Sales"];
  const units = ["Unit 1", "Unit 2", "Unit 3"];
  const zones = ["North Zone", "South Zone", "East Zone", "West Zone"];
  const locations = ["Headquarters", "Branch Office 1", "Branch Office 2", "Remote"];
  const states = ["California", "Texas", "New York", "Florida", "Illinois"];
  const cities = ["Los Angeles", "Houston", "New York", "Miami", "Chicago"];
  const supervisors = ["John Smith", "Sarah Johnson", "Mike Williams", "Lisa Brown"];
  const expenseDesignations = ["Manager", "Team Lead", "Executive"];
  const userTypes = ["Corporate", "Factory", "Sales"];
  const ttmtOptions = ["Institution", "TT", "MT"];
  const secretaryOptions = ["Secretary A", "Secretary B", "Secretary C"];

  return Array.from({ length: 70 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`;

    const category = categories[i % categories.length];
    const ttmt = category === "Sales" ? ttmtOptions[i % ttmtOptions.length] : "";

    return {
      id: i + 1,
      user: {
        // image: `/images/user/owner.jpg`,
        image: ``,
        name: fullName,
        role: roles[i % roles.length],
        email: email,
      },
      department: departments[i % departments.length],
      joiningDate: `202${i % 3}-0${(i % 12) + 1}-15`,
      status: i % 2 === 0 ? "Active" : "Inactive",

      // Additional form fields
      firstName,
      lastName,
      designation: designations[i % designations.length].label,
      birthDate: `198${i % 10}-0${(i % 12) + 1}-${(i % 28) + 1}`,
      mobileNo: `555-${100 + (i % 900)}-${1000 + (i % 9000)}`,
      mobileNoAlternative: `555-${200 + (i % 800)}-${2000 + (i % 8000)}`,
      password: `Password${i + 1}!`,
      category,
      unit: units[i % units.length],
      zone: zones[i % zones.length],
      location: locations[i % locations.length],
      state: states[i % states.length],
      city: cities[i % cities.length],
      supervisor: supervisors[i % supervisors.length],
      bankAccountNo: `123456789${1000 + i}`,
      bankName: `Bank of ${states[i % states.length]}`,
      IfscCode: `ABCD0${1000 + i}`,
      expenseDesignation: expenseDesignations[i % expenseDesignations.length],
      userType: userTypes[i % userTypes.length],
      ttmt,
      secretary: secretaryOptions[i % secretaryOptions.length],
    };
  });
};

// Sample employee data for fallback
const sampleData = generateSampleData();

// Column config
const columnConfig = [
  { key: "user", label: "Employee Name", visible: true, width: "220px" },
  { key: "email", label: "Email", visible: true, width: "260px" },
  { key: "designation", label: "Designation", visible: true, width: "160px" },
  { key: "department", label: "Department", visible: true, width: "160px" },
  { key: "status", label: "Status", visible: true, width: "120px" },
];

export default function AllEmployees() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [filteredData, setFilteredData] = useState<Employee[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"Active" | "Inactive" | "All">("All");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch employees with pagination payload
  const fetchEmployees = useCallback(async (
    pageNumber = page,
    pageSize = rowsPerPage,
    search = searchQuery,
    status = statusFilter
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        page: pageNumber,
        limit: pageSize,
        // status: status === "All" ? undefined : status,
        // search: search || undefined
        status: status,
        search: search
      };

      const { data, error: apiError } = await apiService.post<{
        employees: Employee[];
        total: number;
        page: number;
        totalPages: number;
      }>("/employees/paginated", payload);

      if (data) {

        setFilteredData(data.employees);
        setTotalRecords(data.total);
      } else if (apiError) {
        // Apply filters to sample data
        let filteredSample = [...sampleData];

        // Apply status filter
        if (status !== "All") {
          filteredSample = filteredSample.filter(item => item.status === status);
        }

        // Apply search filter
        if (search) {
          const lower = search.toLowerCase();
          filteredSample = filteredSample.filter((item) =>
            Object.values(item).some((val) => {
              if (typeof val === "string") return val.toLowerCase().includes(lower);
              if (typeof val === "object" && val !== null) {
                return Object.values(val).some(
                  (v) => typeof v === "string" && v.toLowerCase().includes(lower)
                );
              }
              return false;
            })
          );
        }

        // Apply pagination
        const startIndex = (pageNumber - 1) * pageSize;
        const paginatedSample = filteredSample.slice(startIndex, startIndex + pageSize);


        setFilteredData(paginatedSample);
        setTotalRecords(filteredSample.length);
      }
    } catch (err) {
      setError("Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchEmployees(page, rowsPerPage, searchQuery, statusFilter);
  }, [page, rowsPerPage, statusFilter, fetchEmployees]);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer
    debounceTimer.current = setTimeout(() => {
      if (!query || query.trim() === "") {
        fetchEmployees(1, rowsPerPage, "", statusFilter);
      } else {
        fetchEmployees(1, rowsPerPage, query, statusFilter);
      }
    }, 699); //delay
  }, [rowsPerPage, statusFilter, fetchEmployees]);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // handle status filter change
  const handleStatusFilterChange = (status: "Active" | "Inactive" | "All") => {
    setStatusFilter(status);
    setPage(1);
    fetchEmployees(1, rowsPerPage, searchQuery, status);
  };

  // derived values
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  // toggle active/inactive
  const handleStatusChange = async (id: number, checked: boolean) => {
    const newStatus = checked ? "Active" : "Inactive";
    const previousStatus = checked ? "Inactive" : "Active";

    // Update locally first for immediate UI feedback
    const updateLocalState = (status: string) => {

      setFilteredData(prev => prev.map(row =>
        row.id === id ? { ...row, status: status as "Active" | "Inactive" } : row
      ));
    };

    // Apply optimistic update
    updateLocalState(newStatus);
    showToast(`Status changed to ${newStatus}`, "success");

    try {
      // Call API to update status
      const { error } = await apiService.patch(`/employees/${id}/status`, {
        status: newStatus
      });

      if (error) {
        console.error('Failed to update status:', error);
        // Revert on error
        updateLocalState(previousStatus);
      } else {
        // Refresh data to ensure consistency
        fetchEmployees(page, rowsPerPage, searchQuery, statusFilter);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      // Revert on exception
      updateLocalState(previousStatus);
    }
  };

  // Function to handle navigation to add/edit page
  const handleNavigateToAddEdit = (employee?: Employee) => {
    navigate("/add-edit-employee", {
      state: {
        employee: employee || null,
        isEditing: !!employee,
      }
    });
  };

  // Updated edit handler
  const handleEdit = (item: Employee) => {
    handleNavigateToAddEdit(item);
  };

  // Modified delete handler
  const handleDeleteClick = (item: Employee) => {
    setEmployeeToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // New function to handle actual deletion
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);

    setFilteredData(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
    setTotalRecords(prev => prev - 1);
    showToast("Employee deleted successfully", "success");


    try {
      // Call API to delete employee
      const { error } = await apiService.delete(`/employees/${employeeToDelete.id}`);

      if (error) {
        console.error('Failed to delete employee:', error);
        // showToast("Failed to delete employee", "error");
      } else {
        // Remove from local state on success
        setFilteredData(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
        setTotalRecords(prev => prev - 1);
        showToast("Employee deleted successfully", "success");

        // Refresh data if we're on the last page and it's now empty
        // if (employees.length === 1 && page > 1) {
        //   setPage(page - 1);
        //   fetchEmployees(page - 1, rowsPerPage, searchQuery, statusFilter);
        // } else {
        //   fetchEmployees(page, rowsPerPage, searchQuery, statusFilter);
        // }
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      showToast("Error deleting employee", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      setIsDeleting(false);
    }
  };

  // New function to cancel deletion
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  // Refresh data function
  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setTotalRecords(0);
    setSearchQuery("");
    setStatusFilter("All");
    fetchEmployees(1, 10, "", "All");
    showToast("Data refreshed", "info");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta
        title="All Employees | Mann Ka Doctor Admin Portal"
        description="View and manage all employees in the Mann Ka Doctor Admin Portal with dynamic tables, pagination, and configurable columns."
      />


      {/* Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Employees"
          btnLabel="Add New"
          onSearch={handleSearch}
          onNavigate={() => handleNavigateToAddEdit()}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      {/* Scrollable container for the table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForAllEmployees
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
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            isLoading={false}
          />
        </div>
      </div>

      {/* Confirmation Modal with Bluish Background */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={
          employeeToDelete ? (
            <span>
              Are you sure you want to delete <strong>{employeeToDelete.user.name}</strong>?
            </span>
          ) : (
            "Are you sure you want to delete this employee?"
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