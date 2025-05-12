import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Admin } from "../src/types";

// Define response and login types
interface AdminResponse {
  success: boolean;
  data: Admin | Admin[];
  message?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Password reset interfaces
interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const API_ADMIN = createApi({
  reducerPath: "API_ADMIN",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/admin",
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
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    loginAdmin: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => {
        console.log("Attempting login with credentials:", credentials.email);
        return {
          url: "/login",
          method: "POST",
          body: credentials,
        };
      },
      // Add transformResponse to handle and log the response
      transformResponse: (response: LoginResponse) => {
        console.log("Login response:", response);
        return response;
      },
      // Add transformErrorResponse to better handle and log errors
      transformErrorResponse: (response) => {
        console.error("Login error response:", response);
        return response;
      },
    }),

    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (request) => ({
        url: "/forgot-password",
        method: "POST",
        body: request,
      }),
      transformResponse: (response: ForgotPasswordResponse) => {
        console.log("Forgot password response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Forgot password error:", response);
        return response;
      },
    }),

    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (request) => ({
        url: "/verify-otp",
        method: "POST",
        body: request,
      }),
      transformResponse: (response: VerifyOtpResponse) => {
        console.log("Verify OTP response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Verify OTP error:", response);
        return response;
      },
    }),

    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (request) => ({
        url: "/reset-password",
        method: "POST",
        body: request,
      }),
      transformResponse: (response: ResetPasswordResponse) => {
        console.log("Reset password response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Reset password error:", response);
        return response;
      },
    }),

    getAdmins: builder.query<Admin[], void>({
      query: () => "/get",
      transformResponse: (response: AdminResponse) =>
        Array.isArray(response.data) ? response.data : [response.data],
      providesTags: ["Admin"],
    }),

    getAdmin: builder.query<Admin, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: AdminResponse) => response.data as Admin,
      providesTags: ["Admin"],
    }),

    createAdmin: builder.mutation<Admin, FormData>({
      query: (adminData) => ({
        url: "/add",
        method: "POST",
        body: adminData,
      }),
      transformResponse: (response: AdminResponse) => response.data as Admin,
      invalidatesTags: ["Admin"],
    }),

    updateAdmin: builder.mutation<Admin, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: AdminResponse) => response.data as Admin,
      invalidatesTags: ["Admin"],
    }),

    deleteAdmin: builder.mutation<void, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),

    getMe: builder.query<Admin, void>({
      query: () => "/me",
      transformResponse: (response: AdminResponse) => response.data as Admin,
      providesTags: ["Admin"],
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useGetAdminsQuery,
  useGetAdminQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = API_ADMIN;
