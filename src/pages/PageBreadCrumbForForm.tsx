import { Key, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/button/Button";
import ChangePasswordModal from "./ChangePasswordModal";

interface PageBreadCrumbForFormProps {
  btnLabel: string;
  pageTitle?: string;
  navigatePath: string;
}

const PageBreadCrumbForForm: React.FC<PageBreadCrumbForFormProps> = ({
  pageTitle,
  btnLabel,
  navigatePath,
}) => {
  const navigate = useNavigate();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 cursor-default flex-1 min-w-0">
        {pageTitle}
      </h2>

      {/* Buttons Container */}
      <div className="flex items-center gap-3 flex-shrink-0">


   <Button
            size="sm"
            variant="primary"
            startIcon={<Key className="size-4" />}
            onClick={() => setIsChangePasswordOpen(true)}
          >
           Change Password
          </Button>




        <Button
          size="sm"
          variant="outline"
          startIcon={<X className="size-4" />}
          onClick={() => navigate(navigatePath)}
        >
          {btnLabel}
        </Button>
      </div>


        <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />


    </div>

  );
};

export default PageBreadCrumbForForm;