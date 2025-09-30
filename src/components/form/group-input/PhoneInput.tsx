import React, { useState } from "react";

interface CountryCode {
  code: string; // e.g. "US"
  label: string; // e.g. "+1"
}

interface PhoneInputProps {
  id?: string;
  countries: CountryCode[];
  phoneNumber: string;
  placeholder?: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  selectPosition?: "start" | "end";
  error?: boolean;
  hint?: string;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  id,
  countries,
  phoneNumber,
  placeholder = "Enter phone number",
  onPhoneNumberChange,
  selectPosition = "start",
  error = false,
  hint,
  className = "",
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(
    countries[0]?.code || "US"
  );

  const countryCodes: Record<string, string> = countries.reduce(
    (acc, { code, label }) => ({ ...acc, [code]: label }),
    {}
  );

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    onPhoneNumberChange(`${countryCodes[newCountry]}${phoneNumber}`);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ""); // digits only
    onPhoneNumberChange(`${countryCodes[selectedCountry]}${onlyNumbers}`);
  };

  return (
    <div className="flex flex-col">
      <div className="relative flex">
        {/* Dropdown position: Start */}
        {selectPosition === "start" && (
          <div className="absolute">
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="cursor-pointer appearance-none rounded-l-lg border-0 border-r border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 
                focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 
                dark:border-gray-800 dark:text-gray-400"
            >
              {countries.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                  className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  {country.code} ({country.label})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Input field (controlled) */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={phoneNumber.replace(countryCodes[selectedCountry], "")} // strip country prefix for display
          onChange={handlePhoneNumberChange}
          placeholder={placeholder}
          className={`dark:bg-dark-900 h-11 w-full ${
            selectPosition === "start" ? "pl-[120px]" : "pr-[120px]"
          } rounded-lg border bg-transparent py-3 px-4 text-sm text-gray-800 
          shadow-theme-xs placeholder:text-gray-400 
          focus:outline-none focus:ring 
          ${error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-400"
            : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800"
          }
          dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`}
        />

        {/* Dropdown position: End */}
        {selectPosition === "end" && (
          <div className="absolute right-0">
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="cursor-pointer appearance-none rounded-r-lg border-0 border-l border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 
                focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 
                dark:border-gray-800 dark:text-gray-400"
            >
              {countries.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                  className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  {country.code} ({country.label})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hint / error message */}
      {hint && (
        <p className={`mt-1 text-xs ${error ? "text-red-500" : "text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
