import { useState, useEffect, useCallback, useRef } from "react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadCrumbForTable from "./PageBreadCrumbForTable";
import TableForLoginDetails from "./TableForLoginDetails";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import { apiService } from "../../../services/apiService";
import { useToast } from "../../../components/common/ToastProvider";
import type { LoginDetail } from "./loginDetailsType";

// ✅ Sample fallback data
const generateSampleLoginDetails = (): LoginDetail[] => {
  const roles = ["Admin", "User"] as const;
  return Array.from({ length: 80 }, (_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: ["Engineering", "HR", "Finance", "Marketing"][i % 4],
    designation: ["Software Engineer", "HR Manager", "Analyst", "Designer"][i % 4],
    loginUserType: roles[i % 2],
    loginTime: new Date(Date.now() - i * 3600_000).toISOString(),
  }));
};
const sampleLoginDetails = generateSampleLoginDetails();

// ✅ Column config
const columnConfig = [
  { key: "username", label: "Username", visible: true, width: "180px" },
  { key: "email", label: "Email", visible: true, width: "220px" },
  { key: "department", label: "Department", visible: true, width: "160px" },
  { key: "designation", label: "Designation", visible: true, width: "180px" },
  { key: "loginUserType", label: "User Type", visible: true, width: "160px" },
  { key: "loginTime", label: "Login Time", visible: true, width: "200px" },
];

export default function LoginDetails() {
  const { showToast } = useToast();

  const [data, setData] = useState<LoginDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ✅ pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // ✅ Fetch login details with pagination & search
  const fetchLoginDetails = useCallback(
    async (pageNumber = page, pageSize = rowsPerPage, search = searchQuery) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = { page: pageNumber, limit: pageSize, search: search || undefined };
        const { data, error: apiError } = await apiService.post<{
          loginDetails: LoginDetail[];
          total: number;
        }>("/login-details/paginated", payload);

        if (data) {
          setData(data.loginDetails);
          setTotalRecords(data.total);
        } else if (apiError) {
          // fallback to sample
          let filtered = [...sampleLoginDetails];
          if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(
              (d) =>
                d.username.toLowerCase().includes(lower) ||
                d.email.toLowerCase().includes(lower) ||
                d.department.toLowerCase().includes(lower) ||
                d.designation.toLowerCase().includes(lower) ||
                d.loginUserType.toLowerCase().includes(lower)
            );
          }
          const start = (pageNumber - 1) * pageSize;
          setData(filtered.slice(start, start + pageSize));
          setTotalRecords(filtered.length);
        }
      } catch (err) {
        setError("Failed to fetch login details");
        const start = (pageNumber - 1) * pageSize;
        setData(sampleLoginDetails.slice(start, start + pageSize));
        setTotalRecords(sampleLoginDetails.length);
      } finally {
        setIsLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  useEffect(() => {
    fetchLoginDetails(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, fetchLoginDetails]);

  // ✅ Debounced search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        fetchLoginDetails(1, rowsPerPage, query);
      }, 699);
    },
    [rowsPerPage, fetchLoginDetails]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ✅ Refresh
  const handleRefresh = () => {
    setPage(1);
    setRowsPerPage(10);
    setSearchQuery("");
    fetchLoginDetails(1, 10, "");
    showToast("Data refreshed", "info");
  };

  // derived values
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const firstItem = totalRecords === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + rowsPerPage, totalRecords);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageMeta title="Login Details | Admin Portal" description="User login details with pagination and search" />

      {/* ✅ Breadcrumb */}
      <div className="flex-none">
        <PageBreadCrumbForTable
          pageTitle="All Login Details"
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          error={error}
        />
      </div>

      {/* ✅ Table */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <TableForLoginDetails
            data={data}
            columns={columnConfig}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            firstItem={firstItem}
            lastItem={lastItem}
            totalRecords={totalRecords}
            totalFiltered={totalRecords}
            totalPages={totalPages}
            showSrNo={true}
            isLoading={false}
          />
        </div>
      </div>

      <CentralizedLoader isLoading={isLoading}
        message="Processing your request..."
      />
    </div>
  );
}
