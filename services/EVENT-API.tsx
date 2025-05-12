import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Event } from "../src/types";

// Interface to match the backend response structure
interface BackendEvent {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  date: Date;
  time: string;
  isActive: boolean;
  price: number;
}

// Function to transform single backend event to frontend event model
const transformBackendEvent = (backendEvent: BackendEvent): Event => ({
  id: backendEvent._id,
  title: backendEvent.title,
  description: backendEvent.description || "",
  image: backendEvent.image,
  location: backendEvent.location,
  date: backendEvent.date,
  time: backendEvent.time,
  isActive: backendEvent.isActive,
  price:
    typeof backendEvent.price === "string"
      ? parseFloat(backendEvent.price)
      : backendEvent.price,
});

// Function to transform an array of backend events
const transformBackendEvents = (backendEvents: BackendEvent[]): Event[] =>
  backendEvents.map(transformBackendEvent);

export const API_EVENT = createApi({
  reducerPath: "API_EVENT",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/events",
  }),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    getEvents: builder.query<Event[], void>({
      query: () => "/get",
      transformResponse: (response: { data: BackendEvent[] }) =>
        transformBackendEvents(response.data),
      providesTags: ["Event"],
    }),

    getEvent: builder.query<Event, string>({
      query: (id) => `/get/${id}`,
      transformResponse: (response: { data: BackendEvent }) =>
        transformBackendEvent(response.data),
      providesTags: ["Event"],
    }),

    createEvent: builder.mutation<Event, FormData>({
      query: (eventData) => ({
        url: "/add",
        method: "POST",
        body: eventData,
      }),
      transformResponse: (response: { data: BackendEvent }) =>
        transformBackendEvent(response.data),
      invalidatesTags: ["Event"],
    }),

    updateEvent: builder.mutation<Event, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: BackendEvent }) =>
        transformBackendEvent(response.data),
      invalidatesTags: ["Event"],
    }),

    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),

    activateEvent: builder.mutation<Event, string>({
      query: (id) => ({
        url: `/${id}/activate`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: BackendEvent }) =>
        transformBackendEvent(response.data),
      invalidatesTags: ["Event"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useActivateEventMutation,
} = API_EVENT;
