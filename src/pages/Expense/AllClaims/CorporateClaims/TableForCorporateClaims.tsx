// TableForCorporateClaims.tsx
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { ChevronDown, X, User, Trash2, RotateCw } from "lucide-react";
import Alert from "../../../../components/ui/alert/Alert";
import CentralizedLoader from "../../../../components/common/CentralizedLoader";
import type { CorporateClaim, ClaimStatus } from "./corporateClaimsType";
import { currencySymbols, statusColors } from "./corporateClaimsType";

type ColumnConfig = {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
};

type Props = {
  data: CorporateClaim[];
  columns: ColumnConfig[];
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (n: number) => void;
  firstItem: number;
  lastItem: number;
  totalRecords: number;
  totalFiltered: number;
  totalPages: number;
  showSrNo?: boolean;
  statusFilter: ClaimStatus | "All";
  onStatusFilterChange: (status: ClaimStatus | "All") => void;
  specialFilter: "All" | "Yes" | "No";
  onSpecialFilterChange: (s: "All" | "Yes" | "No") => void;
  // new: these open parent modals
  onDeleteClick: (claim: CorporateClaim) => void;
  onRestoreClick: (claim: CorporateClaim) => void;
  isLoading: boolean;
};

export default function TableForCorporateClaims({
  data,
  columns,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  firstItem,
  lastItem,
  totalRecords,
  totalFiltered,
  totalPages,
  showSrNo = true,
  statusFilter,
  onStatusFilterChange,
  specialFilter,
  onSpecialFilterChange,
  onDeleteClick,
  onRestoreClick,
  isLoading = false,
}: Props) {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSpecialDropdownOpen, setIsSpecialDropdownOpen] = useState(false);

  if (totalRecords === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] flex flex-col">
        <div className="p-5">
          <Alert variant="info" title="No Records Found" message="There are no corporate claims available at the moment." showLink={false} />
        </div>
      </div>
    );
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount: number, currency: keyof typeof currencySymbols) =>
    `${currencySymbols[currency]}${amount.toFixed(2)}`;

  return (
    <>
      <CentralizedLoader isLoading={isLoading} message="Loading corporate claims..." />

      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
            <Table className="w-full table-auto border-collapse">
              <TableHeader className="sticky top-0 z-10 border-b border-gray-100 bg-white dark:bg-gray-900">
                <TableRow>
                  {showSrNo && (
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-left w-[30px]">
                      #
                    </TableCell>
                  )}

                  {columns.filter((c) => c.visible).map((col) => (
                    <TableCell
                      key={col.key}
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-left text-sm"
                    >
                      {col.key === "status" ? (
                        <div className="flex items-center gap-1 relative">
                          <span>{col.label}</span>
                          <button
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <ChevronDown size={14} />
                          </button>

                          {isStatusDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 p-2 min-w-[140px]">
                              <div className="flex flex-col gap-1">
                                {["All", "Pending", "Approved", "Rejected", "Processing"].map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      onStatusFilterChange(s as ClaimStatus | "All");
                                      setIsStatusDropdownOpen(false);
                                    }}
                                    className={`text-xs px-2 py-1 rounded text-left ${statusFilter === s ? "bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {statusFilter !== "All" && (
                            <button onClick={() => onStatusFilterChange("All")} className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ) : col.key === "specialApproval" ? (
                        <div className="flex items-center gap-1 relative">
                          <span>{col.label}</span>
                          <button
                            onClick={() => setIsSpecialDropdownOpen(!isSpecialDropdownOpen)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <ChevronDown size={14} />
                          </button>

                          {isSpecialDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 p-2 min-w-[120px]">
                              <div className="flex flex-col gap-1">
                                {["All", "Yes", "No"].map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      onSpecialFilterChange(s as "All" | "Yes" | "No");
                                      setIsSpecialDropdownOpen(false);
                                    }}
                                    className={`text-xs px-2 py-1 rounded text-left ${specialFilter === s ? "bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {specialFilter !== "All" && (
                            <button onClick={() => onSpecialFilterChange("All")} className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}

                  {/* Actions header */}
                  <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-left text-sm w-[110px]">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100">
                {data.map((claim, index) => (
                  <TableRow key={claim.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
                  >
                    {showSrNo && (
                      <TableCell className="px-3 py-3 text-sm">{firstItem + index}.</TableCell>
                    )}

                    {columns.map((col) => {
                      if (!col.visible) return null;

                      switch (col.key) {
                        case "claimNumber":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-white/90">
                              {claim.claimNumber}
                            </TableCell>
                          );

                        case "claimTitle":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {claim.claimTitle}
                            </TableCell>
                          );

                        case "employee":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-left">
                              <div className="flex items-center gap-3">
                                {claim.employee.image ? (
                                  <img
                                    src={claim.employee.image}
                                    alt={claim.employee.name}
                                    className="w-9 h-9 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = "none";
                                      (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                                    }}
                                  />
                                ) : null}

                                <div className={`w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center ${claim.employee.image ? "hidden" : "flex"}`}>
                                  <User size={20} />
                                </div>

                                <div>
                                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                    {claim.employee.name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-gray-500 text-theme-xs dark:text-gray-400">
                                      <span>{`AUD-${claim.employee.id}`}</span>

                                    </div>

                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          );

                        case "specialApproval":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${claim.specialApproval ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"}`}>
                                {claim.specialApproval ? "Yes" : "No"}
                              </span>
                            </TableCell>
                          );

                        case "submittedOn":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {formatDateTime(claim.submittedOn)}
                            </TableCell>
                          );

                        case "claimAmount":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-white/90">
                              {formatCurrency(claim.claimAmount, claim.currency)}
                            </TableCell>
                          );

                        case "passedAmountSupervisor":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                              {formatCurrency(claim.passedAmountSupervisor, claim.currency)}
                            </TableCell>
                          );

                        case "passedAmountAuditor":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
                              {formatCurrency(claim.passedAmountAuditor, claim.currency)}
                            </TableCell>
                          );

                        case "deductionAmount":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                              {formatCurrency(claim.deductionAmount, claim.currency)}
                            </TableCell>
                          );

                        case "status":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[claim.status]}`}>
                                {claim.status}
                              </span>
                            </TableCell>
                          );

                        default:
                          return null;
                      }
                    })}

                    {/* Actions */}
                    <TableCell className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRestoreClick(claim)}
                          className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05]"
                        >
                          <RotateCw size={16} />
                        </button>

                        <button
                          onClick={() => onDeleteClick(claim)}
                          className="flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-2 text-sm text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination footer */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between p-4 border-t border-gray-200 dark:border-white/[0.05] text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 gap-3">
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
              {[5, 10, 25, 50, 100, 250, 500].map((option) => (
                <option key={option} value={option} className="cursor-pointer">
                  {option}
                </option>
              ))}
            </select>
          </div>

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
    </>
  );
}
