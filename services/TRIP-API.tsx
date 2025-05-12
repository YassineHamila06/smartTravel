import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Trip } from "../src/types";

// Interface to match the backend response structure
interface BackendTrip {
  _id: string;
  destination: string;
  description: string;
  price: string | number;
  debutDate: string;
  endDate: string;
  image: string;
  isActive: boolean;
  reduction?: number;
  tripType: string;
  createdAt: string;
  updatedAt: string;
}

// Function to transform backend trip to frontend Trip model
const transformBackendTrip = (backendTrip: BackendTrip): Trip => ({
  id: backendTrip._id,
  destination: backendTrip.destination,
  description: backendTrip.description || "",
  startDate: backendTrip.debutDate,
  endDate: backendTrip.endDate,
  image: backendTrip.image,
  price:
    typeof backendTrip.price === "string"
      ? parseFloat(backendTrip.price)
      : backendTrip.price,
  isAvailable: backendTrip.isActive,
  reduction: backendTrip.reduction || 0,
  tripType: backendTrip.tripType,
});

// Function to transform an array of backend trips
const transformBackendTrips = (backendTrips: BackendTrip[]): Trip[] =>
  backendTrips.map(transformBackendTrip);

export const API_TRIP = createApi({
  reducerPath: "API_TRIP",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/trip",
  }),
  tagTypes: ["Trip"],
  endpoints: (builder) => ({
    getTrips: builder.query<Trip[], void>({
      query: () => "/get",
      transformResponse: (response: { data: BackendTrip[] }) =>
        transformBackendTrips(response.data),
      providesTags: ["Trip"],
    }),

    getTrip: builder.query<Trip, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: { data: BackendTrip }) =>
        transformBackendTrip(response.data),
      providesTags: ["Trip"],
    }),

    createTrip: builder.mutation<Trip, FormData>({
      query: (tripData) => ({
        url: "/add",
        method: "POST",
        body: tripData,
      }),
      transformResponse: (response: { data: BackendTrip }) =>
        transformBackendTrip(response.data),
      invalidatesTags: ["Trip"],
    }),

    updateTrip: builder.mutation<Trip, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: BackendTrip }) =>
        transformBackendTrip(response.data),
      invalidatesTags: ["Trip"],
    }),

    deleteTrip: builder.mutation<void, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trip"],
    }),

    toggleTripStatus: builder.mutation<Trip, string>({
      query: (id) => ({
        url: `/${id}/activate`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: BackendTrip }) =>
        transformBackendTrip(response.data),
      invalidatesTags: ["Trip"],
    }),
  }),
});

export const {
  useGetTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useToggleTripStatusMutation,
} = API_TRIP;
