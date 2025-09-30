import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import Alert from "../../../components/ui/alert/Alert";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { Accountant } from "./accountantType";

type ColumnConfig = {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
};

type TableForAccountantsProps = {
  data: Accountant[];
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
  onEdit: (item: Accountant) => void;
  onDelete: (item: Accountant) => void;
  isLoading: boolean;
};

export default function TableForAccountants({
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
  showSrNo = false,
  showActions = false,
  onEdit,
  onDelete,
  isLoading = false,
}: TableForAccountantsProps) {
  if (totalFiltered === 0) {
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
        message="Processing your request..."
      />

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
                      className="px-4 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400 w-[120px]"
                    >
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>

              {/* Scrollable Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data.map((accountant, index) => (
                  <TableRow key={accountant.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                    {showSrNo && (
                      <TableCell className="px-3 py-3 text-left dark:text-white/90 w-[60px] text-sm">
                        {firstItem + index}.
                      </TableCell>
                    )}

                    {columns.map((col) => {
                      if (!col.visible) return null;
                      switch (col.key) {
                        case "user":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-left">
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {accountant.user.name}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {accountant.user.employeeId}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {accountant.user.email}
                                </span>
                              </div>
                            </TableCell>
                          );
                        case "userName":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                              {accountant.userName}
                            </TableCell>
                          );
                        case "category":
                          return (
                            <TableCell key={col.key} className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${accountant.category === 'Corporate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : accountant.category === 'Sales' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                {accountant.category}
                              </span>
                            </TableCell>
                          );
                        case "isAdmin":
                          return (
                            <TableCell key={col.key} className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${accountant.isAdmin ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                                {accountant.isAdmin ? 'Yes' : 'No'}
                              </span>
                            </TableCell>
                          );
                        case "locations":
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                              <div className="flex flex-wrap gap-1">
                                {accountant.locations.slice(0, 2).map((loc, idx) => (
                                  <span key={idx} className="inline-block bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1 text-xs">
                                    {loc.unit} / {loc.zone}
                                  </span>
                                ))}
                                {accountant.locations.length > 2 && (
                                  <span className="inline-block bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1 text-xs">
                                    +{accountant.locations.length - 2} more
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          );
                        default:
                          return (
                            <TableCell key={col.key} className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                              {accountant[col.key as keyof Accountant] as string}
                            </TableCell>
                          );
                      }
                    })}

                    {showActions && (
                      <TableCell className="px-4 py-3 flex gap-2 w-[120px]">
                        <button
                          onClick={() => onEdit(accountant)}
                          className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(accountant)}
                          className="flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-2 text-sm text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
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
              {[5, 10, 25, 50, 100, 250, 500].map((option) => (
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
    </>
  );
}