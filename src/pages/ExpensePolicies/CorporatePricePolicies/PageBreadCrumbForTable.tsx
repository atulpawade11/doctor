import { Plus, RefreshCw } from "lucide-react";
import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/button/Button";

interface PageBreadCrumbForTableProps {
  btnLabel: string;
  pageTitle?: string;
  onSearch: (value: string) => void;
  onNavigate: () => void; // Changed from navigatePath to onNavigate function
  onRefresh?: () => void;
  error?: string | null;
}

const PageBreadCrumbForTable: React.FC<PageBreadCrumbForTableProps> = ({
  pageTitle,
  btnLabel,
  onSearch,
  onNavigate, // Use the function instead of path
  onRefresh,
  error,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handleRefresh = () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      onRefresh();
      handleClearSearch();

    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onSearch("");

    // if (onRefresh) {
    //   handleRefresh();
    // }
  };

  console.log(error, "errorerror");
  return (
    <div className="mb-5 -mt-1">
      {/* Error message at the top */}
      {/* {error && (
        <div className="p-3 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-md dark:bg-yellow-900/30 dark:text-yellow-400">
          ⚠️ {error}
        </div>
      )} */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 cursor-default">
            {pageTitle}
          </h2>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 p-2"
            // title="Refresh data"
            >
              <RefreshCw
                className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          )}
        </div>

        {/* 🔹 Search */}
        <div className="hidden lg:block">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  />
                </svg>
              </span>

              <input
                type="text"
                placeholder="Type to search anything..."
                value={searchValue}
                onChange={handleSearch}
                className="dark:bg-dark-900 w-full rounded-lg border border-gray-200 bg-primary 
                           py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs 
                           placeholder:text-gray-400 focus:border-brand-300 focus:outline-none 
                           focus:ring focus:ring-brand-500/10 dark:border-gray-800 
                           dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 
                           dark:placeholder:text-white/30 dark:focus:border-brand-800 
                           xl:w-[430px]"
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center 
                             gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] 
                             text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 
                             dark:bg-white/[0.03] dark:text-gray-400 cursor-pointer
                             hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white 
                             transition-colors duration-200"
                >
                  <span> ⌘ </span>
                  <span> Clear </span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 🔹 Navigate button */}
        <Button
          size="sm"
          variant="outline"
          startIcon={<Plus className="size-5" />}
          onClick={onNavigate} // Use the passed function
        >
          {btnLabel}
        </Button>
      </div>
    </div>
  );
};

export default PageBreadCrumbForTable;