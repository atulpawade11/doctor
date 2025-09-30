import React, { useState, useRef, useEffect, useId } from "react";

interface Option {
  value: string;
  label: string;
  EmpID?: string; // optional extra badge
}

interface SelectProps {
  id?: string;
  options: Option[];
  placeholder?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  className?: string;
  error?: boolean;
  hint?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  id,
  options,
  placeholder = "Select an option",
  selectedValue,
  onValueChange,
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

  // Find the selected option
  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const actualSelectedValue = selectedOption ? selectedOption.value : "";

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
      if (selectedOption) {
        const selectedIndex = filteredOptions.findIndex(
          (option) => option.value === actualSelectedValue
        );
        if (selectedIndex >= 0) {
          setFocusedIndex(selectedIndex);
        }
      }
    }
  }, [isOpen, selectedOption, actualSelectedValue, filteredOptions, disabled]);

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
    onValueChange(value);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
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

  return (
    <div className="relative w-full" ref={selectRef}>
      {/* Hidden native select for form support */}
      <select
        id={selectId}
        className="sr-only"
        value={actualSelectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom select trigger */}
      <div
        className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs flex items-center
          ${error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-400"
            : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
          }
          ${actualSelectedValue
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
        <span className="truncate flex-grow">
          {selectedOption ? (
            <>
              {selectedOption.label}
              {selectedOption.EmpID && (
                <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded">
                  {selectedOption.EmpID}
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer text-sm flex justify-between items-center
                    ${focusedIndex === index
                      ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    ${actualSelectedValue === option.value
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-200"
                      : "text-gray-800 dark:text-white/90"
                    }`}
                  onClick={() => handleOptionSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  role="option"
                  aria-selected={actualSelectedValue === option.value}
                >
                  <span>{option.label}</span>
                  {option.EmpID && (
                    <span className="ml-3 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                      {option.EmpID}
                    </span>
                  )}
                </li>
              ))
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
          className={`mt-1 text-xs ${error ? "text-red-500" : "text-gray-500"}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Select;
