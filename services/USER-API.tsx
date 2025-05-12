import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User } from "../src/types";

// Backend user response type
interface BackendUser {
  _id?: string;
  id?: string;
  name: string;
  lastname: string;
  email: string;
  profileImage?: string;
  travelPreferences?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const API_USER = createApi({
  reducerPath: "API_USER",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/user",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getusers: builder.query<User[], void>({
      query: () => "/get",
      transformResponse: (response: BackendUser[] | unknown) => {
        console.log("Backend response for users:", response);
        if (!Array.isArray(response)) {
          console.error("Unexpected response format:", response);
          return [];
        }
        return response.map((user: BackendUser) => ({
          id: user._id || user.id || "",
          name: user.name || "Unknown",
          lastname: user.lastname || "User",
          email: user.email || "",
          profileImage: user.profileImage,
          travelPreferences: user.travelPreferences || [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }));
      },
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      },
      providesTags: ["User"],
    }),

    getuser: builder.query<User, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: BackendUser | unknown) => {
        console.log("Backend response for single user:", response);
        if (!response) {
          console.error("Empty user response");
          return {
            id: "",
            name: "Unknown",
            lastname: "User",
            email: "",
            profileImage: undefined,
            travelPreferences: [],
          };
        }
        const user = response as BackendUser;
        return {
          id: user._id || user.id || "",
          name: user.name || "Unknown",
          lastname: user.lastname || "User",
          email: user.email || "",
          profileImage: user.profileImage,
          travelPreferences: user.travelPreferences || [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
      providesTags: ["User"],
    }),

    createuser: builder.mutation<User, FormData>({
      query: (userData) => ({
        url: "/add",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    updateuser: builder.mutation<User, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    deleteuser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetusersQuery,
  useGetuserQuery,
  useCreateuserMutation,
  useUpdateuserMutation,
  useDeleteuserMutation,
} = API_USER;
