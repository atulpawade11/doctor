// import PageBreadcrumb from "../components/common/PageBreadCrumb";
// import UserMetaCard from "../components/UserProfile/UserMetaCard";
// import UserInfoCard from "../components/UserProfile/UserInfoCard";
// import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import ProfileForm from "./ProfileForm";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="User Profile | Mann Ka Doctor Admin Dashboard"
        description="View and update your user profile in the Mann Ka Doctor Admin Dashboard, including personal information and account settings."
      />

      {/* <PageBreadcrumb pageTitle="Profile" /> */}
      {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

      {/* <UserMetaCard />
          <UserInfoCard /> */}
      {/* <UserAddressCard /> */}

      <ProfileForm />

    </>
  );
}
