"use client";

import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface EmployeeBirthday {
  id: number;
  name: string;
  designation: string;
  date: string;
  image?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
};

const sortBirthdays = (data: EmployeeBirthday[]): EmployeeBirthday[] => {
  const today = new Date();
  return data.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    dateA.setFullYear(today.getFullYear());
    dateB.setFullYear(today.getFullYear());

    return dateA.getTime() - dateB.getTime();
  });
};

const employeeData: EmployeeBirthday[] = [
  { id: 1, name: "Alice Johnson", designation: "UI/UX Designer", date: "2025-09-16", image: "/images/employees/emp-01.jpg" },
  { id: 2, name: "Michael Smith", designation: "Frontend Developer", date: "2025-09-18", image: "/images/employees/emp-02.jpg" },
  { id: 3, name: "Sophia Lee", designation: "Backend Engineer", date: "2025-09-20", image: "/images/employees/emp-03.jpg" },
  { id: 4, name: "Daniel Brown", designation: "HR Manager", date: "2025-09-22", image: "/images/employees/emp-04.jpg" },
  { id: 5, name: "Emma Wilson", designation: "Project Manager", date: "2025-09-25", image: "/images/employees/emp-05.jpg" },
  { id: 6, name: "James Anderson", designation: "QA Analyst", date: "2025-09-28", image: "/images/employees/emp-06.jpg" },
  { id: 7, name: "Olivia Martinez", designation: "Data Scientist", date: "2025-10-02", image: "/images/employees/emp-07.jpg" },
  { id: 8, name: "William Taylor", designation: "DevOps Engineer", date: "2025-10-05", image: "/images/employees/emp-08.jpg" },
  { id: 9, name: "Charlotte White", designation: "Marketing Lead", date: "2025-10-07", image: "/images/employees/emp-09.jpg" },
  { id: 10, name: "Benjamin Hall", designation: "Product Owner", date: "2025-10-09", image: "/images/employees/emp-10.jpg" },
  { id: 11, name: "Ava Clark", designation: "Business Analyst", date: "2025-10-12", image: "/images/employees/emp-11.jpg" },
  { id: 12, name: "Lucas Young", designation: "Fullstack Developer", date: "2025-10-15", image: "/images/employees/emp-12.jpg" },
];

export default function UpcomingBirthdays() {
  const navigate = useNavigate();
  const sortedEmployees = sortBirthdays(employeeData);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Upcoming Birthdays
        </h3>
        <button
          onClick={() => navigate("/all-employees")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          See all
        </button>
      </div>


      {/* Scrollable table with sticky header */}
      <div className="max-h-[430px] overflow-y-auto max-w-full overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">

            <TableRow>
              <TableCell
                isHeader
                className="px-2 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400 w-[35px]"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400"
              >
                Employee
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="[&>tr:first-child]:border-t-0 divide-y divide-gray-100 dark:divide-gray-800">

            {sortedEmployees.map((employee, index) => (
              <TableRow key={employee.id}>
                <TableCell className="px-2 py-3 text-gray-600 dark:text-white/90 dark:text-gray-400">
                  {index + 1}.
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {employee.image ? (
                      <img
                        src={employee.image}
                        alt={employee.name}
                        className="w-9 h-9 rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 items-center justify-center ${employee.image ? "hidden" : "flex"
                        }`}
                    >
                      <User size={20} />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {employee.name}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {employee.designation}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatDate(employee.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
