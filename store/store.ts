// src/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { API_TRIP } from "../services/TRIP-API";
import { API_ADMIN } from "../services/ADMIN-API";
import { API_USER } from "../services/USER-API";
import { API_RESERVATION } from "../services/TRIP-RESERVATION-API";
import { API_COMMUNITY } from "../services/COMMUNITY-API";
import { API_EVENT } from "../services/EVENT-API";
import { API_EVENT_RESERVATION } from "../services/EVENT-RESERVATION-API";
import { API_SURVEY } from "../services/SURVEY-API";
import { API_QUESTION } from "../services/QUESTION-API";
import { API_RESPONSE } from "../services/RESPONSE-API";
import { API_REWARD } from "../services/REWARD-API";

export const store = configureStore({
  reducer: {
    [API_TRIP.reducerPath]: API_TRIP.reducer,
    [API_ADMIN.reducerPath]: API_ADMIN.reducer,
    [API_USER.reducerPath]: API_USER.reducer,
    [API_RESERVATION.reducerPath]: API_RESERVATION.reducer,
    [API_COMMUNITY.reducerPath]: API_COMMUNITY.reducer,
    [API_EVENT.reducerPath]: API_EVENT.reducer,
    [API_EVENT_RESERVATION.reducerPath]: API_EVENT_RESERVATION.reducer,
    [API_SURVEY.reducerPath]: API_SURVEY.reducer,
    [API_QUESTION.reducerPath]: API_QUESTION.reducer,
    [API_RESPONSE.reducerPath]: API_RESPONSE.reducer,
    [API_REWARD.reducerPath]: API_REWARD.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      API_TRIP.middleware,
      API_ADMIN.middleware,
      API_USER.middleware,
      API_RESERVATION.middleware,
      API_COMMUNITY.middleware,
      API_EVENT.middleware,
      API_EVENT_RESERVATION.middleware,
      API_SURVEY.middleware,
      API_QUESTION.middleware,
      API_RESPONSE.middleware,
      API_REWARD.middleware
    ),
});

// Types
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
