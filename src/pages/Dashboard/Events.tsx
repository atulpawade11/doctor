"use client";

import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
}

// Sample data generator for events
const generateSampleEvents = (): Event[] => {
  const eventTitles = [
    "Annual Tech Conference",
    "Product Launch Event",
    "Industry Networking Night",
    // "Team Building Workshop",
    // "Customer Appreciation Day",
    // "Sustainability Summit",
    // "Awards Gala",
    // "Community Outreach Event",
    // "Technology Demo Day",
    // "Quarterly Review Meeting",
    // "Employee Wellness Seminar",
    // "Client Success Stories Night",
    // "Market Expansion Announcement",
    // "Research Symposium",
    // "Leadership Conference",
    // "Corporate Social Responsibility Day",
    // "Digital Transformation Workshop",
    // "Quality Assurance Forum",
    // "Partner Summit",
    // "Industry Trends Analysis",
    // "Workplace Safety Training",
    // "Professional Development Conference",
    // "Product Quality Review",
    // "Customer Support Training",
    // "Strategic Partnership Announcement",
    // "Innovation Showcase",
    // "Environmental Sustainability Conference",
    // "Employee Recognition Ceremony",
    // "Technology Upgrade Symposium",
    // "Future Growth Strategy Meeting",
  ];

  const descriptions = [
    "Join us for our annual technology conference featuring industry leaders and innovative presentations.",
    "Be the first to experience our latest product innovations at our exclusive launch event.",
    "Network with industry professionals and expand your business connections at our networking night.",
    "Participate in team-building activities designed to strengthen collaboration and communication.",
    "We're celebrating our valued customers with a special appreciation day filled with activities and rewards.",
    "Learn about sustainable practices and environmental initiatives at our sustainability summit.",
    "Celebrate excellence and achievement at our annual awards gala honoring outstanding contributions.",
    "Join us in giving back to the community through our outreach programs and volunteer activities.",
    "Experience live demonstrations of our latest technological advancements and innovations.",
    "Review our quarterly performance and discuss future strategies at our review meeting.",
    "Focus on health and wellness with seminars and activities designed to promote work-life balance.",
    "Hear inspiring stories from our clients about their success journeys with our solutions.",
    "Learn about our expansion into new markets and the opportunities this creates for our partners.",
    "Explore the latest research findings and technological breakthroughs at our research symposium.",
    "Gather with leaders from across the industry to discuss trends, challenges, and opportunities.",
    "Participate in our CSR initiatives focused on making a positive impact on society and the environment.",
    "Learn about digital transformation strategies and how they can benefit your organization.",
    "Discuss quality standards, best practices, and improvement strategies at our QA forum.",
    "Connect with our partners and explore collaboration opportunities at our annual partner summit.",
    "Gain insights into current industry trends and future market directions from expert analysts.",
    "Enhance workplace safety knowledge and practices through comprehensive training sessions.",
    "Advance your professional skills and career development through specialized training programs.",
    "Review our product quality improvements and provide feedback for future enhancements.",
    "Learn about our enhanced customer support services and how they can benefit your organization.",
    "Announce new strategic partnerships and explore collaborative opportunities for growth.",
    "Showcase innovative solutions and cutting-edge technologies at our innovation event.",
    "Discuss environmental sustainability practices and strategies for reducing ecological impact.",
    "Recognize and celebrate the outstanding achievements of our employees at this special ceremony.",
    "Learn about our technology infrastructure upgrades and their benefits for performance and security.",
    "Discuss future growth strategies and expansion opportunities in emerging markets.",
  ];

  // Generate dates for the next 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  return eventTitles.map((title, index) => ({
    id: index + 1,
    title,
    description: `<p>${descriptions[index % descriptions.length]}</p>`,
    imageUrl: undefined,
    date: dates[index % dates.length],
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

export default function Events() {
  const navigate = useNavigate();
  const eventsList = generateSampleEvents();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Upcoming Events
        </h3>
        <button
          onClick={() => navigate("/all-events")}
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
                Event
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {eventsList.map((event, index) => {
              const plainText = stripHtml(event.description);
              const shortDesc = truncateText(plainText, 100);

              return (
                <TableRow key={event.id}>
                  {/* Sr. Number */}
                  <TableCell className="px-2 py-3 text-gray-600 dark:text-white/90 dark:text-gray-400">
                    {index + 1}.
                  </TableCell>

                  {/* Title + Description + Image + Date */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {/* Always show image placeholder */}
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
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
                          {event.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs leading-snug">
                          {shortDesc}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                          Date: {event.date}
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
