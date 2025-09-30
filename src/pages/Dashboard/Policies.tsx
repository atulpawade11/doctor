"use client";

import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// Interface for policy data
interface Policy {
  id: number;
  title: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

// Sample data generator for policies
const generateSamplePolicies = (): Policy[] => {
  const policyTitles = [
    "Code of Conduct", "Data Protection Policy", "Remote Work Policy",
    "Leave Policy", "Expense Reimbursement Policy", 
  ];

  return policyTitles.map((title, index) => ({
    id: index + 1,
    title,
    fileUrl: `/policies/sample-policy-${index + 1}.pdf`,
    fileName: `policy-${index + 1}.pdf`,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    ).toISOString(),
  }));
};

export default function Policies() {
  const navigate = useNavigate();
  const policies = generateSamplePolicies();

  // open PDF in new tab
  const onViewPdf = (policy: Policy) => {
    window.open(policy.fileUrl, "_blank");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Company Policies
        </h3>
        <button
          onClick={() => navigate("/all-policies")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          See all
        </button>
      </div>

      {/* Scrollable table with sticky header */}
      <div className="max-h-[350px] overflow-y-auto max-w-full overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[35px]"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Policy
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Created At
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {policies.map((policy, index) => (
              <TableRow key={policy.id}>
                {/* Sr. Number */}
                <TableCell className="px-2 py-3 text-gray-600 dark:text-white/90 dark:text-gray-400">
                  {index + 1}.
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-800 text-theme-sm dark:text-white/90">
                  {policy.title}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(policy.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}{" "}
                  {new Date(policy.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <button
                    onClick={() => onViewPdf(policy)}
                    className="flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-sm text-gray-700 hover:bg-gray-100 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                    aria-label="View PDF"
                  >
                    <FileText size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
