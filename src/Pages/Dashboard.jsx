import DashboardCards from "../components/DashboardCards";
import Navbar from "../components/Navbar";
import DailyUsageChart from "../components/DailyUsageChart";
function Dashboard() {
    return (
        <>
            <Navbar />
            <DashboardCards />
            <DailyUsageChart />
        </>
    );

}

export default Dashboard;