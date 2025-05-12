import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CommunityPost,
  CommunityPostsResponse,
  CommunityPostResponse,
  CommentsResponse,
  LikeResponse,
} from "../src/types";

// Create the API
export const API_COMMUNITY = createApi({
  reducerPath: "API_COMMUNITY",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/community",
    prepareHeaders: (headers) => {
      // Get admin token for admin operations, user token for regular user operations
      const adminToken = localStorage.getItem("admin-token");
      const userToken = localStorage.getItem("user-token");

      // Prioritize admin token for the admin panel
      if (adminToken) {
        headers.set("authorization", `Bearer ${adminToken}`);
      } else if (userToken) {
        headers.set("authorization", `Bearer ${userToken}`);
      }

      return headers;
    },
  }),
  tagTypes: ["CommunityPosts", "Comments"],
  endpoints: (builder) => ({
    // Get all community posts
    getPosts: builder.query<CommunityPost[], void>({
      query: () => "/get",
      transformResponse: (response: CommunityPostsResponse) => response.data,
      providesTags: ["CommunityPosts"],
    }),

    // Add a new post (used by regular users)
    createPost: builder.mutation<CommunityPost, FormData>({
      query: (postData) => ({
        url: "/add",
        method: "POST",
        body: postData,
      }),
      transformResponse: (response: CommunityPostResponse) => response.data,
      invalidatesTags: ["CommunityPosts"],
    }),

    // Like or unlike a post
    likePost: builder.mutation<LikeResponse, string>({
      query: (postId) => ({
        url: `/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["CommunityPosts"],
    }),

    // Get comments for a post
    getComments: builder.query<CommunityPost["comments"], string>({
      query: (postId) => `/${postId}/comments`,
      transformResponse: (response: CommentsResponse) => response.data,
      providesTags: ["Comments"],
    }),

    // Add a comment to a post
    addComment: builder.mutation<
      CommunityPost["comments"],
      { postId: string; text: string }
    >({
      query: ({ postId, text }) => ({
        url: `/${postId}/comment`,
        method: "POST",
        body: { text },
      }),
      transformResponse: (response: CommentsResponse) => response.data,
      invalidatesTags: ["Comments", "CommunityPosts"],
    }),

    // Delete a post (admin functionality)
    deletePost: builder.mutation<void, string>({
      query: (postId) => ({
        url: `/delete/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CommunityPosts"],
    }),
  }),
});

// Export the generated hooks
export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeletePostMutation,
} = API_COMMUNITY;
