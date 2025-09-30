import React, { useState, useRef, useEffect, useId } from "react";

interface Option {
  value: string;
  label: string;
  EmpID?: string; // optional extra badge
}

interface MultiSelectProps {
  id?: string;
  options: Option[];
  placeholder?: string;
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  className?: string;
  error?: boolean;
  hint?: string;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  options,
  placeholder = "Select options",
  selectedValues,
  onValuesChange,
  className = "",
  error = false,
  hint,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Filter options
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search when open
  useEffect(() => {
    if (isOpen && inputRef.current && !disabled) {
      inputRef.current.focus();
      setFocusedIndex(0);
    }
  }, [isOpen, disabled]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && focusedIndex >= 0) {
      const items = listboxRef.current.querySelectorAll("li");
      if (items[focusedIndex]) {
        items[focusedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelectToggle = () => {
    if (disabled) return;
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (!newIsOpen) {
      setSearchTerm("");
      setFocusedIndex(-1);
    }
  };

  const handleOptionSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    
    onValuesChange(newSelectedValues);
    setSearchTerm("");
  };

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedValues = selectedValues.filter((v) => v !== value);
    onValuesChange(newSelectedValues);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFocusedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleOptionSelect(filteredOptions[focusedIndex].value);
        }
        break;
      case "Tab":
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
    }
  };

  // Get selected options
  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.value)
  );

  return (
    <div className="relative w-full" ref={selectRef}>
      {/* Hidden native select for form support */}
      <select
        id={selectId}
        className="sr-only"
        value={selectedValues}
        onChange={(e) => {
          const values = Array.from(e.target.selectedOptions, option => option.value);
          onValuesChange(values);
        }}
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
        multiple
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            selected={selectedValues.includes(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom select trigger */}
      <div
        className={`min-h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs flex items-center flex-wrap gap-2
          ${error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-400"
            : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
          }
          ${selectedValues.length > 0
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
          }
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "cursor-pointer"}
          dark:bg-gray-900 ${className}`}
        onClick={handleSelectToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={selectId}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <div
              key={option.value}
              className="group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800"
            >
              <span className="flex-initial max-w-full">
                {option.label}
                {option.EmpID && ` (${option.EmpID})`}
              </span>
              <div className="flex flex-row-reverse flex-auto">
                <div
                  onClick={(e) => removeOption(option.value, e)}
                  className="pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400"
                >
                  <svg
                    className="fill-current"
                    role="button"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))
        ) : (
          <span className="truncate flex-grow">{placeholder}</span>
        )}
        
        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-theme-xs overflow-hidden top-full">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Options */}
          <ul
            ref={listboxRef}
            className="max-h-60 overflow-y-auto py-1"
            role="listbox"
            aria-labelledby={selectId}
            aria-multiselectable="true"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <li
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer text-sm flex justify-between items-center
                      ${focusedIndex === index
                        ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                      ${isSelected
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-200"
                        : "text-gray-800 dark:text-white/90"
                      }`}
                    onClick={() => handleOptionSelect(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        checked={isSelected}
                        readOnly
                      />
                      <span>{option.label}</span>
                    </div>
                    {option.EmpID && (
                      <span className="ml-3 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                        {option.EmpID}
                      </span>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Error hint */}
      {hint && (
        <p
          className={`mt-1 text-xs ${error ? "text-red-500" : "text-gray-500"
            }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;