import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";

// Authentication Pages
import SignIn from "./pages/AuthPages/SignIn";
import ResetPassword from "./components/auth/ResetPassword";

// Main Pages
import Home from "./pages/Dashboard/Home";
import UserProfiles from "./pages/UserProfiles";
import NotFound from "./pages/OtherPage/NotFound";

// Employee Management
import AllEmployees from "./pages/Employees/AllEmployees/AllEmployees";
import AddOrEditFormPageEmployee from "./pages/Employees/AllEmployees/AddOrEditFormPage";
import Departments from "./pages/Employees/Departments/Departments";
import AddOrEditFormPageDepartment from "./pages/Employees/Departments/AddOrEditFormPage";
import Designations from "./pages/Employees/Designations/Designations";
import AddOrEditFormPageDesignation from "./pages/Employees/Designations/AddOrEditFormPage";

// Content Management
import Walls from "./pages/Wall/Wall/Walls";
import AddOrEditFormPageWall from "./pages/Wall/Wall/AddOrEditFormPage";
import Notices from "./pages/Notice/Notice/Notice";
import AddOrEditFormPageNotice from "./pages/Notice/Notice/AddOrEditFormPage";
import Policies from "./pages/Policies/Policies/Policies";
import AddOrEditFormPagePolicies from "./pages/Policies/Policies/AddOrEditFormPage";
import Holidays from "./pages/Holidays/Holidays/Holidays";
import AddOrEditFormPageHolidays from "./pages/Holidays/Holidays/AddOrEditFormPage";
import Products from "./pages/Products/Products/Products";
import AddOrEditFormPageProducts from "./pages/Products/Products/AddOrEditFormPage";
import QuoteOfTheDay from "./pages/QuoteOfTheDay/QuoteOfTheDay/QuoteOfTheDay";
import AddOrEditFormPageQuoteOfTheDay from "./pages/QuoteOfTheDay/QuoteOfTheDay/AddOrEditFormPage";
import Messages from "./pages/Messages/Messages/Messages";
import AddOrEditFormPageMessages from "./pages/Messages/Messages/AddOrEditFormPage";
import News from "./pages/News/News/News";
import AddOrEditFormPageNews from "./pages/News/News/AddOrEditFormPage";
import Events from "./pages/Events/Events/Events";
import AddOrEditFormPageEvents from "./pages/Events/Events/AddOrEditFormPage";
import PhotoGalleries from "./pages/PhotoGallery/PhotoGallery/PhotoGallery";
import AddOrEditFormPagePhotoGalleries from "./pages/PhotoGallery/PhotoGallery/AddOrEditFormPage";
import ChoreiMessages from "./pages/ChoreiMessage/ChoreiMessage/ChoreiMessage";
import AddOrEditFormPageChoreiMessages from "./pages/ChoreiMessage/ChoreiMessage/AddOrEditFormPage";
import SliderImages from "./pages/SliderImages/SliderImages/SliderImages";
import AddOrEditFormPageSliderImages from "./pages/SliderImages/SliderImages/AddOrEditFormPage";
import PopupImages from "./pages/PopupImages/PopupImages/PopupImages";
import AddOrEditFormPagePopupImages from "./pages/PopupImages/PopupImages/AddOrEditFormPage";

// System Management
import LoginDetails from "./pages/LoginDetails/LoginDetails/LoginDetails";

// Meeting Room Management
import Locations from "./pages/MeetingRoom/Locations/Locations";
import AddOrEditFormPageLocations from "./pages/MeetingRoom/Locations/AddOrEditFormPage";
import Floors from "./pages/MeetingRoom/Floors/Floors";
import AddOrEditFormPageFloors from "./pages/MeetingRoom/Floors/AddOrEditFormPage";
import Rooms from "./pages/MeetingRoom/Rooms/Rooms";
import AddOrEditFormPageRooms from "./pages/MeetingRoom/Rooms/AddOrEditFormPage";
import MeetingRequests from "./pages/MeetingRoom/MeetingRequests/MeetingRequests";
import MeetingNotifications from "./pages/MeetingRoom/MeetingNotifications/MeetingNotifications";
import AddOrEditFormPageMeetingNotifications from "./pages/MeetingRoom/MeetingNotifications/AddOrEditFormPage";

// Emergency Management
import EmergencyResponseNetwork from "./pages/EmergencyResponseNetwork/EmergencyResponseNetwork/EmergencyResponseNetwork";
import AddOrEditFormPageEmergencyResponseNetwork from "./pages/EmergencyResponseNetwork/EmergencyResponseNetwork/AddOrEditFormPage";

// Support Management
import Groups from "./pages/Support/Groups/Groups";
import AddOrEditFormPageGroups from "./pages/Support/Groups/AddOrEditFormPage";
import Category from "./pages/Support/Category/Category";
import AddOrEditFormPageCategory from "./pages/Support/Category/AddOrEditFormPage";
import Priority from "./pages/Support/Priority/Priority";
import AddOrEditFormPagePriority from "./pages/Support/Priority/AddOrEditFormPage";
import City from "./pages/Support/City/City";
import AddOrEditFormPageCity from "./pages/Support/City/AddOrEditFormPage";

// Expense Management
import Unit from "./pages/Expense/Unit/Unit";
import AddOrEditFormPageUnit from "./pages/Expense/Unit/AddOrEditFormPage";
import Zone from "./pages/Expense/Zone/Zone";
import AddOrEditFormPageZone from "./pages/Expense/Zone/AddOrEditFormPage";
import Currency from "./pages/Expense/Currency/Currency";
import AddOrEditFormPageCurrency from "./pages/Expense/Currency/AddOrEditFormPage";
import AllAuditors from "./pages/Expense/Auditor/AllAuditors";
import AddOrEditFormPageAllAuditors from "./pages/Expense/Auditor/AddOrEditFormPage";
import AllAccountants from "./pages/Expense/Accountant/AllAccountants";
import AddOrEditFormPageAllAccountants from "./pages/Expense/Accountant/AddOrEditFormPage";
import AllCorporateClaims from "./pages/Expense/AllClaims/CorporateClaims/CorporateClaims";
import AllSalesClaims from "./pages/Expense/AllClaims/SalesClaims/SalesClaims";

// Expense Policies
import AllSalesPricePolicy from "./pages/ExpensePolicies/SalesPricePolicies/SalesPricePolicies";
import AddOrEditFormPageSalesPricePolicy from "./pages/ExpensePolicies/SalesPricePolicies/AddOrEditFormPage";

// Route configuration structure
const routeConfigs = {
  // Public routes (no authentication required)
  public: [
    { path: "/signin", element: <SignIn /> },
    { path: "/reset-password", element: <ResetPassword /> },
  ],

  // Protected routes (wrapped with AppLayout)
  protected: [
    // Dashboard & Profile
    { path: "/home", element: <Home /> },
    { path: "/profile", element: <UserProfiles /> },

    // Employee Management
    { path: "/all-employees", element: <AllEmployees /> },
    { path: "/add-edit-employee", element: <AddOrEditFormPageEmployee /> },
    { path: "/all-departments", element: <Departments /> },
    { path: "/add-edit-department", element: <AddOrEditFormPageDepartment /> },
    { path: "/all-designations", element: <Designations /> },
    { path: "/add-edit-designation", element: <AddOrEditFormPageDesignation /> },

    // Content Management
    { path: "/all-walls", element: <Walls /> },
    { path: "/add-edit-wall", element: <AddOrEditFormPageWall /> },
    { path: "/all-notices", element: <Notices /> },
    { path: "/add-edit-notice", element: <AddOrEditFormPageNotice /> },
    { path: "/all-policies", element: <Policies /> },
    { path: "/add-edit-policy", element: <AddOrEditFormPagePolicies /> },
    { path: "/all-holidays", element: <Holidays /> },
    { path: "/add-edit-holiday", element: <AddOrEditFormPageHolidays /> },
    { path: "/all-products", element: <Products /> },
    { path: "/add-edit-product", element: <AddOrEditFormPageProducts /> },
    { path: "/all-quotes", element: <QuoteOfTheDay /> },
    { path: "/add-edit-quote", element: <AddOrEditFormPageQuoteOfTheDay /> },
    { path: "/all-messages", element: <Messages /> },
    { path: "/add-edit-message", element: <AddOrEditFormPageMessages /> },
    { path: "/all-news", element: <News /> },
    { path: "/add-edit-news", element: <AddOrEditFormPageNews /> },
    { path: "/all-events", element: <Events /> },
    { path: "/add-edit-event", element: <AddOrEditFormPageEvents /> },
    { path: "/all-photo-galleries", element: <PhotoGalleries /> },
    { path: "/add-edit-photo-gallery", element: <AddOrEditFormPagePhotoGalleries /> },
    { path: "/all-chorei-messages", element: <ChoreiMessages /> },
    { path: "/add-edit-chorei-message", element: <AddOrEditFormPageChoreiMessages /> },
    { path: "/all-slider-images", element: <SliderImages /> },
    { path: "/add-edit-slider-image", element: <AddOrEditFormPageSliderImages /> },
    { path: "/all-popup-images", element: <PopupImages /> },
    { path: "/add-edit-popup-image", element: <AddOrEditFormPagePopupImages /> },

    // System Management
    { path: "/all-login-details", element: <LoginDetails /> },

    // Meeting Room Management
    { path: "/all-locations", element: <Locations /> },
    { path: "/add-edit-location", element: <AddOrEditFormPageLocations /> },
    { path: "/all-floors", element: <Floors /> },
    { path: "/add-edit-floor", element: <AddOrEditFormPageFloors /> },
    { path: "/all-rooms", element: <Rooms /> },
    { path: "/add-edit-room", element: <AddOrEditFormPageRooms /> },
    { path: "/all-meeting-requests", element: <MeetingRequests /> },
    { path: "/all-meeting-notifications", element: <MeetingNotifications /> },
    { path: "/add-edit-meeting-notification", element: <AddOrEditFormPageMeetingNotifications /> },

    // Emergency Management
    { path: "/all-emergency-response-network", element: <EmergencyResponseNetwork /> },
    { path: "/add-edit-emergency-response-network", element: <AddOrEditFormPageEmergencyResponseNetwork /> },

    // Support Management
    { path: "/all-groups", element: <Groups /> },
    { path: "/add-edit-group", element: <AddOrEditFormPageGroups /> },
    { path: "/all-categories", element: <Category /> },
    { path: "/add-edit-category", element: <AddOrEditFormPageCategory /> },
    { path: "/all-priorities", element: <Priority /> },
    { path: "/add-edit-priority", element: <AddOrEditFormPagePriority /> },
    { path: "/all-cities", element: <City /> },
    { path: "/add-edit-city", element: <AddOrEditFormPageCity /> },

    // Expense Management
    { path: "/all-units", element: <Unit /> },
    { path: "/add-edit-unit", element: <AddOrEditFormPageUnit /> },
    { path: "/all-zones", element: <Zone /> },
    { path: "/add-edit-zone", element: <AddOrEditFormPageZone /> },
    { path: "/all-currencies", element: <Currency /> },
    { path: "/add-edit-currency", element: <AddOrEditFormPageCurrency /> },
    { path: "/all-auditors", element: <AllAuditors /> },
    { path: "/add-edit-auditor", element: <AddOrEditFormPageAllAuditors /> },
    { path: "/all-accountants", element: <AllAccountants /> },
    { path: "/add-edit-accountant", element: <AddOrEditFormPageAllAccountants /> },
    { path: "/all-corporate-claims", element: <AllCorporateClaims /> },
    { path: "/all-sales-claims", element: <AllSalesClaims /> },

    // Expense Policies
    { path: "/all-sales-price-policies", element: <AllSalesPricePolicy /> },
    { path: "/add-edit-sales-policy", element: <AddOrEditFormPageSalesPricePolicy /> },
  ],
};

/**
 * Main App Component
 * Handles routing and authentication state
 * Organized routes into logical groups for better maintainability
 */
export default function App() {
  const { loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Root route - redirect to signin */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Public routes */}
        {routeConfigs.public.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Protected routes wrapped with AppLayout */}
        <Route element={<AppLayout />}>
          {routeConfigs.protected.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Catch-all route for 404 pages */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}