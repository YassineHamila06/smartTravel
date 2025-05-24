import {
  useGetMonthlyRevenueQuery,
  useGetTripStatsQuery,
  useGetUserStatsQuery,
} from "../../services/DASHBOARD-API";
import RegisterChart from "./charts/RegisterChart";
import UserActivityChart from "./charts/UserActivityChart";
import PreferencePieChart from "./charts/PreferencePieChart";
import TopUsersBarChart from "./charts/TopUsersBarChart";
import TripTypePieChart from "./charts/TripTypePieChart";
import ReservationsPerMonthBar from "./charts/ReservationsPerMonthBar";
import { useGetReservationsQuery } from "../../services/DASHBOARD-API";
import MonthlyRevenueChart from "./charts/MonthlyRevenueChart";

export default function Dashboard() {
  const { data, error, isLoading } = useGetUserStatsQuery();
  const { data: reservationData } = useGetReservationsQuery({});
  console.log("reservationssss", reservationData);
  const { data: tripData, isLoading: loadingTrips } = useGetTripStatsQuery();
  const { data: monthRevenue, isLoading: isMonthRevenueLoading } =
    useGetMonthlyRevenueQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading user stats</p>;
  const stats = data?.data;

  console.log("reservationData", reservationData.reservations);

  const reservationsPerDay =
    reservationData?.reservations?.reduce(
      (acc: { label: string; count: number }[], curr) => {
        const day = new Date(curr.createdAt).toISOString().slice(0, 10); //Ye5ou ken 10"2025-05-02"
        const existing = acc.find((item) => item.label === day);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ label: day, count: 1 });
        }
        return acc;
      },
      []
    ) || [];

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold">📊 Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-4 md:col-span-1">
          <h3 className="text-lg font-semibold mb-2">User Registrations</h3>
          <RegisterChart data={stats?.registerOverTime} />
        </div>
        <div className="bg-white rounded shadow p-4 md:col-span-2 ">
          <h3 className="text-lg font-semibold mb-2">Travel Preferences</h3>
          <PreferencePieChart data={stats?.preferenceBreakdown} />
        </div>

        <div className="bg-white rounded shadow p-4 ">
          <h3 className="text-lg font-semibold mb-2">User Activity</h3>
          <UserActivityChart data={stats?.userActivity} />
        </div>

        
        <div className="bg-white rounded shadow p-4 md:col-span-2 ">
          <h3 className="text-lg font-semibold mb-2">Trip Type Breakdown</h3>
          {loadingTrips ? (
            <p>Loading...</p>
          ) : (
            <TripTypePieChart
              data={
                tripData?.tripTypeBreakdown.filter(
                  (item) => item !== undefined
                ) || []
              }
            />
          )}
        </div>
        <div className="bg-white rounded shadow p-4 md:col-span-2 xl:col-span-3">
          <h3 className="text-lg font-semibold mb-2">Top Users by Points</h3>
          <TopUsersBarChart data={stats?.topUsers} />
        </div>

        <div className="bg-white rounded shadow p-4 md:col-span-3 ">
          <h3 className="text-lg font-semibold mb-2">Reservations per day</h3>
          <ReservationsPerMonthBar data={reservationsPerDay} />
        </div>
      </div>
      <div className="grid gap-4">
        <MonthlyRevenueChart
          data={monthRevenue?.data}
          isLoading={isMonthRevenueLoading}
        />
      </div>
    </div>
  );
}
