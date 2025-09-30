import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  // CalenderIcon,
  // CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  // PageIcon,
  // PageIcon,
  // ListIcon,
  // PageIcon,
  PieChartIcon,
  PlugInIcon,
  // TableIcon,
  GroupIcon,
  ShootingStarIcon,
  ChatIcon,
  DocsIcon,
  TimeIcon,
  FolderIcon,
  PaperPlaneIcon,
  TaskIcon,
  LockIcon,
  BoltIcon,
  VideoIcon,
  AlertHexaIcon,
  InfoIcon,
  DollarLineIcon,
  MailIcon,
  // UserCircleIcon,
  // UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  // {
  //   icon: <GridIcon />,
  //   name: "Dashboard",
  //   subItems: [{ name: "Ecommerce", path: "/home", pro: false }],
  // },


  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/home",
  },

  {
    name: "Employees",
    icon: <GroupIcon />,
    subItems: [
      { name: "Departments", path: "/all-departments", pro: false },
      { name: "Designations", path: "/all-designations", pro: false },
      { name: "All Employees", path: "/all-employees", pro: false },

    ],
  },
  {
    icon: <ListIcon />,
    name: "Walls",
    path: "/all-walls",
  },

  {
    icon: <VideoIcon />,
    name: "Notices",
    path: "/all-notices",
  },

  {
    icon: <BoxCubeIcon />,
    name: "Policies",
    path: "/all-policies",
  },

  {
    icon: <AlertHexaIcon />,
    name: "ERN",
    path: "/all-emergency-response-network",
  },
  {
    icon: <PieChartIcon />,
    name: "Holidays",
    path: "/all-holidays",
  },

  {
    icon: <PlugInIcon />,
    name: "Products",
    path: "/all-products",
  },

  {
    icon: <ShootingStarIcon />,
    name: "Quotes Of The Day",
    path: "/all-quotes",
  },

  {
    icon: <ChatIcon />,
    name: "Messages",
    path: "/all-messages",
  },

  {
    icon: <DocsIcon />,
    name: "News",
    path: "/all-news",
  },

  {
    icon: <TimeIcon />,
    name: "Events",
    path: "/all-events",
  },

  {
    icon: <FolderIcon />,
    name: "Photo Galleries",
    path: "/all-photo-galleries",
  },

  {
    icon: <PaperPlaneIcon />,
    name: "Chorei Messages",
    path: "/all-chorei-messages",
  },

  {
    icon: <HorizontaLDots />,
    name: "Slider Images",
    path: "/all-slider-images",
  },
  {
    icon: <TaskIcon />,
    name: "Popup Images",
    path: "/all-popup-images",
  },

  {
    icon: <LockIcon />,
    name: "Login Details",
    path: "/all-login-details",
  },


  {
    name: "Expense Policy",
    icon: <MailIcon />,
    subItems: [
      { name: "Sales Price Policy", path: "/all-sales-price-policies", pro: false },
      // { name: "Corporate Policy", path: "/all-floors", pro: false },
    ],
  },




  {
    name: "Meeting Room",
    icon: <BoltIcon />,
    subItems: [
      { name: "Locations", path: "/all-locations", pro: false },
      { name: "Floors", path: "/all-floors", pro: false },
      { name: "Rooms", path: "/all-rooms", pro: false },
      { name: "Meeting Requests", path: "/all-meeting-requests", pro: false },
      { name: "Meeting Notifications", path: "/all-meeting-notifications", pro: false },
    ],
  },
  {
    name: "Support",
    icon: <InfoIcon />,
    subItems: [
      { name: "Groups", path: "/all-groups", pro: false },
      { name: "Category", path: "/all-categories", pro: false },
      { name: "Priority", path: "/all-priorities", pro: false },
      { name: "City", path: "/all-cities", pro: false },

    ],
  },
  {
    name: "Expenses",
    icon: <DollarLineIcon />,
    subItems: [

      { name: "Auditor", path: "/all-auditors", pro: false },
      { name: "Accountat", path: "/all-accountants", pro: false },
      { name: "Unit", path: "/all-units", pro: false },
      { name: "Zone", path: "/all-zones", pro: false },
      { name: "Currency", path: "/all-currencies", pro: false },
      { name: "All Claims", path: "/all-corporate-claims", pro: false },


    ],
  },














  // {
  //   icon: <CalenderIcon />,
  //   name: "Calendar",
  //   path: "/calendar",
  // },
  // {
  //   icon: <UserCircleIcon />,
  //   name: "User Profile",
  //   path: "/profile",
  // },
  // {
  //   name: "Forms",
  //   icon: <ListIcon />,
  //   subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  // },
  // {
  //   name: "Tables",
  //   icon: <TableIcon />,
  //   subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  // },
  // {
  //   name: "Pages",
  //   icon: <PageIcon />,
  //   subItems: [
  //     { name: "Blank Page", path: "/blank", pro: false },
  //     { name: "404 Error", path: "/error-404", pro: false },
  //   ],
  // },
  // {
  //   icon: <PieChartIcon />,
  //   name: "Charts",
  //   subItems: [
  //     { name: "Line Chart", path: "/line-chart", pro: false },
  //     { name: "Bar Chart", path: "/bar-chart", pro: false },
  //   ],
  // },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "UI Elements",
  //   subItems: [
  //     { name: "Alerts", path: "/alerts", pro: false },
  //     { name: "Avatar", path: "/avatars", pro: false },
  //     { name: "Badge", path: "/badge", pro: false },
  //     { name: "Buttons", path: "/buttons", pro: false },
  //     // { name: "Images", path: "/images", pro: false },
  //     // { name: "Videos", path: "/videos", pro: false },
  //   ],
  // },


];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  // const isActive = useCallback(
  //   (path: string) => location.pathname === path,
  //   [location.pathname]
  // );

  const isActive = useCallback(
    (path: string) => {
      const current = location.pathname.toLowerCase();

      // ✅ Keywords for Employees section
      const employeesKeywords = ["all-employees", "add-edit-employee"];

      // ✅ Keywords for Departments section
      const departmentsKeywords = ["all-departments", "add-edit-department"];

      // ✅ Keywords for Designations section
      const designationsKeywords = ["all-designations", "add-edit-designation"];

      // ✅ Keywords for Walls section
      const wallsKeywords = ["all-walls", "add-edit-wall"];

      // ✅ Keywords for Notices section
      const noticesKeywords = ["all-notices", "add-edit-notice"];

      // ✅ Keywords for Policies section
      const policiesKeywords = ["all-policies", "add-edit-policy"];

      // ✅ Keywords for emergency-response-network section
      const ernKeywords = ["all-emergency-response-network", "add-edit-emergency-response-network"];

      // ✅ Keywords for Holidays section
      const holidaysKeywords = ["all-holidays", "add-edit-holiday"];

      // ✅ Keywords for Products section
      const productsKeywords = ["all-products", "add-edit-product"];

      // ✅ Keywords for Quotes section
      const quotesKeywords = ["all-quotes", "add-edit-quote"];

      // ✅ Keywords for Messages  section
      const messagesKeywords = ["all-messages", "add-edit-message"];

      // ✅ Keywords for News  section
      const newsKeywords = ["all-news", "add-edit-news"];

      // ✅ Keywords for Events  section
      const eventsKeywords = ["all-events", "add-edit-event"];

      // ✅ Keywords for Photo Galleries  section
      const photoGalleriesKeywords = ["all-photo-galleries", "add-edit-photo-gallery"];

      // ✅ Keywords for Chorei Messages  section
      const choreiMessagesKeywords = ["all-chorei-messages", "add-edit-chorei-message"];

      // ✅ Keywords for Slider Images  section 
      const sliderImagesKeywords = ["all-slider-images", "add-edit-slider-image"];

      // ✅ Keywords for Popup Images  section  
      const popupImagesKeywords = ["all-popup-images", "add-edit-popup-image"];

      // ✅ Keywords for Locations  section  
      const locationsKeywords = ["all-locations", "add-edit-location"];

      // ✅ Keywords for Floors  section  
      const floorsKeywords = ["all-floors", "add-edit-floor"];

      // ✅ Keywords for Rooms  section  
      const roomsKeywords = ["all-rooms", "add-edit-room"];

      // ✅ Keywords for Meeting Notifications  section  
      const meetingNotificationKeywords = ["all-meeting-notifications", "add-edit-meeting-notification"];

      // ✅ Keywords for Groups section  
      const groupKeywords = ["all-groups", "add-edit-group"];

      // ✅ Keywords for Category section  
      const categoryKeywords = ["all-categories", "add-edit-category"];

      // ✅ Keywords for Priority section  
      const priorityKeywords = ["all-priorities", "add-edit-priority"];

      // ✅ Keywords for City section  
      const cityKeywords = ["all-cities", "add-edit-city"];

      // ✅ Keywords for Unit section  
      const unitKeywords = ["all-units", "add-edit-uniit"];

      // ✅ Keywords for Zone section  
      const zoneKeywords = ["all-zones", "add-edit-zone"];

      // ✅ Keywords for Currency section  
      const currencyKeywords = ["all-currencies", "add-edit-currency"];

      // ✅ Keywords for Auditors section  
      const auditorsKeywords = ["all-auditors", "add-edit-auditor"];

      // ✅ Keywords for Accountant section  
      const accountantKeywords = ["all-accountants", "add-edit-accountant"];

      // ✅ Keywords for DeleteClaims section  
      const claimsKeywords = ["all-corporate-claims", "all-sales-claims"];

      // ✅ Keywords for expensePricePolicy section  
      const expensePricePolicy = ["all-sales-price-policies", "add-edit-sales-policy"];








      // If checking Employees tab
      if (path === "/all-employees") {
        return employeesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Departments tab
      if (path === "/all-departments") {
        return departmentsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Designations tab
      if (path === "/all-designations") {
        return designationsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Walls tab
      if (path === "/all-walls") {
        return wallsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Notices tab
      if (path === "/all-notices") {
        return noticesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Policies tab
      if (path === "/all-policies") {
        return policiesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking ERP tab
      if (path === "/all-emergency-response-network") {
        return ernKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Holidays tab
      if (path === "/all-holidays") {
        return holidaysKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Products tab
      if (path === "/all-products") {
        return productsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Quotes tab
      if (path === "/all-quotes") {
        return quotesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Messages tab
      if (path === "/all-messages") {
        return messagesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking News tab
      if (path === "/all-news") {
        return newsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Events tab
      if (path === "/all-events") {
        return eventsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Photo Galleries tab
      if (path === "/all-photo-galleries") {
        return photoGalleriesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Chorei Messages tab
      if (path === "/all-chorei-messages") {
        return choreiMessagesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Slider Images tab
      if (path === "/all-slider-images") {
        return sliderImagesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Popup Images tab
      if (path === "/all-popup-images") {
        return popupImagesKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking locations tab
      if (path === "/all-locations") {
        return locationsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking floors tab
      if (path === "/all-floors") {
        return floorsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking rooms tab
      if (path === "/all-rooms") {
        return roomsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Meeting Notification tab
      if (path === "/all-meeting-notifications") {
        return meetingNotificationKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Group tab
      if (path === "/all-groups") {
        return groupKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Category tab
      if (path === "/all-categories") {
        return categoryKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Priority tab
      if (path === "/all-priorities") {
        return priorityKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking City tab
      if (path === "/all-cities") {
        return cityKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Unit tab
      if (path === "/all-units") {
        return unitKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Zone tab
      if (path === "/all-zones") {
        return zoneKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Currency tab
      if (path === "/all-currencies") {
        return currencyKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Auditors tab
      if (path === "/all-auditors") {
        return auditorsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Accountant tab
      if (path === "/all-accountants") {
        return accountantKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Corporate Claims tab
      if (path === "/all-corporate-claims") {
        return claimsKeywords.some((keyword) => current.includes(keyword));
      }

      // If checking Expense Price Policy tab
      if (path === "/all-sales-price-policies") {
        return expensePricePolicy.some((keyword) => current.includes(keyword));
      }








      // Default check: exact match or contains path
      return current === path.toLowerCase() || current.includes(path.toLowerCase());
    },
    [location.pathname]
  );


  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`
        fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen
        transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px] max-2xl:w-[230px]"  // 👈 width changes for <=1399px
          : isHovered
            ? "w-[290px] max-2xl:w-[170px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/home">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
