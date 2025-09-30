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
import type { Holiday } from "./holidayType";

type ColumnConfig = {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
};

type TableForHolidaysProps = {
  data: Holiday[];
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
  onEdit: (item: Holiday) => void;
  onDelete: (item: Holiday) => void;
  isLoading: boolean;
};

export default function TableForHolidays({
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
}: TableForHolidaysProps) {

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
                {data.map((holiday, index) => (
                  <TableRow key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                    {showSrNo && (
                      <TableCell className="px-3 py-3 text-left dark:text-white/90 w-[60px] text-sm">
                        {firstItem + index}.
                      </TableCell>
                    )}

                    {columns.map((col) => {
                      if (!col.visible) return null;

                      let cellContent;
                      if (col.key === "date") {
                        cellContent = formatDate(holiday[col.key as keyof Holiday] as string);
                      } else {
                        cellContent = holiday[col.key as keyof Holiday] as string;
                      }

                      return (
                        <TableCell key={col.key} className="px-4 py-3 text-gray-600 text-theme-sm dark:text-gray-400">
                          {cellContent}
                        </TableCell>
                      );
                    })}

                    {showActions && (
                      <TableCell className="px-4 py-3 flex gap-2 w-[120px]">
                        <button
                          onClick={() => onEdit(holiday)}
                          className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                          aria-label="Edit holiday"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(holiday)}
                          className="flex items-center justify-center rounded-full border border-red-300 bg-red-50 p-2 text-sm text-red-600 hover:bg-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                          aria-label="Delete holiday"
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