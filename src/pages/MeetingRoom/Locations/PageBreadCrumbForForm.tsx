import { X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/button/Button";

interface PageBreadCrumbForFormProps {
  btnLabel: string;
  pageTitle?: string;
  navigatePath: string;
  isEditing?: boolean;
}

const PageBreadCrumbForForm: React.FC<PageBreadCrumbForFormProps> = ({
  pageTitle,
  btnLabel,
  navigatePath,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-4 mb-6 w-full">
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 cursor-default flex-1 min-w-0 truncate">
        {pageTitle}
      </h2>

      {/* Buttons Container */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          startIcon={<X className="size-4" />}
          onClick={() => navigate(navigatePath)}
          className="whitespace-nowrap"
        >
          {btnLabel}
        </Button>
      </div>
    </div>
  );
};

export default PageBreadCrumbForForm;