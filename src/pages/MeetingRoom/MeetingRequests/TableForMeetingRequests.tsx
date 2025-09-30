import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Alert from "../../../components/ui/alert/Alert";
import CentralizedLoader from "../../../components/common/CentralizedLoader";
import type { MeetingRequest } from "./meetingRequestType";
import { Pencil } from "lucide-react";

type ColumnConfig = {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
};

type Props = {
  data: MeetingRequest[];
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
  isLoading: boolean;
  onActionClick: (item: MeetingRequest) => void;
};

export default function TableForMeetingRequests({
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
  isLoading = false,
  onActionClick,
}: Props) {
  if (totalRecords === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] flex flex-col">
        <div className="p-5">
          <Alert
            variant="info"
            title="No Meeting Requests Found"
            message="There are no meeting requests available at the moment."
            showLink={false}
          />
        </div>
      </div>
    );
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <>
      <CentralizedLoader isLoading={isLoading} message="Loading meeting requests..." />

      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
            <Table className="w-full table-auto border-collapse">
              <TableHeader className="sticky top-0 z-10 border-b border-gray-100 bg-white dark:bg-gray-900">
                <TableRow>
                  {showSrNo && (
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-left w-[60px]">
                      #
                    </TableCell>
                  )}
                  {columns.filter((c) => c.visible).map((col) => (
                    <TableCell
                      key={col.key}
                      isHeader
                      className="px-4 py-3 font-medium text-gray-500 text-left text-sm"
                    >
                      {col.label}
                    </TableCell>
                  ))}
                  <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-left text-sm">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100">
                {data.map((item, index) => (
                  <TableRow key={item.id}>
                    {showSrNo && (
                      <TableCell className="px-3 py-3 text-sm">{firstItem + index}.</TableCell>
                    )}
                    {columns.map((col) => {
                      if (!col.visible) return null;
                      const raw = item[col.key as keyof MeetingRequest];
                      let value = typeof raw === "string" ? raw : String(raw);

                      if (col.key === "timings") value = formatDateTime(String(raw));
                      if (col.key === "status") {
                        return (
                          <TableCell key={col.key} className="px-4 py-3 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {item.status}
                            </span>
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={col.key} className="px-4 py-3 text-sm text-gray-700">
                          {value}
                        </TableCell>
                      );
                    })}
                    <TableCell className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onActionClick(item)}
                        className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                        aria-label="Edit meeting request"
                      >
                        <Pencil size={16} />
                      </button>
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
            Showing <strong>{firstItem}</strong> to <strong>{lastItem}</strong> of{" "}
            <strong>{totalFiltered}</strong> entries
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
