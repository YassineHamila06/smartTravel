import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Interface to match the backend response structure
interface BackendEventReservation {
  eventId: {
    _id: string;
    title: string;
  };
  _id: string;
  userId: {
    _id: string;
    name: string;
    lastname: string;
  };

  numberOfPeople: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled" | "paid";
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for the frontend event reservation model
export interface EventReservation {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  reservationDate: string;
  eventName: string;
  persons: number;
  status: "confirmed" | "pending" | "cancelled" | "paid";
  totalPrice: number;
  paymentMethod?: string;
  notes?: string;
}

// Function to transform backend reservation to frontend model
const transformBackendReservation = (
  backendRes: BackendEventReservation
): EventReservation => ({
  id: backendRes._id,
  clientFirstName: backendRes.userId?.name || "Unknown",
  clientLastName: backendRes.userId?.lastname || "User",
  reservationDate: new Date(backendRes.createdAt).toISOString().split("T")[0],
  eventName: backendRes.eventId?.title || "Unknown Event",
  persons: backendRes.numberOfPeople || 0,
  status: backendRes.status,
  totalPrice: backendRes.totalPrice,
  paymentMethod: backendRes.paymentMethod,
  notes: backendRes.notes,
});

// Function to transform an array of backend reservations
const transformBackendReservations = (
  backendReservations: BackendEventReservation[]
): EventReservation[] => backendReservations.map(transformBackendReservation);

export const API_EVENT_RESERVATION = createApi({
  reducerPath: "API_EVENT_RESERVATION",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/event-reservations",
  }),
  tagTypes: ["EventReservation"],
  endpoints: (builder) => ({
    getEventReservations: builder.query<EventReservation[], void>({
      query: () => "/get",
      transformResponse: (response: { reservations: BackendEventReservation[] }) =>
        transformBackendReservations(response.reservations),      
      providesTags: ["EventReservation"],
    }),

    getEventReservation: builder.query<EventReservation, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: { data: BackendEventReservation }) =>
        transformBackendReservation(response.data),
      providesTags: ["EventReservation"],
    }),

    updateEventReservationStatus: builder.mutation<
      EventReservation,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: { data: BackendEventReservation }) =>
        transformBackendReservation(response.data),
      invalidatesTags: ["EventReservation"],
    }),
  }),
});

export const {
  useGetEventReservationsQuery,
  useGetEventReservationQuery,
  useUpdateEventReservationStatusMutation,
} = API_EVENT_RESERVATION;
