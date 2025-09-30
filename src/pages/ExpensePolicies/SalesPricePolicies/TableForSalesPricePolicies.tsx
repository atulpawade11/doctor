import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Pencil, Trash2, IndianRupee } from "lucide-react";
import Alert from "../../../components/ui/alert/Alert";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { SalesPricePolicy } from "./SalesPricePolicyType";

type ColumnConfig = {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
};

type TableForSalesPricePoliciesProps = {
  data: SalesPricePolicy[];
  columns: ColumnConfig[];
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (n: number) => void;
  firstItem: number;
  lastItem: number;
  totalFiltered: number;
  totalRecords: number;
  totalPages: number;
  showSrNo?: boolean;
  showActions?: boolean;
  onEdit: (item: SalesPricePolicy) => void;
  onDelete: (item: SalesPricePolicy) => void;
  isLoading: boolean;
};

// Simple badge component to avoid external dependency issues
const SimpleBadge = ({ 
  children, 
  variant = 'primary' 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'success' | 'error'; 
}) => {
  const baseClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  
  const variantClass = {
    primary: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border border-gray-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200"
  }[variant];

  return (
    <span className={`${baseClass} ${variantClass}`}>
      {children}
    </span>
  );
};

export default function TableForSalesPricePolicies({
  data,
  columns,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  firstItem,
  lastItem,
  totalFiltered,
  totalRecords,
  totalPages,
  showSrNo = true,
  showActions = true,
  onEdit,
  onDelete,
  isLoading = false,
}: TableForSalesPricePoliciesProps) {

  if (!isLoading && totalFiltered === 0) {
    const isFiltered = totalRecords > 0 && totalFiltered < totalRecords;
    const title = isFiltered ? "No Results Found" : "No Records Available";
    const message = isFiltered
      ? "We couldn't find any records that match your search. Try adjusting filters or search terms."
      : "There's no data available to display at the moment.";

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] flex flex-col">
        <div className="p-5">
          <Alert variant="info" title={title} message={message} showLink={false} />
        </div>
      </div>
    );
  }

  return (
    <>
      <CentralizedLoader
        isLoading={isLoading}
        message="Loading sales policies..."
      />

      {!isLoading && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Single Table with sticky header */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
              <Table className="w-full table-auto border-collapse">
                {/* Sticky Header */}
                <TableHeader className="sticky top-0 z-10 border-b border-gray-100 bg-white dark:bg-gray-900 dark:border-white/[0.05]">
                  <TableRow>
                    {showSrNo && (
                      <TableCell
                        isHeader
                        className="px-3 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400 w-[60px]"
                      >
                        #
                      </TableCell>
                    )}

                    {columns
                      .filter((c) => c.visible)
                      .map((col) => (
                        <TableCell
                          key={col.key}
                          isHeader
                          className={`px-4 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400 ${col.width ? `w-[${col.width}]` : ''}`}
                        >
                          {col.label}
                        </TableCell>
                      ))}

                    {showActions && (
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400 w-[100px]"
                      >
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHeader>

                {/* Scrollable Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {data.map((policy, index) => (
                    <TableRow key={policy.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                      {showSrNo && (
                        <TableCell className="px-3 py-3 text-left dark:text-white/90 w-[60px] text-sm">
                          {firstItem + index}.
                        </TableCell>
                      )}

                      {/* Designation */}
                      <TableCell className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                        <div className="font-medium">{policy.designation.name}</div>
                      </TableCell>

                      {/* Competency Rank */}
                      <TableCell className="px-4 py-3">
                        <SimpleBadge variant="secondary">
                          {policy.competencyRank}
                        </SimpleBadge>
                      </TableCell>

                      {/* HQ DA Metro */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 text-theme-sm">
                          <IndianRupee className="size-3" />
                          {policy.hqDaMetro.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* HQ DA Non Metro */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 text-theme-sm">
                          <IndianRupee className="size-3" />
                          {policy.hqDaNonMetro.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* EX HQ DA Metro */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 text-theme-sm">
                          <IndianRupee className="size-3" />
                          {policy.exHqDaMetro.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* EX HQ DA Non Metro */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 text-theme-sm">
                          <IndianRupee className="size-3" />
                          {policy.exHqDaNonMetro.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* Upcountry Metro */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 text-theme-sm">
                          <IndianRupee className="size-3" />
                          {policy.upcountryMetro.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* Upcountry Non Metro */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1 text-theme-sm">
                          <IndianRupee className="size-3" />
                          {policy.upcountryNonMetro.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* Lodging & Boarding */}
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-theme-sm">
                            <span className="text-xs text-gray-500">Metro:</span>
                            <IndianRupee className="size-3" />
                            {policy.lodgingBoardingMetro.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-theme-sm">
                            <span className="text-xs text-gray-500">Non Metro:</span>
                            <IndianRupee className="size-3" />
                            {policy.lodgingBoardingNonMetro.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3">
                        <SimpleBadge variant={policy.isActive ? "success" : "error"}>
                          {policy.isActive ? "Active" : "Inactive"}
                        </SimpleBadge>
                      </TableCell>

                      {showActions && (
                        <TableCell className="px-4 py-3 flex gap-2 w-[100px]">
                          <button
                            onClick={() => onEdit?.(policy)}
                            className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                            aria-label="Edit policy"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => onDelete?.(policy)}
                            className="flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-2 text-sm text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            aria-label="Delete policy"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination footer - Fixed */}
          <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-4 border-t border-gray-200 dark:border-white/[0.05] text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 gap-3">
            {/* Left: rows per page */}
            <div className="flex items-center">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  onRowsPerPageChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="ml-3 mr-2 border border-gray-300 rounded-md px-2 pr-8 py-1 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.05] cursor-pointer"
              >
                {[5, 10, 25, 50, 100].map((option) => (
                  <option key={option} value={option} className="cursor-pointer">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Center: summary */}
            <div className="text-center text-gray-500 dark:text-gray-400">
              {totalFiltered > 0 ? (
                <>
                  Showing <strong>{firstItem}</strong> to <strong>{lastItem}</strong> of{" "}
                  <strong>{totalFiltered}</strong> entries
                  {totalRecords > totalFiltered && (
                    <> (filtered from <strong>{totalRecords}</strong> total entries)</>
                  )}
                </>
              ) : (
                "No entries"
              )}
            </div>

            {/* Right: pagination controls */}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              >
                Prev
              </button>

              <span>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}