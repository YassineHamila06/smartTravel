import { useState } from "react";
import {
  Search,
  Filter,
  ThumbsUp,
  MessageSquare,
  Flag,
  Trash2,
} from "lucide-react";
import {
  useGetPostsQuery,
  useDeletePostMutation,
} from "../../services/COMMUNITY-API";
import { format } from "date-fns";
import { CommunityPost } from "../types";

const CommunityManagement = () => {
  // RTK Query hooks
  const { data: posts = [], isLoading, refetch } = useGetPostsQuery();
  const [deletePost] = useDeletePostMutation();

  // Local state
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter posts based on selected filter and search term
  const filteredPosts = posts
    .filter((post: CommunityPost) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "reported") return post.likes.length > 0; // Using likes as a proxy for reported for now
      if (selectedFilter === "trending")
        return post.comments.length > 3 || post.likes.length > 5;
      return true;
    })
    .filter((post: CommunityPost) => {
      if (!searchTerm) return true;
      return (
        post.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Handler to delete a post
  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Community Management
      </h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="ml-4 px-4 py-2 flex items-center space-x-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>

          {filterOpen && (
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === "all"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setSelectedFilter("reported")}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === "reported"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                Reported
              </button>
              <button
                onClick={() => setSelectedFilter("trending")}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === "trending"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                Trending
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No posts found matching your criteria
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post: CommunityPost) => (
              <div key={post._id} className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      post.user?.profileImage ||
                      "https://i.pravatar.cc/150?img=10"
                    }
                    alt={post.user?.name || "Unknown User"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {post.user?.name || "Unknown User"  }
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                    {post.text && (
                      <p className="mt-2 text-gray-900">{post.text}</p>
                    )}
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post content"
                        className="mt-3 rounded-lg max-h-96 w-full object-cover"
                      />
                    )}
                    <div className="mt-3 flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp size={16} />
                        <span>{post.likes.length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare size={16} />
                        <span>{post.comments.length}</span>
                      </div>
                      {post.likes.length > 10 && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <Flag size={16} />
                          <span>High Engagement</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityManagement;
