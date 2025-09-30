"use client";

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface News {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  createdDate: string;
}

// Sample data generator for news
const generateSampleNews = (): News[] => {
  const newsTitles = [
    "Company Achieves Record Growth",
    "New Product Launch Announcement",
    "Industry Conference Highlights",
    // "Team Expansion News",
    // "Partnership with Leading Tech Firm",
    // "Sustainability Initiative Launched",
    // "Award Recognition Ceremony",
    // "Community Outreach Program",
    // "Technology Innovation Breakthrough",
    // "Quarterly Financial Results",
  ];

  const descriptions = [
    "Our company has achieved remarkable growth this quarter, exceeding all expectations.",
    "We are excited to announce the launch of our latest product with innovative features.",
    "The recent industry conference provided valuable insights into future opportunities.",
    "We are pleased to announce the expansion of our team with talented professionals.",
    "Our new partnership with a leading technology firm will enhance our service offerings.",
    "We have launched a comprehensive sustainability initiative to reduce our impact.",
    "Our company has been recognized with prestigious awards for excellence in innovation.",
    "Our community outreach program continues to make a positive impact locally.",
    "Our research team has made a significant breakthrough in technology innovation.",
    "We are proud to share our quarterly financial results, showing strong growth.",
  ];

  return newsTitles.map((title, index) => ({
    id: index + 1,
    title,
    description: `<p>${descriptions[index % descriptions.length]}</p>`,
    imageUrl: undefined,
    createdDate: `2025-09-${(index % 30) + 1}`, // Sample created date
  }));
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Helper function to strip HTML tags
const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function News() {
  const navigate = useNavigate();
  const newsList = generateSampleNews();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent News
        </h3>
        <button
          onClick={() => navigate("/all-news")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          See all
        </button>
      </div>

      {/* Scrollable list with sticky header */}
      <div className="max-h-[350px] overflow-y-auto max-w-full overflow-x-hidden">
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
                News
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {newsList.map((news, index) => {
              const plainText = stripHtml(news.description);
              const shortDesc = truncateText(plainText, 100);

              return (
                <TableRow key={news.id}>
                  {/* Sr. Number */}
                  <TableCell className="px-2 py-3 text-gray-600 dark:text-white/90 dark:text-gray-400">
                    {index + 1}.
                  </TableCell>

                  {/* Title + Description + Image + Date */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {/* Always show image */}
                   

                         {news.imageUrl ? (
                              <img
                                src={news.imageUrl}
                                alt={news.title}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}



                      {/* Text Content */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white/90 text-sm mb-1">
                          {news.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-snug">
                          {shortDesc}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                          Created: {news.createdDate}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
