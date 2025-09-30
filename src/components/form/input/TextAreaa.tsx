import React, { useRef, useEffect } from "react";

interface TextAreaaProps {
  id?: string;
  placeholder?: string;
  rows?: number; // Minimum rows
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
}

const TextAreaa: React.FC<TextAreaaProps> = ({
  id,
  placeholder = "Enter your message",
  rows = 3,
  value = "",
  onChange,
  className = "",
  disabled = false,
  error = false,
  hint = "",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset so shrink works
      textarea.style.overflow = "hidden"; // Prevent scroll
      textarea.style.height = `${textarea.scrollHeight}px`; // Expand to fit content
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e.target.value);
    autoResize();
  };

  useEffect(() => {
    autoResize();
  }, [value]);

  let textareaClasses =
    `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-none transition resize-none ` +
    className;

  if (disabled) {
    textareaClasses +=
      " bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  } else if (error) {
    textareaClasses +=
      " bg-transparent border-red-500 focus:border-red-500 focus:ring focus:ring-red-500/10 dark:border-red-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-red-700";
  } else {
    textareaClasses +=
      " bg-transparent text-gray-900 border-gray-300 focus:border-brand-300 focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";
  }

  return (
    <div className="relative">
      <textarea
        id={id}
        ref={textareaRef}
        placeholder={placeholder}
        rows={rows} // sets minimum height
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
        style={{ overflow: "hidden" }} // ensure no scrollbar
      />
      {hint && (
        <p
          className={`mt-1 text-xs ${
            error ? "text-red-500" : "text-gray-500 dark:text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextAreaa;
