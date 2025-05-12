import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Reward } from "../src/types";

// Backend model structure may have _id instead of id
interface BackendReward {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  pointsRequired: number;
  discountPercentage?: number;
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define response types to match backend
interface RewardsResponse {
  success: boolean;
  rewards: BackendReward[];
  message?: string;
}

interface RewardResponse {
  success: boolean;
  reward: BackendReward;
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

// Helper function to transform backend reward to frontend format
const transformReward = (backendReward: BackendReward): Reward => ({
  id: backendReward._id,
  title: backendReward.title,
  description: backendReward.description,
  image: backendReward.image,
  category: backendReward.category,
  pointsRequired: backendReward.pointsRequired,
  discountPercentage: backendReward.discountPercentage,
  eventId: backendReward.eventId,
  createdAt: backendReward.createdAt,
  updatedAt: backendReward.updatedAt,
});

export const API_REWARD = createApi({
  reducerPath: "API_REWARD",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/reward",
    prepareHeaders: (headers) => {
      // Get the token from localStorage
      const token = localStorage.getItem("admin-token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
        console.log("Adding auth token to request");
      } else {
        console.log("No auth token found in localStorage");
      }
      return headers;
    },
    fetchFn: async (...args) => {
      // Add timeout to fetch requests
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout after 10s")), 10000);
      });

      try {
        // Race between fetch and timeout
        const response = await Promise.race([fetch(...args), timeoutPromise]);
        return response;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
  }),
  tagTypes: ["Reward"],
  endpoints: (builder) => ({
    getRewards: builder.query<Reward[], void>({
      query: () => "/get",
      transformResponse: (response: RewardsResponse) =>
        (response.rewards || []).map(transformReward),
      providesTags: ["Reward"],
    }),

    getReward: builder.query<Reward, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: RewardResponse) =>
        transformReward(response.reward),
      providesTags: ["Reward"],
    }),

    createReward: builder.mutation<Reward, FormData>({
      query: (rewardData) => ({
        url: "/add",
        method: "POST",
        body: rewardData,
      }),
      transformResponse: (response: RewardResponse) =>
        transformReward(response.reward),
      invalidatesTags: ["Reward"],
    }),

    updateReward: builder.mutation<Reward, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: RewardResponse) =>
        transformReward(response.reward),
      invalidatesTags: ["Reward"],
    }),

    deleteReward: builder.mutation<DeleteResponse, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reward"],
    }),
  }),
});

export const {
  useGetRewardsQuery,
  useGetRewardQuery,
  useCreateRewardMutation,
  useUpdateRewardMutation,
  useDeleteRewardMutation,
} = API_REWARD;
