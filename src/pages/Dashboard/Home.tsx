// import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
// import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import UpcomingBirthdays from "./UpcomingBirthdays";
import UpcomingAnniversary from "./UpcomingAnniversary";
import Policies from "./Policies";
import News from "./News";
import Events from "./Events";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard | Mann Ka Doctor"
        description="This is the main dashboard for Mann Ka Doctor with upcoming birthdays, anniversaries, policies, news, and events."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">

        <div className="col-span-12 xl:col-span-6">
          <UpcomingBirthdays />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <UpcomingAnniversary />
        </div>

        <div className="col-span-12 xl:col-span-12">
          <Policies />
        </div>

        <div className="col-span-12 xl:col-span-12">
          <News />
        </div>

        <div className="col-span-12 xl:col-span-12">
          <Events />
        </div>




        {/* 
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
        
        */}

      </div>
    </>
  );
}
