import { X, Upload } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/button/Button";
import UploadInBulkModal from "./UploadInBulkModal";

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
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 cursor-default flex-1 min-w-0">
        {pageTitle}
      </h2>

      {/* Buttons Container */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {!isEditing && (
          <Button
            size="sm"
            variant="primary"
            startIcon={<Upload className="size-4" />}
            onClick={() => setIsBulkUploadOpen(true)}
          >
            Upload in Bulk
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          startIcon={<X className="size-4" />}
          onClick={() => navigate(navigatePath)}
        >
          {btnLabel}
        </Button>
      </div>

      <UploadInBulkModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />
    </div>
  );
};

export default PageBreadCrumbForForm;