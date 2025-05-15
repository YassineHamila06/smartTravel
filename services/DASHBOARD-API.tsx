// services/DASHBOARD-API.tsx
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface RegisterOverTime {
  labels: string[];
  data: number[];
}
interface MonthlyRevenueItem {
  label: string; // e.g., "May 2025"
  trip: number;
  event: number;
}


interface UserStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    newUsersToday: number;
    activeUsers: number;
    usersByLocation: { [location: string]: number };
    userEngagement: {
      surveysCompleted: number;
      reservationsMade: number;
      communityPosts: number;
      rewardsRedeemed: number;
    };
    registerOverTime: RegisterOverTime;
    userActivity: RegisterOverTime;
    topUsers: { name: string; lastname: string; points: number }[];
    preferenceBreakdown: { _id: string; count: number }[];
  };
}
interface TripStatsResponse {
  totalTrips: number;
  tripTypeBreakdown: { _id: string; count: number }[];
  reservationRevenue: { _id: string; total: number }[];
  reservationsPerMonth: { _id: number; count: number }[];
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5001/" }),
  endpoints: (builder) => ({
    getUserStats: builder.query<UserStatsResponse, void>({
      query: () => "dashboard/user-stats",
    }),
    getTripStats: builder.query<TripStatsResponse, void>({
      query: () => "dashboard/trip-stats",
    }),
    getSurveyStats: builder.query({
      query: () => "dashboard/survey-stats",
    }),
    getRewardStats: builder.query({
      query: () => "dashboard/reward-stats",
    }),
    getCommunityStats: builder.query({
      query: () => "dashboard/community-stats",
    }),
    getReservations: builder.query({
      query: () => "reservation/get",
    }),
    getMonthlyRevenue: builder.query<MonthlyRevenueItem[],void>({
      query: () => "dashboard/monthly-revenue",
    }),
    
  }),
});

export const {
  useGetUserStatsQuery,
  useGetTripStatsQuery,
  useGetSurveyStatsQuery,
  useGetRewardStatsQuery,
  useGetCommunityStatsQuery,
  useGetReservationsQuery,
  useGetMonthlyRevenueQuery,
} = dashboardApi;
