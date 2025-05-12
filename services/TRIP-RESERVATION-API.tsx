import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Reservation {
  _id: string;
  tripId: {
    _id: string;
    destination: string;
  };
  userId: {
    _id: string;
    name: string;
    lastname: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "paid";
  createdAt: string;
  numberOfPeople: number;
  totalPrice: number;
  notes?: string;
  paymentMethod?: string;
}

interface ReservationResponse {
  success: boolean;
  reservations: Reservation[];
  message?: string;
}

interface SingleReservationResponse {
  success: boolean;
  reservation: Reservation;
  message?: string;
}

interface UpdateStatusRequest {
  status: "pending" | "confirmed" | "cancelled" | "paid";
}

export const API_RESERVATION = createApi({
  reducerPath: "API_RESERVATION",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/reservation",
    prepareHeaders: (headers) => {
      // Get the admin token from localStorage for authentication
      const token = localStorage.getItem("admin-token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Reservation"],
  endpoints: (builder) => ({
    getReservations: builder.query<Reservation[], void>({
      query: () => "/get",
      transformResponse: (response: ReservationResponse) =>
        response.reservations,
      providesTags: ["Reservation"],
    }),

    getReservationsByStatus: builder.query<Reservation[], string>({
      query: (status) => `/reservations/status/${status}`,
      transformResponse: (response: ReservationResponse) =>
        response.reservations,
      providesTags: ["Reservation"],
    }),

    getReservation: builder.query<Reservation, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: SingleReservationResponse) =>
        response.reservation,
      providesTags: ["Reservation"],
    }),

    updateReservationStatus: builder.mutation<
      Reservation,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/status/${id}`,
        method: "PUT",
        body: { status } as UpdateStatusRequest,
      }),
      transformResponse: (response: SingleReservationResponse) =>
        response.reservation,
      invalidatesTags: ["Reservation"],
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useGetReservationsByStatusQuery,
  useGetReservationQuery,
  useUpdateReservationStatusMutation,
} = API_RESERVATION;
