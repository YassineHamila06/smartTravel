export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  price: number;
  isAvailable: boolean;
  reduction: number;
  image?: any;
  description: string;
  tripType: string;
}

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  profileImage?: string;
  travelPreferences?: string[];

  //only for UI display
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  image: string;

  //only for UI display
  role?: string;
  joinDate?: string;
  lastActive?: string;
  location?: string;
  department?: string;
}

export interface TripFormData {
  destination: string;
  price: number;
  description?: string;
  debutDate: string;
  endDate: string;
  reduction?: number;
  image?: File;
}

export type QuestionType =
  | "short-text"
  | "long-text"
  | "multiple-choice"
  | "checkbox"
  | "dropdown"
  | "linear-scale"
  | "date"
  | "time";

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  surveyId: string;
  text: string;
  options: string[];
  type: QuestionType;
  order: number;
  createdAt?: string;
  updatedAt?: string;

  // These are frontend-only properties for UI purposes
  required?: boolean;
  description?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[] | string[]; // Direct reference to questions instead of sections
  status: "draft" | "published" | "completed";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  numberOfRespondents: number;
}

export interface SurveyAnswer {
  questionId: string;
  userId: string;
  value: string;
  answeredAt?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  userName: string;
  submittedAt: string;
  answers: SurveyAnswer[];
  metadata?: {
    preferredDestination?: string;
    travelStyle?: string;
    budget?: string;
    travelDates?: string;
    groupSize?: number;
    interests?: string[];
    additionalNotes?: string;
  };
}

export interface CommunityPostUser {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface CommunityPostComment {
  _id: string;
  user: CommunityPostUser;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  _id: string;
  user: CommunityPostUser;
  text?: string;
  image?: string;
  likes: string[];
  comments: CommunityPostComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostsResponse {
  success: boolean;
  data: CommunityPost[];
}

export interface CommunityPostResponse {
  success: boolean;
  data: CommunityPost;
}

export interface CommentsResponse {
  success: boolean;
  data: CommunityPostComment[];
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likesCount: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  date: Date;
  time: string;
  isActive: boolean;
  price: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: string;
  discountPercentage?: number;
  eventId?: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}
